import os
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from app.auth import get_current_active_user
from app.config import settings
from pathlib import Path
import aiofiles
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/upload", tags=["upload"])

# Create upload directory if it doesn't exist
upload_dir = Path(settings.upload_dir)
upload_dir.mkdir(parents=True, exist_ok=True)


@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_active_user)
):
    """Upload a file (image)"""
    # Check file type
    if file.content_type not in settings.allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions)}"
        )
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename
    
    # Save file
    content = await file.read()
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Return file URL
    file_url = f"/api/upload/{unique_filename}"
    
    return {
        "filename": unique_filename,
        "url": file_url,
        "content_type": file.content_type,
        "size": len(content)
    }


@router.get("/{filename}")
async def get_file(filename: str):
    """Get uploaded file"""
    file_path = upload_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type='image/jpeg'
    )

