import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart, updateCartItem, removeFromCart, clearCart } from '../api/cart'
import { getProduct } from '../api/products'
import { Link } from 'react-router-dom'
import { FaTrash, FaShoppingBag, FaMinus, FaPlus } from 'react-icons/fa'
import { isAuthenticated } from '../api/auth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Cart() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const authenticated = isAuthenticated()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: authenticated,
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }) => updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã xóa khỏi giỏ hàng')
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries(['cart'])
      toast.success('Đã xóa tất cả')
    },
  })

  if (!authenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Vui lòng đăng nhập để xem giỏ hàng</p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Đăng nhập
        </Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-md">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <FaShoppingBag className="text-6xl text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Giỏ hàng</h1>
        {cart.items.length > 0 && (
          <button
            onClick={() => clearMutation.mutate()}
            className="text-red-600 hover:text-red-700 transition"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemCard
              key={item.product_id}
              item={item}
              onUpdate={(quantity) =>
                updateMutation.mutate({ productId: item.product_id, quantity })
              }
              onRemove={() => removeMutation.mutate(item.product_id)}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{cart.total.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-xl font-bold">
                <span>Tổng cộng:</span>
                <span className="text-red-600">
                  {cart.total.toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartItemCard({ item, onUpdate, onRemove, isUpdating }) {
  const { data: product } = useQuery({
    queryKey: ['product', item.product_id],
    queryFn: () => getProduct(item.product_id),
  })

  if (!product) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex gap-4">
      <Link to={`/products/${product.id}`}>
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="w-24 h-24 object-cover rounded"
        />
      </Link>
      <div className="flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-blue-600 transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">
          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => onUpdate(Math.max(1, item.quantity - 1))}
              disabled={isUpdating}
              className="p-2 hover:bg-gray-100 transition"
            >
              <FaMinus className="text-sm" />
            </button>
            <span className="px-4 py-2">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.quantity + 1)}
              disabled={isUpdating}
              className="p-2 hover:bg-gray-100 transition"
            >
              <FaPlus className="text-sm" />
            </button>
          </div>
          <button
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 transition p-2"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}

