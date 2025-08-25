from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routers import router as auth_router
from app.caption.routers import router as caption_router
from app.history.routers import router as history_router
from app.db.database import engine, Base
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import settings


app = FastAPI(title="Image Caption Generator API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.jwt_secret_key,
)

# Create tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(caption_router, prefix="/caption", tags=["Caption"])
app.include_router(history_router, prefix="/history", tags=["History"])

@app.get("/")
async def root():
    return {"message": "Image Caption Generator API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)