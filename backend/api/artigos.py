from fastapi import FastAPI, APIRouter, Depends
from content.models import Artigo
from asgiref.sync import sync_to_async
from config.authentificator import FirebaseAuthentication

router = APIRouter()

@router.get("/artigos")
async def listar_artigos():
     # Usa o ORM do Django de forma assíncrona
     artigos = await sync_to_async(list)(Artigo.objects.all())
     return artigos

@router.post("/artigos")
async def criar_artigo(artigo: Artigo, user: User = Depends(FirebaseAuthentication())):
     artigo.autor = user
     artigo.save()
     return artigo
     
     
     
     

app = FastAPI()
app.include_router(router, prefix="/api")


