import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


def _database_url() -> str:
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        return url
    # Safe fallback for local dev if DATABASE_URL is missing.
    return "sqlite:///./paper2base.db"


engine = create_engine(
    _database_url(),
    future=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    # Import models to ensure metadata is populated before create_all.
    from app.db import models as _models  # noqa: F401

    Base.metadata.create_all(bind=engine)

