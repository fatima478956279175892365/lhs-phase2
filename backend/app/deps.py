from uuid import uuid4

from fastapi import Cookie, Header, Response

VISITOR_COOKIE = "lhs_visitor_id"


def ensure_visitor_id(
    response: Response,
    lhs_visitor_id: str | None = Cookie(default=None, alias=VISITOR_COOKIE),
    x_visitor_id: str | None = Header(default=None, alias="X-Visitor-Id"),
) -> str:
    visitor_id = lhs_visitor_id or x_visitor_id
    if visitor_id:
        # Refresh cookie so same-site proxy setups keep working
        response.set_cookie(
            key=VISITOR_COOKIE,
            value=visitor_id,
            httponly=True,
            samesite="lax",
            max_age=60 * 60 * 24 * 365,
            path="/",
        )
        return visitor_id

    visitor_id = str(uuid4())
    response.set_cookie(
        key=VISITOR_COOKIE,
        value=visitor_id,
        httponly=True,
        samesite="lax",
        max_age=60 * 60 * 24 * 365,
        path="/",
    )
    response.headers["X-Visitor-Id"] = visitor_id
    return visitor_id
