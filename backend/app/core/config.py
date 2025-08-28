from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440
    
    cloudinary_cloud_name: str
    cloudinary_api_key: str
    cloudinary_api_secret: str
    
    class Config:
        env_file = ".env"


settings = Settings()