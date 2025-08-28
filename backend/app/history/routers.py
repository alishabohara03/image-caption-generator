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

# @router.get("/all", response_model=PaginatedHistoryResponse)
# async def get_all_history(
#     page: int = Query(1, ge=1),
#     limit: int = Query(10, ge=1, le=100),
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """Get paginated history for logged-in user"""
    
#     # Calculate offset
#     offset = (page - 1) * limit
    
#     # Get total count
#     total = db.query(Caption).filter(Caption.user_id == current_user.id).count()
    
#     # Get paginated results
#     captions = db.query(Caption).filter(
#         Caption.user_id == current_user.id
#     ).order_by(desc(Caption.created_at)).offset(offset).limit(limit).all()
    
#     # Calculate total pages
#     total_pages = math.ceil(total / limit)
    
#     return {
#         "items": captions,
#         "total": total,
#         "page": page,
#         "limit": limit,
#         "total_pages": total_pages
#     }