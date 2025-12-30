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
django_app = get_asgi_application()

# 3. Rotas da API (Importar de api/routes.py futuramente)
@app.get("/api/health")
def health_check():
    return {"status": "ok", "frameworks": "FastAPI + Django"}


# 4. Montar o Django (Admin e Arquivos Estáticos)
# Necessário configurar STATIC_ROOT e STATIC_URL no settings.py do Django
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/", django_app) 