import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.db.database import get_db
from app.db.models import User, VerificationToken
from app.services.email_service import send_verification_email

router = APIRouter(tags=["auth"])


class AuthRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    email: str
    credits: int


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _get_current_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from None

    sub = payload.get("sub")
    if not sub or not isinstance(sub, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == sub).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


@router.post("/auth/register", response_model=dict)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    email = _normalize_email(body.email)
    password = (body.password or "").strip()

    if not email or "@" not in email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")
    if len(password) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password too short")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(email=email, hashed_password=hash_password(password), credits=3, is_verified=False)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    vt = VerificationToken(user_id=str(user.id), token=token, expires_at=expires_at)
    db.add(vt)
    db.commit()

    send_verification_email(email, token)

    return {"success": True}


@router.post("/auth/login", response_model=TokenResponse)
def login(body: AuthRequest, db: Session = Depends(get_db)) -> TokenResponse:
    email = _normalize_email(body.email)
    password = (body.password or "").strip()

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email non verificata")

    token = create_access_token(str(user.id))
    return TokenResponse(access_token=token)


@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)) -> dict:
    raw = (token or "").strip()
    if not raw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token mancante")

    vt = db.query(VerificationToken).filter(VerificationToken.token == raw).first()
    if not vt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token non valido")

    now = datetime.now(timezone.utc)
    # vt.expires_at can be naive depending on DB settings; compare defensively.
    exp = vt.expires_at
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token scaduto")

    user = db.query(User).filter(User.id == vt.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Utente non trovato")

    user.is_verified = True
    db.add(user)
    db.delete(vt)
    db.commit()

    return {"success": True}


@router.get("/auth/me", response_model=MeResponse)
def me(user: User = Depends(_get_current_user)) -> MeResponse:
    return MeResponse(email=user.email, credits=int(user.credits))


get_current_user = _get_current_user

