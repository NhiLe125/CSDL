from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.database import get_database
from app.models.product import ProductCreate, ProductUpdate, ProductResponse
from app.auth import get_current_active_user, get_current_admin_user
from app.utils import generate_slug
from bson import ObjectId
from datetime import datetime
import math

router = APIRouter(prefix="/api/products", tags=["products"])


def product_to_response(product: dict) -> ProductResponse:
    """Convert MongoDB document to ProductResponse"""
    return ProductResponse(
        id=str(product["_id"]),
        name=product["name"],
        slug=product["slug"],
        description=product["description"],
        price=product["price"],
        currency=product.get("currency", "VND"),
        discount=product.get("discount", 0.0),
        category=str(product["category"]) if product.get("category") else None,
        tags=product.get("tags", []),
        brand=product.get("brand"),
        images=product.get("images", []),
        specs=product.get("specs", {}),
        stock=product.get("stock", 0),
        rating=product.get("rating", 0.0),
        reviews_count=product.get("reviews_count", 0),
        created_at=product.get("created_at", datetime.utcnow()),
        updated_at=product.get("updated_at", datetime.utcnow())
    )


@router.get("", response_model=dict)
async def get_products(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category ID"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    sort: Optional[str] = Query("created_at", description="Sort field (price, created_at, rating, name)"),
    order: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get products with search, filter, and pagination"""
    database = get_database()
    
    # Build query
    query = {}
    
    if q:
        query["$text"] = {"$search": q}
    
    if category:
        query["category"] = ObjectId(category)
    
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    
    if brand:
        query["brand"] = {"$regex": brand, "$options": "i"}
    
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query["tags"] = {"$in": tag_list}
    
    # Sort
    sort_order = -1 if order == "desc" else 1
    sort_field_map = {
        "price": "price",
        "created_at": "created_at",
        "rating": "rating",
        "name": "name"
    }
    sort_field = sort_field_map.get(sort, "created_at")
    
    # Count total
    total = await database.products.count_documents(query)
    
    # Get products
    skip = (page - 1) * limit
    cursor = database.products.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Convert to response
    products_list = [product_to_response(p) for p in products]
    
    return {
        "items": products_list,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if total > 0 else 0
    }


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a single product by ID"""
    database = get_database()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID")
    
    product = await database.products.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    return product_to_response(product)


@router.get("/slug/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str):
    """Get a product by slug"""
    database = get_database()
    
    product = await database.products.find_one({"slug": slug})
    
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    return product_to_response(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Create a new product (admin only)"""
    database = get_database()
    
    # Generate slug
    slug = generate_slug(product_data.name)
    
    # Check if slug exists
    existing = await database.products.find_one({"slug": slug})
    if existing:
        slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
    
    product_dict = {
        "name": product_data.name,
        "slug": slug,
        "description": product_data.description,
        "price": product_data.price,
        "currency": product_data.currency,
        "discount": product_data.discount,
        "category": ObjectId(product_data.category) if product_data.category else None,
        "tags": product_data.tags,
        "brand": product_data.brand,
        "images": product_data.images,
        "specs": product_data.specs,
        "stock": product_data.stock,
        "rating": 0.0,
        "reviews_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.products.insert_one(product_dict)
    product_dict["_id"] = result.inserted_id
    
    return product_to_response(product_dict)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    """Update a product (admin only)"""
    database = get_database()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID")
    
    product = await database.products.find_one({"_id": ObjectId(product_id)})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Build update dict
    update_dict = {"updated_at": datetime.utcnow()}
    
    if product_data.name is not None:
        update_dict["name"] = product_data.name
        update_dict["slug"] = generate_slug(product_data.name)
    
    if product_data.description is not None:
        update_dict["description"] = product_data.description
    if product_data.price is not None:
        update_dict["price"] = product_data.price
    if product_data.currency is not None:
        update_dict["currency"] = product_data.currency
    if product_data.discount is not None:
        update_dict["discount"] = product_data.discount
    if product_data.category is not None:
        update_dict["category"] = ObjectId(product_data.category) if product_data.category else None
    if product_data.tags is not None:
        update_dict["tags"] = product_data.tags
    if product_data.brand is not None:
        update_dict["brand"] = product_data.brand
    if product_data.images is not None:
        update_dict["images"] = product_data.images
    if product_data.specs is not None:
        update_dict["specs"] = product_data.specs
    if product_data.stock is not None:
        update_dict["stock"] = product_data.stock
    
    await database.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": update_dict}
    )
    
    updated_product = await database.products.find_one({"_id": ObjectId(product_id)})
    return product_to_response(updated_product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: str,
    current_user: dict = Depends(get_current_admin_user)
):
    """Delete a product (admin only)"""
    database = get_database()
    
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID")
    
    result = await database.products.delete_one({"_id": ObjectId(product_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    return None

