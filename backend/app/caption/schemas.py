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
    caption: str
    caption_id: Optional[int] 