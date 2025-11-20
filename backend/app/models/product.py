from datetime import datetime
from typing import List, Optional, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field


class Product(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    currency: str = "VND"
    discount: float = 0.0
    category: Optional[str] = None  # ObjectId as string
    tags: List[str] = []
    brand: Optional[str] = None
    images: List[str] = []
    specs: Dict[str, Any] = {}
    stock: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str, datetime: lambda v: v.isoformat()}


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "VND"
    discount: float = 0.0
    category: Optional[str] = None
    tags: List[str] = []
    brand: Optional[str] = None
    images: List[str] = []
    specs: Dict[str, Any] = {}
    stock: int = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    discount: Optional[float] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    brand: Optional[str] = None
    images: Optional[List[str]] = None
    specs: Optional[Dict[str, Any]] = None
    stock: Optional[int] = None


class ProductResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    price: float
    currency: str
    discount: float
    category: Optional[str] = None
    tags: List[str]
    brand: Optional[str] = None
    images: List[str]
    specs: Dict[str, Any]
    stock: int
    rating: float
    reviews_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

