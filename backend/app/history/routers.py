from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.history.schemas import RecentHistoryResponse, PaginatedHistoryResponse, HistoryItem
from app.db.database import get_db
from app.db.models import User, Caption
from app.core.security import get_current_user
import math

router = APIRouter()

@router.get("/recent", response_model=RecentHistoryResponse)
async def get_recent_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get last 3 uploads for logged-in user"""
    
    recent_captions = db.query(Caption).filter(
        Caption.user_id == current_user.id
    ).order_by(desc(Caption.created_at)).limit(3).all()
    
    return {
        "items": recent_captions,
        "count": len(recent_captions)
    }
