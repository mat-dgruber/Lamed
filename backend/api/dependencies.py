"""
Shared FastAPI dependencies.

Currently provides:
- `get_admin`    : validates Firebase ID Token + admin custom claim
- `get_storage`  : Firebase Storage bucket (for signed upload URLs)
"""
from __future__ import annotations

import os
import logging
from typing import Optional

import firebase_admin  # noqa: F401  (ensures firebase init via config)
from firebase_admin import auth as fb_auth, storage
from fastapi import Depends, Header, HTTPException, status

from config import db  # noqa: F401  (import-side-effect to init Firebase)

logger = logging.getLogger(__name__)


def _claim_admin(claims: dict) -> bool:
    """Custom-claim convention: `admin: True` (set via Firebase Auth)."""
    return bool(claims.get("admin"))


def get_admin(authorization: Optional[str] = Header(default=None)) -> dict:
    """
    Validates a Bearer Firebase ID Token.
    Returns the decoded token `{uid, email, ...}` for handlers that want it.
    Raises 401 / 403 on failure.

    Usage:
        @router.post("/", dependencies=[Depends(get_admin)])
        def create_article(...): ...
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ", 1)[1].strip()
    try:
        decoded = fb_auth.verify_id_token(token)
    except Exception as e:
        logger.warning("Invalid ID token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not _claim_admin(decoded):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required",
        )
    return decoded


def get_storage_bucket():
    """Returns the default Firebase Storage bucket, or raises 503 if unavailable."""
    try:
        return storage.bucket()
    except Exception as e:
        logger.error("Storage bucket unavailable: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Firebase Storage is not configured on this environment. "
                "Set FIREBASE_STORAGE_BUCKET or initialize the Admin SDK "
                "with a 'storageBucket' option."
            ),
        )


def is_storage_configured() -> bool:
    """Cheap probe used by /readyz."""
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET") or "lamed-148.firebasestorage.app"
    try:
        storage.bucket(bucket_name)  # raises if app not initialized with bucket
        return True
    except Exception:
        return False
