from fastapi import APIRouter, Depends, HTTPException
from typing import List
from asgiref.sync import sync_to_async
from content.models import Artigo, MaterialEstudo
from .schemas import ArticleOut, ArticleCreate, ArticleUpdate, GuideOut, GuideCreate, GuideUpdate
from .dependencies import get_current_user
from django.utils import timezone
from django.db.models import Q

router = APIRouter()

# --- Helpers (Sync to Async) ---
@sync_to_async
def get_all_articles():
    return list(Artigo.objects.all().order_by('-data_publicado'))

@sync_to_async
def get_article_by_slug(slug: str):
    try:
        return Artigo.objects.get(slug=slug)
    except Artigo.DoesNotExist:
        return None

@sync_to_async
def create_article_orm(data: ArticleCreate, user):
    return Artigo.objects.create(
        titulo=data.title,
        slug=data.slug,
        conteudo=data.content,
        resumo=data.summary or "",
        banner_path=data.banner_path,
        tags=data.tags,
        publicado=data.published,
        autor=user, # Assign actual user
        data_publicado=data.published_date or timezone.now()
    )

@sync_to_async
def update_article_orm(slug, data: ArticleUpdate):
    try:
        article = Artigo.objects.get(slug=slug)
        article.titulo = data.title
        article.conteudo = data.content
        article.resumo = data.summary or ""
        article.banner_path = data.banner_path
        article.tags = data.tags
        article.publicado = data.published
        if data.published_date:
            article.data_publicado = data.published_date
        article.save()
        return article
    except Artigo.DoesNotExist:
        return None

@sync_to_async
def delete_article_orm(slug):
    try:
        article = Artigo.objects.get(slug=slug)
        article.delete()
        return True
    except Artigo.DoesNotExist:
        return False

# --- Endpoints ---

@router.get("/articles", response_model=List[ArticleOut])
async def list_articles():
    articles = await get_all_articles()
    # Map Django model to Pydantic
    return [
        ArticleOut(
            title=a.titulo,
            slug=a.slug,
            content=a.conteudo,
            summary=a.resumo,
            banner_path=a.banner_path,
            tags=a.tags,
            published=a.publicado,
            published_date=a.data_publicado,
            id=a.id
        ) for a in articles
    ]

@router.get("/articles/{slug}", response_model=ArticleOut)
async def get_article(slug: str):
    article = await get_article_by_slug(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    return ArticleOut(
        title=article.titulo,
        slug=article.slug,
        content=article.conteudo,
        summary=article.resumo,
        banner_path=article.banner_path,
        tags=article.tags,
        published=article.publicado,
        published_date=article.data_publicado,
        id=article.id
    )

@router.post("/articles", response_model=ArticleOut)
async def create_article(article: ArticleCreate, user = Depends(get_current_user)):
    new_article = await create_article_orm(article, user)
    return ArticleOut(
        title=new_article.titulo,
        slug=new_article.slug,
        content=new_article.conteudo,
        summary=new_article.resumo,
        banner_path=new_article.banner_path,
        tags=new_article.tags,
        published=new_article.publicado,
        published_date=new_article.data_publicado,
        id=new_article.id
    )

@router.put("/articles/{slug}", response_model=ArticleOut)
async def update_article(slug: str, article: ArticleUpdate, user = Depends(get_current_user)):
    updated = await update_article_orm(slug, article)
    if not updated:
        raise HTTPException(status_code=404, detail="Article not found")
    return ArticleOut(
        title=updated.titulo,
        slug=updated.slug,
        content=updated.conteudo,
        summary=updated.resumo,
        banner_path=updated.banner_path,
        tags=updated.tags,
        published=updated.publicado,
        published_date=updated.data_publicado,
        id=updated.id
    )

@router.delete("/articles/{slug}")
async def delete_article(slug: str, user = Depends(get_current_user)):
    success = await delete_article_orm(slug)
    if not success:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"status": "deleted"}

# --- Guides Endpoints (Simplified for brevity, similar pattern) ---

@sync_to_async
def get_all_guides():
    return list(MaterialEstudo.objects.all().order_by('-data_publicado'))

@router.get("/guides", response_model=List[GuideOut])
async def list_guides():
    guides = await get_all_guides()
    return [
        GuideOut(
            title=g.titulo,
            download_url=g.arquivo_url,
            trimester=g.trimestre,
            lesson_number=g.licao_numero,
            description=g.descricao,
            published=g.publicado,
            published_date=g.data_publicado,
            id=g.id
        ) for g in guides
    ]

# Implement methods for Create/Update/Delete guides similarly as needed
