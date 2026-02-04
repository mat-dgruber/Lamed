from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import bundles, admin

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
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Lamed Bundle API is running"}

app.include_router(bundles.router, prefix="/bundles", tags=["bundles"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

if __name__ == "__main__":
    import uvicorn
    # Allow running directly with `python main.py` or `uv run main.py`
    print("🚀 Starting server via main.py...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
