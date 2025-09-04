from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from app.caption.schemas import UploadResponse
from app.caption.services import generate_caption
from app.storage.cloud import upload_image_to_cloudinary
from app.db.database import get_db
from app.db.models import User, Caption
from app.core.security import get_current_user_optional
from typing import Optional
import traceback

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Track guest usage by IP
guest_usage = {}

def validate_image(file: UploadFile):
    """Validate image type and size"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, and GIF are allowed."
        )

    # Check size
    file.file.seek(0, 2)  # Move to end
    size = file.file.tell()
    file.file.seek(0)     # Reset pointer
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File too large. Max size is 10MB."
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
    if request.client:
        ip = request.client.host
    else:
        ip = "unknown"

    # Check guest limit
    if not current_user:
        if guest_usage.get(ip, 0) >= 1:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Guest limit reached. Please login to generate more captions."
            )

    try:
        # Upload image to Cloudinary
        image_url = await upload_image_to_cloudinary(file)

        # Generate caption
        caption_text, confidence = generate_caption(image_url)
        threshold = 0.3
        caption_id = None

        # Only save if confidence is above threshold
        if current_user and confidence >= threshold:
            caption_record = Caption(
                user_id=current_user.id,
                image_url=image_url,
                caption_text=caption_text
            )
            db.add(caption_record)
            db.commit()
            db.refresh(caption_record)
            caption_id = caption_record.id

        elif not current_user and confidence >= threshold:
            guest_usage[ip] = guest_usage.get(ip, 0) + 1

        # Return response based on confidence
        if confidence < threshold:
            return {
                "message": "Caption generated with low confidence",
                "image_url": image_url,
                "caption": None,
                "confidence": confidence,
                "warning": "⚠️ Warning: This image cannot be accurately understood by the model.",
                "caption_id": caption_id
            }
        else:
            return {
                "message": "Caption generated successfully",
                "image_url": image_url,
                "caption": caption_text,
                "confidence": confidence,
                "warning": None,
                "caption_id": caption_id
            }

    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing image: {str(e) or 'Unknown error'}"
        )
