from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Let Her Speak"
    database_url: str = "sqlite:///./letherspeak.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    moderation_secret: str = "dev-moderation-secret-change-me"
    report_hide_threshold: int = 3
    rate_limit_window_seconds: int = 60
    rate_limit_max_writes: int = 12
    seed_on_startup: bool = True
    frontend_base_url: str = "http://localhost:5173"
    admin_email: str = ""
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_use_tls: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
