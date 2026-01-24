from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, HttpUrl

class VideoData(BaseModel):
    url: str
    provider: Literal['youtube', 'storage'] = 'youtube'
    duration: Optional[int] = None

class Resource(BaseModel):
    title: str
    type: Literal['pdf', 'pptx', 'infographic', 'doc', 'csv', 'audio', 'image']
    url: str

class BundleBase(BaseModel):
    title: str
    description: str
    week_number: int
    author: Optional[str] = "Lamed"
    published_at: Optional[datetime] = None
    video_data: Optional[VideoData] = None
    thumbnail_url: Optional[str] = None
    article_content: Optional[str] = None
    resources: List[Resource] = []
    is_active: bool = False

class BundleCreate(BundleBase):
    pass

class Bundle(BundleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
