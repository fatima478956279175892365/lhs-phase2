import logging
import smtplib
from email.message import EmailMessage

from app.config import get_settings

logger = logging.getLogger(__name__)


def _smtp_ready() -> bool:
    settings = get_settings()
    return bool(
        settings.admin_email
        and settings.smtp_host
        and settings.smtp_from
    )


def send_report_email(
    *,
    post_id: str,
    post_title: str | None,
    post_preview: str,
    category: str | None,
    details: str | None,
    report_count: int,
    hidden: bool,
) -> None:
    settings = get_settings()
    if not _smtp_ready():
        logger.info("Report email skipped — ADMIN_EMAIL or SMTP not configured")
        return

    title = post_title or "Untitled post"
    category_label = category or "unspecified"
    detail_block = details.strip() if details else "No additional details provided."
    status = "Auto-hidden pending review" if hidden else "Visible — review needed"
    review_url = f"{settings.frontend_base_url.rstrip('/')}/stories/{post_id}"

    body = f"""A post was reported on {settings.app_name}.

Post: {title}
Post ID: {post_id}
Category: {category_label}
Status: {status}
Total reports: {report_count}

Details from reporter:
{detail_block}

Preview:
{post_preview[:400]}{"…" if len(post_preview) > 400 else ""}

Review in app: {review_url}
Moderation API: PATCH /api/moderation/posts/{post_id}
"""

    message = EmailMessage()
    message["Subject"] = f"[{settings.app_name}] Report: {title[:60]}"
    message["From"] = settings.smtp_from
    message["To"] = settings.admin_email
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            if settings.smtp_use_tls:
                server.starttls()
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(message)
        logger.info("Report notification email sent for post %s", post_id)
    except Exception:
        logger.exception("Failed to send report notification email for post %s", post_id)
