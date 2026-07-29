import os
import hmac
import logging
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from config import settings
from routes import bundles, admin, articles, videos
from api.dependencies import is_storage_configured

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
origins = [
    "http://localhost:4200",
    "http://localhost:8000",
    "https://lamed-148.web.app",
    "https://lamed-148.firebaseapp.com",
    "https://lamed148.com.br"
]

from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trust proxy headers (X-Forwarded-Proto, etc.) for redirects
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

@app.get("/")
def read_root():
    return {"message": "Lamed Bundle API is running"}


@app.get("/healthz", include_in_schema=False)
def healthz():
    """Liveness probe — process is up."""
    return JSONResponse({"status": "ok"})


@app.get("/readyz", include_in_schema=False)
def readyz():
    """Readiness probe — Firestore reachable, Storage configured."""
    from config import db  # local import to surface init errors loudly
    storage_ok = is_storage_configured()
    status_code = 200 if storage_ok else 503
    return JSONResponse(
        {"status": "ready" if storage_ok else "degraded", "storage": storage_ok},
        status_code=status_code,
    )

app.include_router(bundles.router, prefix="/bundles", tags=["bundles"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(articles.router, prefix="/articles", tags=["articles"])
app.include_router(videos.router, prefix="/videos", tags=["videos"])

@app.post("/api/sync-videos", tags=["system"])
def trigger_video_sync(x_sync_token: str = Header(None)):
    """
    Manually triggers YouTube video synchronization.
    Called by GitHub Actions Cron.
    """
    expected = os.getenv("SYNC_TOKEN")
    if not expected:
        # Fail-closed: if no token is configured, refuse all calls.
        # The previous version only checked when the env var was set,
        # silently accepting unauthenticated requests in prod.
        raise HTTPException(
            status_code=503,
            detail="sync disabled: SYNC_TOKEN environment variable is not configured",
        )
    # Constant-time compare to avoid timing leaks.
    if not hmac.compare_digest(x_sync_token or "", expected):
        raise HTTPException(status_code=403, detail="Invalid sync token")

    from services.youtube_sync import sync_videos
    return sync_videos()

if __name__ == "__main__":
    import uvicorn
    # Allow running directly with `python main.py` or `uv run main.py`
    print("🚀 Starting server via main.py...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
