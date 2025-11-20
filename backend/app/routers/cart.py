from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.models.cart import CartItemCreate, CartResponse, CartItem
from app.auth import get_current_active_user
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_active_user)):
    """Get user's cart"""
    database = get_database()
    user_id = current_user["id"]
    
    cart = await database.carts.find_one({"user_id": user_id})
    
    if not cart:
        # Create empty cart
        cart_dict = {
            "user_id": user_id,
            "items": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await database.carts.insert_one(cart_dict)
        cart_dict["_id"] = result.inserted_id
        cart = cart_dict
    
    # Calculate total
    total = sum(item["quantity"] * item["price"] for item in cart.get("items", []))
    
    return CartResponse(
        id=str(cart["_id"]),
        user_id=cart["user_id"],
        items=[CartItem(**item) for item in cart.get("items", [])],
        total=total,
        created_at=cart.get("created_at", datetime.utcnow()),
        updated_at=cart.get("updated_at", datetime.utcnow())
    )


@router.post("/items", response_model=CartResponse)
async def add_to_cart(
    item_data: CartItemCreate,
    current_user: dict = Depends(get_current_active_user)
):
    """Add item to cart or update quantity"""
    database = get_database()
    user_id = current_user["id"]
    
    # Check if product exists and get price
    product = await database.products.find_one({"_id": ObjectId(item_data.product_id)})
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Get or create cart
    cart = await database.carts.find_one({"user_id": user_id})
    if not cart:
        cart_dict = {
            "user_id": user_id,
            "items": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await database.carts.insert_one(cart_dict)
        cart_dict["_id"] = result.inserted_id
        cart = cart_dict
    
    # Check if item already in cart
    items = cart.get("items", [])
    item_index = next(
        (i for i, item in enumerate(items) if item["product_id"] == item_data.product_id),
        None
    )
    
    product_price = product["price"] * (1 - product.get("discount", 0) / 100)
    
    if item_index is not None:
        # Update quantity
        items[item_index]["quantity"] += item_data.quantity
        items[item_index]["price"] = product_price  # Update price snapshot
    else:
        # Add new item
        items.append({
            "product_id": item_data.product_id,
            "quantity": item_data.quantity,
            "price": product_price
        })
    
    await database.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    # Return updated cart
    updated_cart = await database.carts.find_one({"_id": cart["_id"]})
    total = sum(item["quantity"] * item["price"] for item in updated_cart["items"])
    
    return CartResponse(
        id=str(updated_cart["_id"]),
        user_id=updated_cart["user_id"],
        items=[CartItem(**item) for item in updated_cart["items"]],
        total=total,
        created_at=updated_cart.get("created_at", datetime.utcnow()),
        updated_at=updated_cart.get("updated_at", datetime.utcnow())
    )


@router.delete("/items/{product_id}", response_model=CartResponse)
async def remove_from_cart(
    product_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """Remove item from cart"""
    database = get_database()
    user_id = current_user["id"]
    
    cart = await database.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    
    items = cart.get("items", [])
    items = [item for item in items if item["product_id"] != product_id]
    
    await database.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    updated_cart = await database.carts.find_one({"_id": cart["_id"]})
    total = sum(item["quantity"] * item["price"] for item in updated_cart["items"])
    
    return CartResponse(
        id=str(updated_cart["_id"]),
        user_id=updated_cart["user_id"],
        items=[CartItem(**item) for item in updated_cart["items"]],
        total=total,
        created_at=updated_cart.get("created_at", datetime.utcnow()),
        updated_at=updated_cart.get("updated_at", datetime.utcnow())
    )


@router.put("/items/{product_id}", response_model=CartResponse)
async def update_cart_item_quantity(
    product_id: str,
    quantity: int,
    current_user: dict = Depends(get_current_active_user)
):
    """Update item quantity in cart"""
    database = get_database()
    user_id = current_user["id"]
    
    if quantity <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be greater than 0")
    
    cart = await database.carts.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
    
    items = cart.get("items", [])
    item_index = next(
        (i for i, item in enumerate(items) if item["product_id"] == product_id),
        None
    )
    
    if item_index is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found in cart")
    
    items[item_index]["quantity"] = quantity
    
    await database.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": items, "updated_at": datetime.utcnow()}}
    )
    
    updated_cart = await database.carts.find_one({"_id": cart["_id"]})
    total = sum(item["quantity"] * item["price"] for item in updated_cart["items"])
    
    return CartResponse(
        id=str(updated_cart["_id"]),
        user_id=updated_cart["user_id"],
        items=[CartItem(**item) for item in updated_cart["items"]],
        total=total,
        created_at=updated_cart.get("created_at", datetime.utcnow()),
        updated_at=updated_cart.get("updated_at", datetime.utcnow())
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(current_user: dict = Depends(get_current_active_user)):
    """Clear all items from cart"""
    database = get_database()
    user_id = current_user["id"]
    
    await database.carts.update_one(
        {"user_id": user_id},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}}
    )
    
    return None

