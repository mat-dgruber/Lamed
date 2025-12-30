from fastapi import FastAPI, APIRouter
from content.models import Artigo
from asgiref.sync import sync_to_async

router = APIRouter()