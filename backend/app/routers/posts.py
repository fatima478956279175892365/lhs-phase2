from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.deps import ensure_visitor_id
from app.models import Comment, Post, Reaction, Report
from app.notifications import send_report_email
from app.rate_limit import client_key, write_limiter
from app.schemas import (
    CommentCreate,
    CommentOut,
    CommunityStats,
    PostCreate,
    PostDetail,
    PostListResponse,
    ReactionResponse,
    ReactionToggle,
    ReportCreate,
    ReportResponse,
)
from app.services import get_visible_post, maybe_auto_hide, reaction_counts, serialize_post_detail, serialize_post_summary

router = APIRouter(prefix="/api", tags=["stories"])

REPORT_CATEGORY_LABELS = {
    "harassment": "Harassment or bullying",
    "personal-info": "Personal or identifying information",
    "harmful": "Harmful or unsafe content",
    "spam": "Spam or off-topic",
    "other": "Other",
}


def format_report_reason(payload: ReportCreate) -> str | None:
    if payload.category:
        label = REPORT_CATEGORY_LABELS.get(payload.category, payload.category)
        if payload.details:
            return f"{label}: {payload.details}"
        return label
    return payload.reason


@router.get("/stats", response_model=CommunityStats)
def community_stats(db: Session = Depends(get_db)) -> CommunityStats:
    stories = db.scalar(select(func.count()).select_from(Post).where(Post.hidden.is_(False))) or 0
    comments = db.scalar(select(func.count()).select_from(Comment)) or 0
    stands = (
        db.scalar(select(func.count()).select_from(Reaction).where(Reaction.kind == "stand_with")) or 0
    )
    helped = (
        db.scalar(select(func.count()).select_from(Reaction).where(Reaction.kind == "this_helped")) or 0
    )
    return CommunityStats(stories=stories, comments=comments, stands=stands, helped=helped)


@router.get("/posts", response_model=PostListResponse)
def list_posts(
    response: Response,
    category: str = Query(default="all"),
    q: str | None = Query(default=None, max_length=120),
    sort: str = Query(default="newest"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=30),
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> PostListResponse:
    query = (
        select(Post)
        .where(Post.hidden.is_(False))
        .options(selectinload(Post.comments), selectinload(Post.reactions))
    )

    if category and category != "all":
        query = query.where(Post.category == category)

    if q:
        pattern = f"%{q.strip()}%"
        query = query.where(or_(Post.content.ilike(pattern), Post.title.ilike(pattern), Post.author_name.ilike(pattern)))

    posts = list(db.scalars(query).unique().all())

    if sort == "most_supported":
        posts.sort(key=lambda post: (sum(1 for r in post.reactions if r.kind == "stand_with"), post.created_at), reverse=True)
    elif sort == "most_discussed":
        posts.sort(key=lambda post: (len(post.comments), post.created_at), reverse=True)
    else:
        posts.sort(key=lambda post: (post.featured, post.created_at), reverse=True)

    total = len(posts)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = posts[start:end]

    return PostListResponse(
        items=[serialize_post_summary(post, visitor_id) for post in page_items],
        total=total,
        page=page,
        page_size=page_size,
        has_more=end < total,
    )


@router.post("/posts", response_model=PostDetail, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: PostCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> PostDetail:
    write_limiter.check(client_key(request, visitor_id))
    post = Post(
        id=str(uuid4()),
        title=payload.title,
        content=payload.content,
        author_name=payload.author_name or "Anonymous",
        category=payload.category,
    )
    db.add(post)
    db.commit()
    post = get_visible_post(db, post.id)
    assert post is not None
    return serialize_post_detail(post, visitor_id)


@router.get("/posts/{post_id}", response_model=PostDetail)
def get_post(
    post_id: str,
    response: Response,
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> PostDetail:
    post = get_visible_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Story not found")
    return serialize_post_detail(post, visitor_id)


@router.get("/posts/{post_id}/comments", response_model=list[CommentOut])
def list_comments(post_id: str, db: Session = Depends(get_db)) -> list[CommentOut]:
    post = get_visible_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Story not found")
    return [
        CommentOut(
            id=comment.id,
            content=comment.content,
            author_name=comment.author_name,
            created_at=comment.created_at,
        )
        for comment in sorted(post.comments, key=lambda item: item.created_at)
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentOut, status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: str,
    payload: CommentCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> CommentOut:
    write_limiter.check(client_key(request, visitor_id))
    post = get_visible_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Story not found")

    comment = Comment(
        id=str(uuid4()),
        post_id=post.id,
        content=payload.content,
        author_name=payload.author_name or "Anonymous Sister",
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentOut(
        id=comment.id,
        content=comment.content,
        author_name=comment.author_name,
        created_at=comment.created_at,
    )


@router.post("/posts/{post_id}/reactions", response_model=ReactionResponse)
def toggle_reaction(
    post_id: str,
    payload: ReactionToggle,
    response: Response,
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> ReactionResponse:
    post = get_visible_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Story not found")

    existing = db.scalar(
        select(Reaction).where(
            Reaction.post_id == post_id,
            Reaction.visitor_id == visitor_id,
            Reaction.kind == payload.kind,
        )
    )

    active = False
    if existing:
        db.delete(existing)
        db.commit()
    else:
        db.add(
            Reaction(
                id=str(uuid4()),
                post_id=post_id,
                visitor_id=visitor_id,
                kind=payload.kind,
            )
        )
        db.commit()
        active = True

    post = get_visible_post(db, post_id)
    assert post is not None
    stand, helped = reaction_counts(post)
    return ReactionResponse(
        kind=payload.kind,
        active=active,
        stand_with_count=stand,
        this_helped_count=helped,
    )


@router.post("/posts/{post_id}/report", response_model=ReportResponse)
def report_post(
    post_id: str,
    payload: ReportCreate,
    background_tasks: BackgroundTasks,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    visitor_id: str = Depends(ensure_visitor_id),
) -> ReportResponse:
    write_limiter.check(client_key(request, visitor_id))
    post = db.scalar(
        select(Post).where(Post.id == post_id).options(selectinload(Post.reports))
    )
    if not post or post.hidden:
        raise HTTPException(status_code=404, detail="Story not found")

    existing = db.scalar(
        select(Report).where(Report.post_id == post_id, Report.visitor_id == visitor_id)
    )
    if existing:
        count = db.scalar(select(func.count()).select_from(Report).where(Report.post_id == post_id)) or 0
        return ReportResponse(
            message="You've already reported this post. Our team may still be reviewing it.",
            report_count=count,
            hidden=post.hidden,
            already_reported=True,
        )

    reason = format_report_reason(payload)
    db.add(
        Report(
            id=str(uuid4()),
            post_id=post_id,
            visitor_id=visitor_id,
            reason=reason,
        )
    )
    db.commit()
    hidden = maybe_auto_hide(db, post)
    count = db.scalar(select(func.count()).select_from(Report).where(Report.post_id == post_id)) or 0

    background_tasks.add_task(
        send_report_email,
        post_id=post.id,
        post_title=post.title,
        post_preview=post.content,
        category=payload.category,
        details=payload.details or payload.reason,
        report_count=count,
        hidden=hidden,
    )

    return ReportResponse(
        message=(
            "Thank you. This post was hidden while our team reviews it."
            if hidden
            else "Thank you. Your report was sent to our moderation team."
        ),
        report_count=count,
        hidden=hidden,
        already_reported=False,
    )
