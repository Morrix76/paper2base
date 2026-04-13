import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_BACKEND_ROOT / ".env")


def _parse_cors_origins(raw: str | None) -> list[str]:
    if not raw or not raw.strip():
        return ["http://localhost:5173", "http://127.0.0.1:5173"]
    return [o.strip() for o in raw.split(",") if o.strip()]


def get_settings() -> dict:
    return {
        "api_title": os.getenv("API_TITLE", "PDF-to-JSON API"),
        "api_version": os.getenv("API_VERSION", "0.1.0"),
        "cors_origins": _parse_cors_origins(os.getenv("CORS_ORIGINS")),
        "openai_api_key": os.getenv("OPENAI_API_KEY", ""),
        "openai_model": os.getenv("OPENAI_MODEL", "gpt-4o"),
        "database_url": os.getenv("DATABASE_URL", ""),
        "jwt_secret": os.getenv("JWT_SECRET", ""),
        "resend_api_key": os.getenv("RESEND_API_KEY", ""),
        "resend_from": os.getenv("RESEND_FROM", ""),
        "app_url": os.getenv("APP_URL", "http://localhost:5173"),
        "frontend_url": os.getenv("FRONTEND_URL", ""),
    }
