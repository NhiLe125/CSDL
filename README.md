# Product Catalog - E-commerce Mini

Dự án **Product Catalog** là một ứng dụng e-commerce mini với đầy đủ tính năng CRUD, tìm kiếm, lọc, phân trang, giỏ hàng, và authentication.

## 🚀 Tính năng

### Backend (FastAPI)
- ✅ CRUD sản phẩm (Create, Read, Update, Delete)
- ✅ Quản lý danh mục (Categories)
- ✅ Tìm kiếm và lọc sản phẩm (full-text search, price range, category, brand)
- ✅ Phân trang (Pagination)
- ✅ Authentication & Authorization (JWT)
- ✅ Giỏ hàng (Cart)
- ✅ Đơn hàng (Orders) lưu MongoDB, tự động xoá giỏ sau checkout, cập nhật trạng thái
- ✅ Upload ảnh
- ✅ Health check endpoint
- ✅ OpenAPI documentation tự động

### Frontend (React + Vite)
- ✅ Trang chủ với sản phẩm nổi bật
- ✅ Danh sách sản phẩm với tìm kiếm và lọc
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng
- ✅ Đăng nhập / Đăng ký
- ✅ Trang “Đơn hàng” hiển thị lịch sử mua & trạng thái
- ✅ Admin Dashboard (quản lý sản phẩm, danh mục, đơn hàng với biểu đồ/chỉ số)
- ✅ Responsive design (mobile-first)
- ✅ UI đẹp với Tailwind CSS

## 📋 Yêu cầu

- Python 3.11+
- Node.js 18+
- MongoDB (hoặc MongoDB Atlas)
- Docker & Docker Compose (tùy chọn)

## 🛠️ Cài đặt

### Cách 1: Chạy với Docker (Khuyến nghị)

1. **Clone repository và di chuyển vào thư mục dự án:**
```bash
cd CSDL
```

2. **Tạo file `.env` cho backend:**
```bash
cd backend
cp .env.example .env
# Chỉnh sửa .env nếu cần
```

3. **Chạy với Docker Compose:**
```bash
docker-compose up -d
```

4. **Seed dữ liệu mẫu:**
```bash
docker-compose exec backend python seed_data.py
```

5. **Truy cập ứng dụng:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Cách 2: Chạy thủ công

#### Backend

1. **Tạo virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Trên Windows: venv\Scripts\activate
```

2. **Cài đặt dependencies:**
```bash
pip install -r requirements.txt
```

3. **Tạo file `.env`:**
```bash
cp .env.example .env
# Chỉnh sửa .env với MongoDB URL của bạn
```

4. **Chạy MongoDB (nếu chưa có):**
```bash
# Hoặc sử dụng MongoDB Atlas
mongod
```

5. **Seed dữ liệu mẫu:**
```bash
python seed_data.py
```

6. **Chạy server:**
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. **Cài đặt dependencies:**
```bash
cd frontend
npm install
```

2. **Tạo file `.env` (tùy chọn):**
```bash
VITE_API_URL=http://localhost:8000
```

3. **Chạy development server:**
```bash
npm run dev
```

4. **Truy cập:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Products
- `GET /api/products` - List sản phẩm (có pagination, search, filter)
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/slug/{slug}` - Sản phẩm theo slug
- `POST /api/products` - Tạo sản phẩm (admin only)
- `PUT /api/products/{id}` - Cập nhật sản phẩm (admin only)
- `DELETE /api/products/{id}` - Xóa sản phẩm (admin only)

### Categories
- `GET /api/categories` - List danh mục
- `GET /api/categories/{id}` - Chi tiết danh mục
- `POST /api/categories` - Tạo danh mục (admin only)
- `PUT /api/categories/{id}` - Cập nhật danh mục (admin only)
- `DELETE /api/categories/{id}` - Xóa danh mục (admin only)

### Cart
- `GET /api/cart` - Lấy giỏ hàng
- `POST /api/cart/items` - Thêm vào giỏ hàng
- `PUT /api/cart/items/{product_id}?quantity={qty}` - Cập nhật số lượng
- `DELETE /api/cart/items/{product_id}` - Xóa khỏi giỏ hàng
- `DELETE /api/cart` - Xóa tất cả

### Orders
- `POST /api/orders` - Tạo đơn hàng từ giỏ hiện tại
- `GET /api/orders` - Xem đơn hàng của người dùng hiện tại
- `GET /api/orders/{id}` - Chi tiết đơn hàng (admin hoặc chủ đơn)
- `PATCH /api/orders/{id}/status` - Cập nhật trạng thái đơn (admin)
- `GET /api/orders/all` - Xem toàn bộ đơn hàng, hỗ trợ lọc (admin)
- `GET /api/orders/summary` - Thống kê tổng quan (admin)
- `GET /api/orders/metrics` - Dữ liệu biểu đồ doanh thu/top sản phẩm (admin)

### Upload
- `POST /api/upload` - Upload ảnh
- `GET /api/upload/{filename}` - Lấy ảnh

### Health
- `GET /api/health` - Health check

Xem chi tiết API documentation tại: http://localhost:8000/docs

## 🔐 Tài khoản mẫu

Sau khi chạy seed script, bạn có thể đăng nhập với:

- **Admin:**
  - Username: `admin`
  - Password: `admin123`

- **User:**
  - Username: `testuser`
  - Password: `test123`

## 📦 Cấu trúc dự án

```
CSDL/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Cấu hình
│   │   ├── database.py          # MongoDB connection
│   │   ├── auth.py              # Authentication
│   │   ├── utils.py             # Utilities
│   │   ├── models/              # Pydantic models
│   │   │   ├── product.py
│   │   │   ├── category.py
│   │   │   ├── user.py
│   │   │   ├── cart.py
│   │   │   └── order.py
│   │   └── routers/             # API routers
│   │       ├── auth.py
│   │       ├── products.py
│   │       ├── categories.py
│   │       ├── cart.py
│   │       ├── upload.py
│   │       ├── orders.py
│   │       └── health.py
│   ├── requirements.txt
│   ├── seed_data.py             # Seed script
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/                 # API clients
│   │   ├── components/          # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/               # Pages
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

## 📝 Ghi chú

- MongoDB indexes được tạo tự động khi kết nối database
- File upload được lưu tại `./uploads` (có thể cấu hình trong `.env`)
- JWT token có thời hạn mặc định 30 phút (có thể cấu hình)
- CORS được cấu hình cho phép tất cả origins (chỉ dùng cho development)

## 🚀 Triển khai

### Production Checklist

1. ✅ Thay đổi `SECRET_KEY` trong `.env`
2. ✅ Cấu hình CORS cho frontend domain cụ thể
3. ✅ Sử dụng MongoDB Atlas hoặc managed database
4. ✅ Sử dụng nginx hoặc reverse proxy
5. ✅ Cấu hình HTTPS
6. ✅ Sử dụng environment variables cho sensitive data
7. ✅ Thiết lập logging và monitoring
8. ✅ Backup database thường xuyên

## 📄 License

MIT License

## 👨‍💻 Tác giả

Product Catalog - E-commerce Mini

---

**Happy Coding! 🎉**

## 🔧 Tài liệu hệ thống & MongoDB

### Kiến trúc tổng quan

- **Backend (FastAPI)**: cung cấp REST API cho auth, sản phẩm, danh mục, giỏ hàng, đơn hàng, upload. Kết nối MongoDB qua Motor async, quản lý phiên bản schema bằng Pydantic.
- **Frontend (React/Vite)**: sử dụng React Router, React Query để tương tác API, Tailwind CSS cho UI, và Recharts cho biểu đồ admin.
- **Auth**: JWT lưu trên frontend (localStorage). Backend bảo vệ endpoints bằng dependency `get_current_user`/`get_current_admin_user`.
- **Deploy**: Docker Compose gồm `mongodb`, `backend`, `frontend`. `upload` mount volume để lưu ảnh.

### MongoDB được áp dụng ở đâu?

| Collection  | Mô tả | File định nghĩa |
|-------------|-------|-----------------|
| `users`     | Lưu thông tin tài khoản, hash mật khẩu, role (`user`/`admin`). | `app/models/user.py` |
| `products`  | Sản phẩm với slug, giá, category, tags, hình ảnh, specs linh hoạt. | `app/models/product.py` |
| `categories`| Danh mục + slug, hỗ trợ parent. | `app/models/category.py` |
| `carts`     | Giỏ hàng theo `user_id`, items snapshot. | `app/models/cart.py` |
| `orders`    | Đơn hàng (items, shipping, status, notes, metrics). | `app/models/order.py` |

### Ứng dụng MongoDB như thế nào?

1. **Kết nối & Index**  
   - `app/database.py` khởi tạo `AsyncIOMotorClient`, tạo index text (`name`, `description`, `brand`) để hỗ trợ search.  
   - Index thêm cho `category`, `price`, `slug`, `createdAt`, `users.email`, `orders.user_id`, `orders.status`, v.v.

2. **CRUD Products/Categories**  
   - Endpoints trong `app/routers/products.py` và `app/routers/categories.py`.  
   - Search dùng `$text`, filter giá dùng `$gte/$lte`, sort với `.sort`.

3. **Giỏ hàng & Đơn hàng**  
   - Giỏ hàng lưu items với snapshot `price` để tránh thay đổi giá sau này.  
   - Khi checkout (`POST /api/orders`), backend lấy giỏ, validate tồn kho, tạo `orders` entry rồi xoá giỏ.  
   - Admin có thể lọc đơn bằng query params `status`, `search`, `start_date`, `end_date`.  
   - Endpoint `/api/orders/metrics` dùng aggregation (`$group`, `$unwind`) để tính doanh thu theo ngày và top sản phẩm.

4. **Seed dữ liệu**  
   - `seed_data.py` tạo categories/products mẫu, user demo, và 8 đơn hàng giả lập với trạng thái khác nhau -> giúp dashboard có dữ liệu ngay.
