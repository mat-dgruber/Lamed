from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Response
from typing import List, Optional
from asgiref.sync import sync_to_async
from content.models import Artigo, MaterialEstudo, LessonBundle
from content.utils import create_bundle_zip
from . import schemas
from .schemas import ArticleOut, ArticleCreate, ArticleUpdate, GuideOut, GuideCreate, GuideUpdate
from .dependencies import get_current_user
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth.models import User

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

# ... (Previous Article Routes)

# === STUDY GUIDES (LESSON BUNDLES) ===

@router.get("/bundles", response_model=List[schemas.BundleOut])
def list_bundles():
    bundles = LessonBundle.objects.all().order_by('-published_date')
    # Manually map file URLs if needed, or rely on serializer if field names match
    results = []
    for b in bundles:
        # Helper to get URL or None
        def get_url(field):
            return field.url if field else None
            
        data = schemas.BundleOut.model_validate(b)
        data.file_guide_url = get_url(b.file_guide)
        data.file_slides_url = get_url(b.file_slides)
        data.file_map_url = get_url(b.file_map)
        data.file_infographic_url = get_url(b.file_infographic)
        data.file_flashcards_url = get_url(b.file_flashcards)
        results.append(data)
    return results

@router.get("/bundles/{id}", response_model=schemas.BundleOut)
def get_bundle(id: int):
    try:
        b = LessonBundle.objects.get(id=id)
        def get_url(field):
            return field.url if field else None
        
        data = schemas.BundleOut.model_validate(b)
        data.file_guide_url = get_url(b.file_guide)
        data.file_slides_url = get_url(b.file_slides)
        data.file_map_url = get_url(b.file_map)
        data.file_infographic_url = get_url(b.file_infographic)
        data.file_flashcards_url = get_url(b.file_flashcards)
        return data
    except LessonBundle.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bundle not found")

@router.post("/bundles", response_model=schemas.BundleOut)
def create_bundle(
    title: str = Form(...),
    trimester: str = Form(...),
    lesson_number: int = Form(...),
    youtube_link: Optional[str] = Form(None),
    article_link: Optional[str] = Form(None),
    file_guide: Optional[UploadFile] = File(None),
    file_slides: Optional[UploadFile] = File(None),
    file_map: Optional[UploadFile] = File(None),
    file_infographic: Optional[UploadFile] = File(None),
    file_flashcards: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    # Manual creation to handle files
    bundle = LessonBundle(
        title=title,
        trimester=trimester,
        lesson_number=lesson_number,
        youtube_link=youtube_link,
        article_link=article_link
    )
    if file_guide: bundle.file_guide.save(file_guide.filename, file_guide.file)
    if file_slides: bundle.file_slides.save(file_slides.filename, file_slides.file)
    if file_map: bundle.file_map.save(file_map.filename, file_map.file)
    if file_infographic: bundle.file_infographic.save(file_infographic.filename, file_infographic.file)
    if file_flashcards: bundle.file_flashcards.save(file_flashcards.filename, file_flashcards.file)
    
    bundle.save()
    return get_bundle(bundle.id) # Re-use get logic for formatting

@router.put("/bundles/{id}", response_model=schemas.BundleOut)
def update_bundle(
    id: int,
    title: Optional[str] = Form(None),
    trimester: Optional[str] = Form(None),
    lesson_number: Optional[int] = Form(None),
    youtube_link: Optional[str] = Form(None),
    article_link: Optional[str] = Form(None),
    file_guide: Optional[UploadFile] = File(None),
    file_slides: Optional[UploadFile] = File(None),
    file_map: Optional[UploadFile] = File(None),
    file_infographic: Optional[UploadFile] = File(None),
    file_flashcards: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    try:
        bundle = LessonBundle.objects.get(id=id)
        if title: bundle.title = title
        if trimester: bundle.trimester = trimester
        if lesson_number: bundle.lesson_number = lesson_number
        if youtube_link: bundle.youtube_link = youtube_link
        if article_link: bundle.article_link = article_link
        
        if file_guide: bundle.file_guide.save(file_guide.filename, file_guide.file)
        if file_slides: bundle.file_slides.save(file_slides.filename, file_slides.file)
        if file_map: bundle.file_map.save(file_map.filename, file_map.file)
        if file_infographic: bundle.file_infographic.save(file_infographic.filename, file_infographic.file)
        if file_flashcards: bundle.file_flashcards.save(file_flashcards.filename, file_flashcards.file)
        
        bundle.save()
        return get_bundle(bundle.id)
    except LessonBundle.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bundle not found")

@router.delete("/bundles/{id}")
def delete_bundle(id: int, current_user: User = Depends(get_current_user)):
    try:
        bundle = LessonBundle.objects.get(id=id)
        bundle.delete()
        return {"success": True}
    except LessonBundle.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bundle not found")

@router.get("/bundles/{id}/download")
def download_bundle_zip(id: int):
    try:
        bundle = LessonBundle.objects.get(id=id)
        zip_buffer = create_bundle_zip(bundle)
        filename = f"Kit_Lamed_{bundle.trimester}_Licao_{bundle.lesson_number}.zip"
        
        return Response(
            content=zip_buffer.getvalue(),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except LessonBundle.DoesNotExist:
        raise HTTPException(status_code=404, detail="Bundle not found")
