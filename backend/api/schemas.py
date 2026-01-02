from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    summary: Optional[str] = None
    banner_path: Optional[str] = None
    tags: List[str] = []
    published: bool = False
    author_id: Optional[int] = None
    published_date: Optional[datetime] = None

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(ArticleBase):
    pass

class ArticleOut(ArticleBase):
    id: int
    published_date: datetime

    class Config:
        from_attributes = True

class GuideBase(BaseModel):
    title: str
    download_url: str
    trimester: str
    lesson_number: int
    description: Optional[str] = None
    published: bool = False

class GuideCreate(GuideBase):
    pass

class GuideUpdate(GuideBase):
    pass

class GuideOut(GuideBase):
    id: int
    published_date: datetime

    class Config:
        from_attributes = True

class BundleBase(BaseModel):
    title: str
    trimester: str
    lesson_number: int
    youtube_link: Optional[str] = None
    article_link: Optional[str] = None

class BundleCreate(BundleBase):
    pass

class BundleUpdate(BundleBase):
    pass

class BundleOut(BundleBase):
    id: int
    slug: str
    published_date: datetime
    # File URLs - populated manually in router or via property if available
    file_guide_url: Optional[str] = None
    file_slides_url: Optional[str] = None
    file_map_url: Optional[str] = None
    file_infographic_url: Optional[str] = None
    file_flashcards_url: Optional[str] = None

    class Config:
        from_attributes = True

