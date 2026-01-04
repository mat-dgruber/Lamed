import os
import django
from django.core.asgi import get_asgi_application
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# 1. Configurar Django antes de tudo
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# 2. Inicializar Apps
app = FastAPI(title="Lamed API", version="1.0.0")

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import json

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"VALIDATION ERROR: {json.dumps(exc.errors(), indent=2)}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

django_app = get_asgi_application()

# 3. Rotas da API
from api.router import router as api_router
app.include_router(api_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "frameworks": "FastAPI + Django"}


# 4. Montar o Django (Admin e Arquivos Estáticos)
# Necessário configurar STATIC_ROOT e STATIC_URL no settings.py do Django
from pathlib import Path

# ... (existing imports)

# Ensure static directory exists
static_path = Path(__file__).parent / "static"
static_path.mkdir(parents=True, exist_ok=True)

app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
app.mount("/", django_app) 