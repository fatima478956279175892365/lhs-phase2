from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models import Post
from app.schemas import HealthResponse, ModerationAction, SafetyResource
from app.seed_data import SAFETY_RESOURCES

router = APIRouter(tags=["system"])


@router.get("/api/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)) -> HealthResponse:
    settings = get_settings()
    try:
        db.execute(text("SELECT 1"))
        return HealthResponse(status="ok", database="up", app=settings.app_name)
    except Exception:
        return HealthResponse(status="degraded", database="down", app=settings.app_name)


@router.get("/api/safety", response_model=list[SafetyResource])
def safety_resources() -> list[SafetyResource]:
    return [SafetyResource(**item) for item in SAFETY_RESOURCES]


@router.patch("/api/moderation/posts/{post_id}", response_model=ModerationAction)
def moderate_post(
    post_id: str,
    payload: ModerationAction,
    db: Session = Depends(get_db),
    x_moderation_secret: str | None = Header(default=None),
) -> ModerationAction:
    settings = get_settings()
    if not x_moderation_secret or x_moderation_secret != settings.moderation_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Story not found")

    post.hidden = payload.hidden
    db.add(post)
    db.commit()
    return ModerationAction(hidden=post.hidden)
