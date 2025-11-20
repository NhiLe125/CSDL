"""
Seed script to populate database with sample data
Run: python seed_data.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils import get_password_hash, generate_slug
from datetime import datetime, timedelta
from bson import ObjectId
import random
from app.models.order import ORDER_STATUSES

# Sample data
CATEGORIES = [
    {"name": "Điện thoại", "description": "Smartphones và điện thoại di động"},
    {"name": "Laptop", "description": "Máy tính xách tay"},
    {"name": "Tai nghe", "description": "Tai nghe không dây và có dây"},
    {"name": "Đồng hồ", "description": "Smartwatch và đồng hồ thời trang"},
    {"name": "Máy ảnh", "description": "Máy ảnh DSLR và mirrorless"},
    {"name": "TV & Màn hình", "description": "Smart TV và màn hình máy tính"},
]

PRODUCTS = [
    # Điện thoại
    {"name": "iPhone 15 Pro Max 256GB", "description": "iPhone 15 Pro Max với chip A17 Pro, camera 48MP, pin lâu dài", "price": 29990000, "brand": "Apple", "category": "Điện thoại", "tags": ["apple", "smartphone", "5g"], "stock": 50, "specs": {"ram": "8GB", "storage": "256GB", "screen": "6.7 inch"}},
    {"name": "Samsung Galaxy S24 Ultra", "description": "Galaxy S24 Ultra với S Pen, camera 200MP, màn hình Dynamic AMOLED 2X", "price": 27990000, "brand": "Samsung", "category": "Điện thoại", "tags": ["samsung", "smartphone", "5g"], "stock": 45, "specs": {"ram": "12GB", "storage": "512GB", "screen": "6.8 inch"}},
    {"name": "Xiaomi 14 Pro", "description": "Xiaomi 14 Pro flagship với Snapdragon 8 Gen 3, Leica camera", "price": 19990000, "brand": "Xiaomi", "category": "Điện thoại", "tags": ["xiaomi", "smartphone", "5g"], "stock": 60, "specs": {"ram": "12GB", "storage": "512GB", "screen": "6.73 inch"}},
    {"name": "OnePlus 12", "description": "OnePlus 12 với Snapdragon 8 Gen 3, sạc nhanh 100W", "price": 18990000, "brand": "OnePlus", "category": "Điện thoại", "tags": ["oneplus", "smartphone", "fast-charging"], "stock": 40, "specs": {"ram": "16GB", "storage": "512GB", "screen": "6.82 inch"}},
    {"name": "Google Pixel 8 Pro", "description": "Pixel 8 Pro với Google Tensor G3, camera AI xuất sắc", "price": 22990000, "brand": "Google", "category": "Điện thoại", "tags": ["google", "smartphone", "ai-camera"], "stock": 30, "specs": {"ram": "12GB", "storage": "128GB", "screen": "6.7 inch"}},
    
    # Laptop
    {"name": "MacBook Pro 14 inch M3", "description": "MacBook Pro 14 inch với chip Apple M3, 16GB RAM, 512GB SSD", "price": 45990000, "brand": "Apple", "category": "Laptop", "tags": ["apple", "laptop", "creative"], "stock": 25, "specs": {"cpu": "Apple M3", "ram": "16GB", "storage": "512GB SSD", "screen": "14.2 inch"}},
    {"name": "Dell XPS 15 OLED", "description": "Dell XPS 15 với màn hình OLED 4K, Intel Core i7, NVIDIA RTX 4060", "price": 49990000, "brand": "Dell", "category": "Laptop", "tags": ["dell", "laptop", "gaming"], "stock": 20, "specs": {"cpu": "Intel Core i7-13700H", "ram": "32GB", "storage": "1TB SSD", "screen": "15.6 inch OLED"}},
    {"name": "ASUS ROG Zephyrus G16", "description": "Gaming laptop ASUS ROG với Intel Core i9, RTX 4070, màn hình 240Hz", "price": 59990000, "brand": "ASUS", "category": "Laptop", "tags": ["asus", "laptop", "gaming"], "stock": 15, "specs": {"cpu": "Intel Core i9-13900H", "ram": "32GB", "storage": "1TB SSD", "gpu": "RTX 4070"}},
    {"name": "Lenovo ThinkPad X1 Carbon", "description": "Business laptop siêu mỏng nhẹ, Intel Core i7, bàn phím tuyệt vời", "price": 41990000, "brand": "Lenovo", "category": "Laptop", "tags": ["lenovo", "laptop", "business"], "stock": 30, "specs": {"cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "512GB SSD", "screen": "14 inch"}},
    {"name": "HP Spectre x360", "description": "Laptop 2-in-1 HP Spectre, Intel Core i7, màn hình cảm ứng OLED", "price": 38990000, "brand": "HP", "category": "Laptop", "tags": ["hp", "laptop", "2-in-1"], "stock": 22, "specs": {"cpu": "Intel Core i7-1355U", "ram": "16GB", "storage": "1TB SSD", "screen": "13.5 inch OLED"}},
    
    # Tai nghe
    {"name": "AirPods Pro 2", "description": "Tai nghe không dây Apple với Active Noise Cancellation, Spatial Audio", "price": 6990000, "brand": "Apple", "category": "Tai nghe", "tags": ["apple", "earbuds", "noise-cancelling"], "stock": 100, "specs": {"type": "True Wireless", "noise_cancellation": "Có", "battery": "6h + 24h case"}},
    {"name": "Sony WH-1000XM5", "description": "Tai nghe over-ear Sony với ANC tốt nhất thế giới, pin 30 giờ", "price": 8990000, "brand": "Sony", "category": "Tai nghe", "tags": ["sony", "over-ear", "noise-cancelling"], "stock": 80, "specs": {"type": "Over-ear", "noise_cancellation": "Có", "battery": "30h"}},
    {"name": "Bose QuietComfort Ultra", "description": "Tai nghe Bose với Immersive Audio và ANC siêu mạnh", "price": 11990000, "brand": "Bose", "category": "Tai nghe", "tags": ["bose", "over-ear", "premium"], "stock": 50, "specs": {"type": "Over-ear", "noise_cancellation": "Có", "battery": "24h"}},
    {"name": "Samsung Galaxy Buds2 Pro", "description": "Tai nghe không dây Samsung với ANC, chất lượng âm thanh Hi-Fi", "price": 5490000, "brand": "Samsung", "category": "Tai nghe", "tags": ["samsung", "earbuds", "hi-fi"], "stock": 90, "specs": {"type": "True Wireless", "noise_cancellation": "Có", "battery": "8h + 20h case"}},
    {"name": "JBL Tune 770NC", "description": "Tai nghe JBL giá rẻ với ANC, pin 44 giờ", "price": 2990000, "brand": "JBL", "category": "Tai nghe", "tags": ["jbl", "over-ear", "budget"], "stock": 120, "specs": {"type": "Over-ear", "noise_cancellation": "Có", "battery": "44h"}},
    
    # Đồng hồ
    {"name": "Apple Watch Series 9", "description": "Apple Watch Series 9 45mm, GPS + Cellular, pin 18 giờ", "price": 12990000, "brand": "Apple", "category": "Đồng hồ", "tags": ["apple", "smartwatch", "fitness"], "stock": 60, "specs": {"size": "45mm", "gps": "Có", "cellular": "Có", "battery": "18h"}},
    {"name": "Samsung Galaxy Watch6 Classic", "description": "Smartwatch Samsung với vòng xoay bezel, chạy Wear OS", "price": 9990000, "brand": "Samsung", "category": "Đồng hồ", "tags": ["samsung", "smartwatch", "wear-os"], "stock": 55, "specs": {"size": "47mm", "os": "Wear OS", "battery": "40h"}},
    {"name": "Garmin Forerunner 955", "description": "Đồng hồ chạy bộ Garmin với GPS chính xác, pin 20 ngày", "price": 14990000, "brand": "Garmin", "category": "Đồng hồ", "tags": ["garmin", "smartwatch", "running"], "stock": 40, "specs": {"type": "Sports", "gps": "Multi-band", "battery": "20 days"}},
    {"name": "Fossil Gen 6", "description": "Smartwatch Fossil với Wear OS, thiết kế cổ điển", "price": 6990000, "brand": "Fossil", "category": "Đồng hồ", "tags": ["fossil", "smartwatch", "classic"], "stock": 45, "specs": {"os": "Wear OS", "battery": "24h"}},
    {"name": "Fitbit Versa 4", "description": "Fitness tracker Fitbit với theo dõi sức khỏe 24/7", "price": 5490000, "brand": "Fitbit", "category": "Đồng hồ", "tags": ["fitbit", "fitness", "health"], "stock": 70, "specs": {"type": "Fitness", "battery": "6+ days"}},
    
    # Máy ảnh
    {"name": "Canon EOS R6 Mark II", "description": "Máy ảnh mirrorless Canon full-frame, 24MP, quay 4K 60fps", "price": 64990000, "brand": "Canon", "category": "Máy ảnh", "tags": ["canon", "mirrorless", "full-frame"], "stock": 15, "specs": {"sensor": "Full-frame 24MP", "video": "4K 60fps", "stabilization": "IBIS"}},
    {"name": "Sony A7 IV", "description": "Máy ảnh mirrorless Sony full-frame, 33MP, AI autofocus", "price": 69990000, "brand": "Sony", "category": "Máy ảnh", "tags": ["sony", "mirrorless", "full-frame"], "stock": 12, "specs": {"sensor": "Full-frame 33MP", "video": "4K 30fps", "autofocus": "AI"}},
    {"name": "Nikon Z6 III", "description": "Máy ảnh mirrorless Nikon full-frame, 24MP, tốc độ 120fps", "price": 66990000, "brand": "Nikon", "category": "Máy ảnh", "tags": ["nikon", "mirrorless", "full-frame"], "stock": 10, "specs": {"sensor": "Full-frame 24MP", "burst": "120fps", "video": "4K 60fps"}},
    {"name": "Fujifilm X-T5", "description": "Máy ảnh mirrorless Fujifilm APS-C, 40MP, thiết kế retro", "price": 38990000, "brand": "Fujifilm", "category": "Máy ảnh", "tags": ["fujifilm", "mirrorless", "aps-c"], "stock": 20, "specs": {"sensor": "APS-C 40MP", "design": "Retro", "video": "6K"}},
    {"name": "Panasonic Lumix GH6", "description": "Máy ảnh mirrorless Panasonic MFT, quay video chuyên nghiệp", "price": 42990000, "brand": "Panasonic", "category": "Máy ảnh", "tags": ["panasonic", "mirrorless", "video"], "stock": 18, "specs": {"sensor": "MFT 25MP", "video": "5.7K 60fps"}},
    
    # TV & Màn hình
    {"name": "LG C3 OLED 65 inch", "description": "Smart TV LG OLED 65 inch, 4K, Dolby Vision IQ, WebOS", "price": 34990000, "brand": "LG", "category": "TV & Màn hình", "tags": ["lg", "tv", "oled"], "stock": 25, "specs": {"size": "65 inch", "resolution": "4K OLED", "smart_tv": "WebOS"}},
    {"name": "Samsung QN90C Neo QLED 55 inch", "description": "Smart TV Samsung QLED 55 inch, 4K, Mini LED, Tizen OS", "price": 29990000, "brand": "Samsung", "category": "TV & Màn hình", "tags": ["samsung", "tv", "qled"], "stock": 30, "specs": {"size": "55 inch", "resolution": "4K QLED", "smart_tv": "Tizen"}},
    {"name": "Sony X90L 75 inch", "description": "Smart TV Sony 75 inch, 4K HDR, Google TV", "price": 37990000, "brand": "Sony", "category": "TV & Màn hình", "tags": ["sony", "tv", "4k"], "stock": 20, "specs": {"size": "75 inch", "resolution": "4K HDR", "smart_tv": "Google TV"}},
    {"name": "Dell UltraSharp U2723DE", "description": "Màn hình Dell 27 inch 4K USB-C, IPS Black technology", "price": 8990000, "brand": "Dell", "category": "TV & Màn hình", "tags": ["dell", "monitor", "4k"], "stock": 50, "specs": {"size": "27 inch", "resolution": "4K", "panel": "IPS Black"}},
    {"name": "ASUS ProArt PA279CV", "description": "Màn hình ASUS ProArt 27 inch 4K, chính xác màu sắc, USB-C", "price": 10990000, "brand": "ASUS", "category": "TV & Màn hình", "tags": ["asus", "monitor", "professional"], "stock": 40, "specs": {"size": "27 inch", "resolution": "4K", "color": "100% sRGB"}},
]


async def seed_database():
    """Seed database with sample data"""
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    
    print("🌱 Starting database seed...")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    # await database.categories.delete_many({})
    # await database.products.delete_many({})
    # await database.users.delete_many({})
    # await database.orders.delete_many({})
    
    # Create admin user
    admin_user = await database.users.find_one({"username": "admin"})
    if not admin_user:
        admin_dict = {
            "username": "admin",
            "email": "admin@example.com",
            "hashed_password": get_password_hash("admin123"),
            "full_name": "Admin User",
            "role": "admin",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await database.users.insert_one(admin_dict)
        print("✅ Created admin user (username: admin, password: admin123)")
    else:
        print("ℹ️  Admin user already exists")
    
    # Create test user
    test_user = await database.users.find_one({"username": "testuser"})
    if not test_user:
        test_dict = {
            "username": "testuser",
            "email": "test@example.com",
            "hashed_password": get_password_hash("test123"),
            "full_name": "Test User",
            "role": "user",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await database.users.insert_one(test_dict)
        print("✅ Created test user (username: testuser, password: test123)")
    else:
        print("ℹ️  Test user already exists")
    
    # Create categories
    category_map = {}
    for cat_data in CATEGORIES:
        slug = generate_slug(cat_data["name"])
        existing = await database.categories.find_one({"slug": slug})
        
        if not existing:
            cat_dict = {
                "name": cat_data["name"],
                "slug": slug,
                "description": cat_data["description"],
                "image": None,
                "parent": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await database.categories.insert_one(cat_dict)
            category_map[cat_data["name"]] = str(result.inserted_id)
            print(f"✅ Created category: {cat_data['name']}")
        else:
            category_map[cat_data["name"]] = str(existing["_id"])
            print(f"ℹ️  Category already exists: {cat_data['name']}")
    
    # Create products
    created_count = 0
    for product_data in PRODUCTS:
        slug = generate_slug(product_data["name"])
        existing = await database.products.find_one({"slug": slug})
        
        if not existing:
            category_id = category_map.get(product_data["category"])
            
            # Generate sample images URLs (placeholder)
            images = [
                f"https://picsum.photos/800/600?random={random.randint(1, 1000)}",
                f"https://picsum.photos/800/600?random={random.randint(1001, 2000)}"
            ]
            
            product_dict = {
                "name": product_data["name"],
                "slug": slug,
                "description": product_data["description"],
                "price": product_data["price"],
                "currency": "VND",
                "discount": random.choice([0, 0, 0, 5, 10, 15]),  # Most products have no discount
                "category": ObjectId(category_id) if category_id else None,
                "tags": product_data["tags"],
                "brand": product_data["brand"],
                "images": images,
                "specs": product_data["specs"],
                "stock": product_data["stock"],
                "rating": round(random.uniform(3.5, 5.0), 1),  # Random rating between 3.5 and 5.0
                "reviews_count": random.randint(10, 500),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await database.products.insert_one(product_dict)
            created_count += 1
    
    print(f"✅ Created {created_count} new products")
    total = await database.products.count_documents({})
    print(f"✅ Total products in database: {total}")

    # Seed demo orders
    products = await database.products.find().to_list(length=200)
    test_user = await database.users.find_one({"username": "testuser"})

    if products and test_user:
        await seed_orders(database, products, test_user["_id"])
    else:
        print("⚠️  Skip order seeding (missing products or test user)")

    print("🎉 Database seed completed!")
    
    client.close()


async def seed_orders(database, products, user_id):
    """Create demo orders using existing products"""
    existing_orders = await database.orders.count_documents({})
    if existing_orders > 0:
        print(f"ℹ️  Orders already exist ({existing_orders}), skipping demo orders")
        return

    shipping_templates = [
        {
            "full_name": "Nguyễn Văn A",
            "email": "nguyenvana@example.com",
            "phone": "0901234567",
            "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
        },
        {
            "full_name": "Trần Thị B",
            "email": "tranthib@example.com",
            "phone": "0912345678",
            "address": "45 Lê Lợi, Quận Hải Châu, Đà Nẵng",
        },
        {
            "full_name": "Lê Minh C",
            "email": "leminhc@example.com",
            "phone": "0939876543",
            "address": "78 Trần Phú, Quận Hà Đông, Hà Nội",
        },
        {
            "full_name": "Phạm Quốc D",
            "email": "phamquocd@example.com",
            "phone": "0976543210",
            "address": "12 Phạm Ngũ Lão, TP.Cần Thơ",
        },
    ]

    order_count = 8
    created_orders = 0

    for _ in range(order_count):
        shipping = random.choice(shipping_templates).copy()
        num_items = random.randint(1, 4)
        selected_products = random.sample(products, k=num_items)

        items = []
        total = 0
        for product in selected_products:
            quantity = random.randint(1, 3)
            price = product["price"] * (1 - product.get("discount", 0) / 100)
            total += price * quantity
            items.append(
                {
                    "product_id": str(product["_id"]),
                    "product_name": product["name"],
                    "price": price,
                    "quantity": quantity,
                    "image": product.get("images", [None])[0],
                }
            )

        status = random.choice(ORDER_STATUSES)
        status_notes = []
        if status != "pending":
            status_notes.append(
                f"{datetime.utcnow().isoformat()} - Demo chuyển sang trạng thái {status}"
            )

        created_at = datetime.utcnow() - timedelta(days=random.randint(0, 6))
        order = {
            "user_id": str(user_id),
            "items": items,
            "total": round(total, 2),
            "status": status,
            "shipping": shipping,
            "note": random.choice(
                ["", "Giao nhanh giúp mình", "Kiểm tra hàng trước khi nhận", ""]
            ),
            "status_notes": status_notes,
            "created_at": created_at,
            "updated_at": created_at,
        }

        await database.orders.insert_one(order)
        created_orders += 1

    print(f"✅ Created {created_orders} demo orders")


if __name__ == "__main__":
    asyncio.run(seed_database())

