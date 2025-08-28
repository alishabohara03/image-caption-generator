from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.routers import router as auth_router
from app.caption.routers import router as caption_router
from app.history.routers import router as history_router
from app.db.database import engine, Base
from app.core.config import settings


app = FastAPI(title="Image Caption Generator API", version="1.0.0")

origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",

]
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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