from datetime import datetime
from typing import List
from pydantic import BaseModel, Field


class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float  # Snapshot price at time of adding


class Cart(BaseModel):
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class CartResponse(BaseModel):
    id: str
    user_id: str
    items: List[CartItem]
    total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

