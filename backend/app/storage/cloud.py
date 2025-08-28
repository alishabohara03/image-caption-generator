import cloudinary
import cloudinary.uploader
from fastapi import UploadFile
import uuid
from app.core.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

async def upload_image_to_cloudinary(file: UploadFile) -> str:
    """Upload image to Cloudinary and return URL"""
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    
    # Upload to Cloudinary
    result = cloudinary.uploader.upload(
        file.file,
        public_id=unique_filename,
        resource_type="image",
        folder="image_captions"
    )
    
    return result["secure_url"]