from datetime import datetime
from typing import List, Optional, Literal, Any
from pydantic import BaseModel, HttpUrl, model_validator

class VideoData(BaseModel):
    url: str
    provider: Literal['youtube', 'storage'] = 'youtube'
    duration: Optional[int] = None

class VideoBase(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    provider: Literal['youtube', 'storage'] = 'youtube'
    thumbnail_url: Optional[str] = None
    published_at: Optional[datetime] = None
    is_active: bool = True
    author: str = "Lamed"

class VideoCreate(VideoBase):
    pass

class Video(VideoBase):
    id: str  # YouTube Video ID or Generated ID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Resource(BaseModel):
    title: str
    type: Literal['pdf', 'pptx', 'infographic', 'doc', 'csv', 'audio', 'image', 'mapa_mental', 'slides', 'guia', 'infografico', 'video']
    url: str

class BundleBase(BaseModel):
    title: str
    description: str
    week_number: int
    author: Optional[str] = "Lamed"
    published_at: Optional[datetime] = None
    video_id: Optional[str] = None # Reference to Video.id
    thumbnail_url: Optional[str] = None
    article_content: Optional[str] = None
    article_url: Optional[str] = None
    resources: List[Resource] = []
    related_video_urls: List[str] = []
    is_active: bool = False

class BundleCreate(BundleBase):
    pass

class Bundle(BundleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ArticleBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    summary: str
    cover_image: str = "assets/Imagens/Fundo_Lamed-total.png"  # URL to Google Drive or other source
    content: str  # HTML content from rich editor
    highlights: List[str] = []
    tags: List[str] = []
    published_at: Optional[datetime] = None
    is_active: bool = True
    author: str = "Lamed"

    @model_validator(mode='before')
    @classmethod
    def map_legacy_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map description -> summary
            if 'summary' not in data and 'description' in data:
                data['summary'] = data['description']
            # Map banner_image_url -> cover_image
            if 'cover_image' not in data and 'banner_image_url' in data:
                data['cover_image'] = data['banner_image_url']
        return data

class ArticleCreate(ArticleBase):
    pass

class Article(ArticleBase):
    id: str
    created_at: datetime
    updated_at: datetime

