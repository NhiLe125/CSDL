from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


class Database:
    client: AsyncIOMotorClient = None


db = Database()


async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.mongodb_url)
    await create_indexes()


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()


async def create_indexes():
    """Create MongoDB indexes for better performance"""
    database = db.client[settings.database_name]
    
    # Text index for products search
    await database.products.create_index([
        ("name", "text"),
        ("description", "text"),
        ("brand", "text")
    ])
    
    # Single field indexes
    await database.products.create_index("category")
    await database.products.create_index("price")
    await database.products.create_index("slug", unique=True)
    await database.products.create_index("createdAt")
    
    # Index for users
    await database.users.create_index("email", unique=True)
    await database.users.create_index("username", unique=True)

    # Indexes for orders
    await database.orders.create_index("user_id")
    await database.orders.create_index("created_at")
    await database.orders.create_index("status")


def get_database():
    """Get database instance"""
    return db.client[settings.database_name]

