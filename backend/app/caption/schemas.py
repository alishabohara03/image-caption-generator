from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CaptionResponse(BaseModel):
    id: int
    image_url: str
    caption_text: str
    created_at: datetime
    user_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    image_url: str
    caption: Optional[str]  # <-- fixed: now optional
    caption_id: Optional[int]
    warning: Optional[str] = None  # <-- added to handle low-confidence warnings
