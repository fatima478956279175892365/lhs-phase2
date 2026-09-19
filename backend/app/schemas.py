from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

CATEGORIES = {
    "all",
    "seeking-advice",
    "work",
    "home-marriage",
    "daily-life",
    "lessons",
    "support",
    "other",
}

ReactionKind = Literal["stand_with", "this_helped"]
SortOption = Literal["newest", "most_supported", "most_discussed"]


class CommentCreate(BaseModel):
    content: str = Field(min_length=2, max_length=1200)
    author_name: str | None = Field(default=None, max_length=80)

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Comment is too short")
        return cleaned

    @field_validator("author_name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class PostCreate(BaseModel):
    title: str | None = Field(default=None, max_length=160)
    content: str = Field(min_length=20, max_length=5000)
    author_name: str | None = Field(default=None, max_length=80)
    category: str = Field(default="seeking-advice")

    @field_validator("title")
    @classmethod
    def strip_title(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("content")
    @classmethod
    def strip_content(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 20:
            raise ValueError("Story must be at least 20 characters")
        return cleaned

    @field_validator("author_name")
    @classmethod
    def strip_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        if value not in CATEGORIES - {"all"}:
            raise ValueError("Invalid category")
        return value


ReportCategory = Literal["harassment", "personal-info", "harmful", "spam", "other"]


class ReportCreate(BaseModel):
    category: ReportCategory | None = None
    details: str | None = Field(default=None, max_length=280)
    reason: str | None = Field(default=None, max_length=280)

    @field_validator("details", "reason")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class ReactionToggle(BaseModel):
    kind: ReactionKind = "stand_with"


class CommentOut(BaseModel):
    id: str
    content: str
    author_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PostSummary(BaseModel):
    id: str
    title: str | None
    content: str
    author_name: str
    category: str
    featured: bool
    created_at: datetime
    comment_count: int
    stand_with_count: int
    this_helped_count: int
    visitor_stood_with: bool = False
    visitor_marked_helped: bool = False
    preview_comments: list[CommentOut] = []


class PostDetail(PostSummary):
    comments: list[CommentOut]


class PostListResponse(BaseModel):
    items: list[PostSummary]
    total: int
    page: int
    page_size: int
    has_more: bool


class ReactionResponse(BaseModel):
    kind: ReactionKind
    active: bool
    stand_with_count: int
    this_helped_count: int


class ReportResponse(BaseModel):
    message: str
    report_count: int
    hidden: bool
    already_reported: bool = False


class CommunityStats(BaseModel):
    stories: int
    comments: int
    stands: int
    helped: int


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    database: Literal["up", "down"]
    app: str


class ModerationAction(BaseModel):
    hidden: bool


class SafetyResource(BaseModel):
    title: str
    description: str
    url: str | None = None
    region: str = "Global"
