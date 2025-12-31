from FastAPI import APIRouter
from content.models import MaterialEstudo
from asgiref.sync import sync_to_async

router = APIRouter()

@router.get("/guias-de-estudo")
async def listar_guias_de_estudo():
     # Usa o ORM do Django de forma assíncrona
     guias = await sync_to_async(list)(MaterialEstudo.objects.all())
     return guias

app = FastAPI()
app.include_router(router, prefix="/api")