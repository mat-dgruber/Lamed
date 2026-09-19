import logging
from typing import Optional
from fastapi import APIRouter, Depends, Query
from api.dependencies import get_admin
from services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"], dependencies=[Depends(get_admin)])

@router.get("/status")
def get_analytics_status(_admin=Depends(get_admin)):
    """Verifica se a integração com o Google Analytics Data API está ativa."""
    return {
        "configured": analytics_service.is_configured(),
        "property_id": analytics_service.property_id or None,
    }

@router.get("/overview")
def get_overview(
    days: int = Query(default=30, ge=1, le=90),
    refresh: bool = Query(default=False, description="Força a atualização ignorando o cache em memória"),
    _admin=Depends(get_admin)
):
    """Retorna métricas gerais consolidadas do Google Analytics (com cache de 5min)."""
    return analytics_service.get_overview(days=days, force_refresh=refresh)

@router.get("/realtime")
def get_realtime(
    refresh: bool = Query(default=False, description="Força a atualização ignorando o cache"),
    _admin=Depends(get_admin)
):
    """Retorna contagem de usuários ativos em tempo real no site."""
    return analytics_service.get_realtime(force_refresh=refresh)

@router.get("/top-content")
def get_top_content(
    limit: int = Query(default=10, ge=1, le=50),
    days: int = Query(default=30, ge=1, le=90),
    refresh: bool = Query(default=False, description="Força a atualização ignorando o cache"),
    _admin=Depends(get_admin)
):
    """Retorna o ranking de páginas e conteúdos mais acessados (com cache de 5min)."""
    return analytics_service.get_top_content(limit=limit, days=days, force_refresh=refresh)

@router.get("/traffic-sources")
def get_traffic_sources(
    days: int = Query(default=30, ge=1, le=90),
    refresh: bool = Query(default=False, description="Força a atualização ignorando o cache"),
    _admin=Depends(get_admin)
):
    """Retorna a distribuição de canais e fontes de tráfego (com cache de 5min)."""
    return analytics_service.get_traffic_sources(days=days, force_refresh=refresh)

@router.post("/cache/clear")
def clear_cache(_admin=Depends(get_admin)):
    """Limpa o cache em memória das métricas analíticas."""
    analytics_service.clear_cache()
    return {"message": "Cache de analytics limpo com sucesso."}

