from fastapi import APIRouter
from app.database import get_database

router = APIRouter(prefix="/api/health", tags=["health"])


@router.get("")
async def health_check():
    """Health check endpoint"""
    try:
        database = get_database()
        # Try to ping database
        await database.command("ping")
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

