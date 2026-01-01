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
