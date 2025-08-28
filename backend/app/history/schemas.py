from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class HistoryItem(BaseModel):
    id: int
    image_url: str
    caption_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RecentHistoryResponse(BaseModel):
    items: List[HistoryItem]
    count: int

class PaginatedHistoryResponse(BaseModel):
    items: List[HistoryItem]
    total: int
    page: int
    limit: int
    total_pages: int