from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from bson import ObjectId
from datetime import datetime, timedelta

from app.database import get_database
from app.auth import get_current_active_user, get_current_admin_user
from app.models.order import (
    OrderCreate,
    OrderResponse,
    OrderItem,
    OrderSummaryResponse,
    OrderStatusUpdate,
    OrderMetricsResponse,
    ORDER_STATUSES,
)


router = APIRouter(prefix="/api/orders", tags=["orders"])


def order_to_response(order: dict) -> OrderResponse:
    return OrderResponse(
        id=str(order["_id"]),
        user_id=order["user_id"],
        items=[OrderItem(**item) for item in order.get("items", [])],
        total=order.get("total", 0.0),
        status=order.get("status", "pending"),
        shipping=order.get("shipping"),
        note=order.get("note"),
        status_notes=order.get("status_notes", []),
        created_at=order.get("created_at", datetime.utcnow()),
        updated_at=order.get("updated_at", datetime.utcnow()),
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_active_user),
):
    database = get_database()

    cart = await database.carts.find_one({"user_id": current_user["id"]})
    if not cart or not cart.get("items"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.",
        )

    order_items = []
    total = 0.0

    for item in cart.get("items", []):
        product_id = item["product_id"]
        if not ObjectId.is_valid(product_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sản phẩm không hợp lệ: {product_id}",
            )

        product = await database.products.find_one({"_id": ObjectId(product_id)})
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Một số sản phẩm trong giỏ không còn tồn tại.",
            )

        price = item.get("price", product.get("price", 0))
        quantity = item.get("quantity", 1)
        total += price * quantity

        order_items.append(
            {
                "product_id": product_id,
                "product_name": product["name"],
                "price": price,
                "quantity": quantity,
                "image": product.get("images", [None])[0] if product.get("images") else None,
            }
        )

    order_dict = {
        "user_id": current_user["id"],
        "items": order_items,
        "total": total,
        "status": "pending",
        "shipping": {
            "full_name": order_data.full_name,
            "email": order_data.email,
            "phone": order_data.phone,
            "address": order_data.address,
        },
        "note": order_data.note,
        "status_notes": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await database.orders.insert_one(order_dict)
    order_dict["_id"] = result.inserted_id

    # Clear cart after successful order
    await database.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": [], "updated_at": datetime.utcnow()}},
    )

    return order_to_response(order_dict)


@router.get("", response_model=List[OrderResponse])
async def get_my_orders(current_user: dict = Depends(get_current_active_user)):
    database = get_database()
    cursor = (
        database.orders.find({"user_id": current_user["id"]})
        .sort("created_at", -1)
    )
    orders = await cursor.to_list(length=100)
    return [order_to_response(order) for order in orders]


@router.get("/all", response_model=List[OrderResponse])
async def get_all_orders(
    current_user: dict = Depends(get_current_admin_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None, description="Tìm theo tên/email khách hàng"),
    start_date: Optional[str] = Query(None, description="ISO date from"),
    end_date: Optional[str] = Query(None, description="ISO date to"),
):
    database = get_database()
    query = {}

    if status_filter:
        if status_filter not in ORDER_STATUSES:
            raise HTTPException(status_code=400, detail="Trạng thái không hợp lệ")
        query["status"] = status_filter

    if search:
        query["$or"] = [
            {"shipping.full_name": {"$regex": search, "$options": "i"}},
            {"shipping.email": {"$regex": search, "$options": "i"}},
        ]

    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date)
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date)

    cursor = database.orders.find(query).sort("created_at", -1)
    orders = await cursor.to_list(length=200)
    return [order_to_response(order) for order in orders]


@router.get("/summary", response_model=OrderSummaryResponse)
async def get_order_summary(current_user: dict = Depends(get_current_admin_user)):
    database = get_database()

    total_orders = await database.orders.count_documents({})

    revenue_cursor = database.orders.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ])
    revenue_result = await revenue_cursor.to_list(length=1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0

    status_cursor = database.orders.aggregate([
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ])
    status_list = await status_cursor.to_list(length=None)
    status_counts = {item["_id"]: item["count"] for item in status_list if item["_id"]}

    return OrderSummaryResponse(
        total_orders=total_orders,
        total_revenue=total_revenue,
        status_counts=status_counts
    )


@router.get("/metrics", response_model=OrderMetricsResponse)
async def get_order_metrics(current_user: dict = Depends(get_current_admin_user)):
    database = get_database()
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    start = today - timedelta(days=6)

    revenue_cursor = database.orders.aggregate([
        {"$match": {"created_at": {"$gte": start}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "total": {"$sum": "$total"}
            }
        },
        {"$sort": {"_id": 1}}
    ])
    revenue_data = await revenue_cursor.to_list(length=None)
    revenue_by_date = [
        {"date": item["_id"], "total": item["total"]}
        for item in revenue_data
    ]

    top_products_cursor = database.orders.aggregate([
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": {"product_id": "$items.product_id", "name": "$items.product_name"},
                "quantity": {"$sum": "$items.quantity"},
                "revenue": {"$sum": {"$multiply": ["$items.price", "$items.quantity"]}}
            }
        },
        {"$sort": {"revenue": -1}},
        {"$limit": 5}
    ])
    top_products_data = await top_products_cursor.to_list(length=None)
    top_products = [
        {
            "product_id": item["_id"]["product_id"],
            "name": item["_id"]["name"],
            "quantity": int(item["quantity"]),
            "revenue": float(item["revenue"]),
        }
        for item in top_products_data
    ]

    return OrderMetricsResponse(
        revenue_by_date=revenue_by_date,
        top_products=top_products
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_detail(
    order_id: str,
    current_user: dict = Depends(get_current_active_user),
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID đơn hàng không hợp lệ")

    database = get_database()
    order = await database.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    if current_user["role"] != "admin" and order["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Không có quyền xem đơn này")

    return order_to_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_user: dict = Depends(get_current_admin_user),
):
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=400, detail="ID đơn hàng không hợp lệ")

    database = get_database()
    order = await database.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")

    update_data = {
        "status": status_update.status,
        "updated_at": datetime.utcnow(),
    }

    if status_update.note:
        history = order.get("status_notes", []).copy()
        history.append(f"{datetime.utcnow().isoformat()} - {status_update.note}")
        update_data["status_notes"] = history

    await database.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": update_data}
    )

    updated_order = await database.orders.find_one({"_id": ObjectId(order_id)})
    return order_to_response(updated_order)

