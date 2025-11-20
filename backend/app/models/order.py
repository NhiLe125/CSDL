from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel, EmailStr, Field, confloat, constr

ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"]


class OrderItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int
    image: Optional[str] = None


class ShippingInfo(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address: str


class Order(BaseModel):
    user_id: str
    items: List[OrderItem]
    total: float
    status: constr(pattern="^(pending|processing|completed|cancelled)$") = "pending"
    shipping: ShippingInfo
    note: Optional[str] = None
    status_notes: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class OrderCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address: str
    note: Optional[str] = None


class OrderResponse(BaseModel):
    id: str
    user_id: str
    items: List[OrderItem]
    total: float
    status: str
    shipping: ShippingInfo
    note: Optional[str] = None
    status_notes: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderSummaryResponse(BaseModel):
    total_orders: int
    total_revenue: float
    status_counts: Dict[str, int]


class OrderStatusUpdate(BaseModel):
    status: constr(pattern="^(pending|processing|completed|cancelled)$")
    note: Optional[str] = None


class RevenuePoint(BaseModel):
    date: str
    total: float


class TopProduct(BaseModel):
    product_id: str
    name: str
    quantity: int
    revenue: float


class OrderMetricsResponse(BaseModel):
    revenue_by_date: List[RevenuePoint]
    top_products: List[TopProduct]

