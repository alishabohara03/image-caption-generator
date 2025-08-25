from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.caption.schemas import UploadResponse
from app.caption.services import caption_generator
from app.storage.cloud import upload_image_to_cloudinary
from app.db.database import get_db
from app.db.models import User, Caption
from app.core.security import get_current_user_optional
from typing import Optional
from fastapi import Request

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_image(file: UploadFile):
    """Validate image type and size"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and GIF are allowed."
        )
    
   

@router.post("/upload", response_model=UploadResponse)
async def upload_and_caption(
    request: Request,
    file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # Validate image
    validate_image(file)

    try:
        # Upload image to Cloudinary
        image_url = await upload_image_to_cloudinary(file)

        # Generate caption
        caption_text = caption_generator.generate_caption(image_url)

        if not current_user:
            # Check if guest already used their free caption
            if request.session.get("used_caption", False):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Guests can only generate one caption per session. Please log in to continue."
                )
            
            # Mark as used for this session
            request.session["used_caption"] = True

            # Return without saving to DB
            return {
                "message": "Caption generated (guest - not saved)",
                "image_url": image_url,
                "caption": caption_text,
                "caption_id": None
            }

        # Logged-in user → save to DB
        caption_record = Caption(
            user_id=current_user.id,
            image_url=image_url,
            caption_text=caption_text
        )
        db.add(caption_record)
        db.commit()
        db.refresh(caption_record)

        return {
            "message": "Caption generated successfully",
            "image_url": image_url,
            "caption": caption_text,
            "caption_id": caption_record.id
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e)}"
        )
