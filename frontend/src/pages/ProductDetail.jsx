import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProduct } from '../api/products'
import { addToCart } from '../api/cart'
import { FaStar, FaShoppingCart, FaArrowLeft } from 'react-icons/fa'
import { isAuthenticated } from '../api/auth'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
  })

  const addToCartMutation = useMutation({
    mutationFn: (quantity) => addToCart(id, quantity),
    onSuccess: () => {
      toast.success('Đã thêm vào giỏ hàng!')
      queryClient.invalidateQueries(['cart'])
    },
    onError: () => {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
    },
  })

  const handleAddToCart = (quantity = 1) => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate('/login')
      return
    }
    addToCartMutation.mutate(quantity)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">Sản phẩm không tồn tại</p>
      </div>
    )
  }

  const discountedPrice = product.price * (1 - product.discount / 100)
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/800x800?text=No+Image'

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-700 transition"
      >
        <FaArrowLeft className="mr-2" />
        Quay lại
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x800?text=No+Image'
              }}
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {product.brand && (
            <p className="text-gray-600 mb-4">Thương hiệu: {product.brand}</p>
          )}

          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-400 mr-4">
              <FaStar className="mr-1" />
              <span className="text-gray-700">
                {product.rating.toFixed(1)} ({product.reviews_count} đánh giá)
              </span>
            </div>
          </div>

          <div className="mb-6">
            {product.discount > 0 ? (
              <div>
                <span className="text-4xl font-bold text-red-600">
                  {discountedPrice.toLocaleString('vi-VN')} ₫
                </span>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xl text-gray-500 line-through">
                    {product.price.toLocaleString('vi-VN')} ₫
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded font-semibold">
                    -{product.discount}%
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-4xl font-bold text-gray-800">
                {product.price.toLocaleString('vi-VN')} ₫
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              <strong>Mô tả:</strong>
            </p>
            <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
          </div>

          {Object.keys(product.specs || {}).length > 0 && (
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>Thông số kỹ thuật:</strong>
              </p>
              <ul className="space-y-1">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key} className="text-gray-600">
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              <strong>Tình trạng:</strong>
            </p>
            {product.stock > 0 ? (
              <p className="text-green-600 font-semibold">
                Còn hàng ({product.stock} sản phẩm)
              </p>
            ) : (
              <p className="text-red-600 font-semibold">Hết hàng</p>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <strong>Tags:</strong>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => handleAddToCart(1)}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <FaShoppingCart className="mr-2" />
            {addToCartMutation.isPending
              ? 'Đang thêm...'
              : product.stock === 0
              ? 'Hết hàng'
              : 'Thêm vào giỏ hàng'}
          </button>
        </div>
      </div>
    </div>
  )
}

