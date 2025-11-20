import { Link } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'

export default function ProductCard({ product }) {
  const discountedPrice = product.price * (1 - product.discount / 100)
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x400?text=No+Image'

  return (
    <Link to={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="aspect-square overflow-hidden bg-gray-200">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 h-14">
            {product.name}
          </h3>
          
          {product.brand && (
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          )}

          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-400">
              <FaStar className="mr-1" />
              <span className="text-gray-700 text-sm">
                {product.rating.toFixed(1)} ({product.reviews_count})
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {product.discount > 0 ? (
                <div>
                  <span className="text-2xl font-bold text-red-600">
                    {discountedPrice.toLocaleString('vi-VN')} ₫
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 line-through">
                      {product.price.toLocaleString('vi-VN')} ₫
                    </span>
                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-2xl font-bold text-gray-800">
                  {product.price.toLocaleString('vi-VN')} ₫
                </span>
              )}
            </div>
          </div>

          {product.stock <= 10 && product.stock > 0 && (
            <p className="text-sm text-orange-600 mt-2">
              Còn lại: {product.stock} sản phẩm
            </p>
          )}
          {product.stock === 0 && (
            <p className="text-sm text-red-600 mt-2">Hết hàng</p>
          )}
        </div>
      </div>
    </Link>
  )
}

