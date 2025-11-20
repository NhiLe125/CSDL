from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.models.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.auth import get_current_admin_user
from app.utils import generate_slug
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/categories", tags=["categories"])


def category_to_response(category: dict) -> CategoryResponse:
    """Convert MongoDB document to CategoryResponse"""
    return CategoryResponse(
        id=str(category["_id"]),
        name=category["name"],
        slug=category["slug"],
        description=category.get("description"),
        image=category.get("image"),
        parent=str(category["parent"]) if category.get("parent") else None,
        is_active=category.get("is_active", True),
        created_at=category.get("created_at", datetime.utcnow()),
        updated_at=category.get("updated_at", datetime.utcnow())
    )


@router.get("", response_model=List[CategoryResponse])
async def get_categories():
    """Get all categories"""
    database = get_database()
    
    cursor = database.categories.find({"is_active": True}).sort("name", 1)
    categories = await cursor.to_list(length=None)
    
    return [category_to_response(c) for c in categories]


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str):
    """Get a single category by ID"""
    database = get_database()
    
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    category = await database.categories.find_one({"_id": ObjectId(category_id)})
    
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    return category_to_response(category)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new category (admin only)"""
    database = get_database()
    
    slug = generate_slug(category_data.name)
    
    # Check if slug exists
    existing = await database.categories.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
    category_dict = {
        "name": category_data.name,
        "slug": slug,
        "description": category_data.description,
        "image": category_data.image,
        "parent": ObjectId(category_data.parent) if category_data.parent else None,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.categories.insert_one(category_dict)
    category_dict["_id"] = result.inserted_id
    
    return category_to_response(category_dict)


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    category_data: CategoryUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a category (admin only)"""
    database = get_database()
    
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    category = await database.categories.find_one({"_id": ObjectId(category_id)})
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    update_dict = {"updated_at": datetime.utcnow()}
    
    if category_data.name is not None:
        update_dict["name"] = category_data.name
        update_dict["slug"] = generate_slug(category_data.name)
    if category_data.description is not None:
        update_dict["description"] = category_data.description
    if category_data.image is not None:
        update_dict["image"] = category_data.image
    if category_data.parent is not None:
        update_dict["parent"] = ObjectId(category_data.parent) if category_data.parent else None
    if category_data.is_active is not None:
        update_dict["is_active"] = category_data.is_active
    
    await database.categories.update_one(
        {"_id": ObjectId(category_id)},
        {"$set": update_dict}
    )
    
    updated_category = await database.categories.find_one({"_id": ObjectId(category_id)})
    return category_to_response(updated_category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a category (admin only)"""
    database = get_database()
    
    if not ObjectId.is_valid(category_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid category ID")
    
    result = await database.categories.delete_one({"_id": ObjectId(category_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    
    return None

