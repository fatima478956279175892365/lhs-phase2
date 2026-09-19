from __future__ import annotations

from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.models import Comment, Post, Reaction, Report
from app.schemas import CommentOut, PostDetail, PostSummary
from app.seed_data import SEED_COMMENTS, SEED_POSTS, SEED_REACTIONS


def serialize_comment(comment: Comment) -> CommentOut:
    return CommentOut(
        id=comment.id,
        content=comment.content,
        author_name=comment.author_name,
        created_at=comment.created_at,
    )


def reaction_counts(post: Post) -> tuple[int, int]:
    stand = sum(1 for reaction in post.reactions if reaction.kind == "stand_with")
    helped = sum(1 for reaction in post.reactions if reaction.kind == "this_helped")
    return stand, helped


def visitor_flags(post: Post, visitor_id: str) -> tuple[bool, bool]:
    stood = any(
        reaction.visitor_id == visitor_id and reaction.kind == "stand_with" for reaction in post.reactions
    )
    helped = any(
        reaction.visitor_id == visitor_id and reaction.kind == "this_helped" for reaction in post.reactions
    )
    return stood, helped


def serialize_post_summary(post: Post, visitor_id: str, preview_limit: int = 2) -> PostSummary:
    stand, helped = reaction_counts(post)
    stood, marked = visitor_flags(post, visitor_id)
    visible_comments = sorted(post.comments, key=lambda item: item.created_at)
    return PostSummary(
        id=post.id,
        title=post.title,
        content=post.content,
        author_name=post.author_name,
        category=post.category,
        featured=post.featured,
        created_at=post.created_at,
        comment_count=len(post.comments),
        stand_with_count=stand,
        this_helped_count=helped,
        visitor_stood_with=stood,
        visitor_marked_helped=marked,
        preview_comments=[serialize_comment(comment) for comment in visible_comments[:preview_limit]],
    )


def serialize_post_detail(post: Post, visitor_id: str) -> PostDetail:
    summary = serialize_post_summary(post, visitor_id, preview_limit=0)
    comments = [serialize_comment(comment) for comment in sorted(post.comments, key=lambda item: item.created_at)]
    return PostDetail(**summary.model_dump(), comments=comments)


def get_visible_post(db: Session, post_id: str) -> Post | None:
    return db.scalar(
        select(Post)
        .where(Post.id == post_id, Post.hidden.is_(False))
        .options(selectinload(Post.comments), selectinload(Post.reactions))
    )


def maybe_auto_hide(db: Session, post: Post) -> bool:
    settings = get_settings()
    report_count = db.scalar(select(func.count()).select_from(Report).where(Report.post_id == post.id)) or 0
    if report_count >= settings.report_hide_threshold and not post.hidden:
        post.hidden = True
        db.add(post)
        db.commit()
        db.refresh(post)
        return True
    return post.hidden


def seed_database(db: Session) -> None:
    existing = db.scalar(select(func.count()).select_from(Post)) or 0
    if existing > 0:
        return

    created_posts: list[Post] = []
    for item in SEED_POSTS:
        post = Post(
            id=str(uuid4()),
            title=item["title"],
            content=item["content"],
            author_name=item["author_name"],
            category=item["category"],
            featured=bool(item.get("featured")),
        )
        db.add(post)
        created_posts.append(post)

    db.flush()

    for item in SEED_COMMENTS:
        post = created_posts[item["post_index"]]
        db.add(
            Comment(
                id=str(uuid4()),
                post_id=post.id,
                author_name=item["author_name"],
                content=item["content"],
            )
        )

    for post_index, visitor_id, kind in SEED_REACTIONS:
        post = created_posts[post_index]
        db.add(
            Reaction(
                id=str(uuid4()),
                post_id=post.id,
                visitor_id=visitor_id,
                kind=kind,
            )
        )

    db.commit()
