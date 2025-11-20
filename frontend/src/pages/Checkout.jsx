import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCart } from '../api/cart'
import { createOrder } from '../api/orders'
import { isAuthenticated } from '../api/auth'
import { Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Checkout() {
  const authenticated = isAuthenticated()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: getCart,
    enabled: authenticated,
  })

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success('Đặt hàng thành công!')
      queryClient.invalidateQueries(['cart'])
      queryClient.invalidateQueries(['orders'])
      navigate('/')
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Không thể đặt hàng. Vui lòng thử lại.'
      toast.error(message)
    },
  })

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    note: '',
  })

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    toast.error('Giỏ hàng trống, vui lòng thêm sản phẩm trước khi thanh toán')
    return <Navigate to="/cart" replace />
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createOrderMutation.mutate({
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      note: formData.note,
    })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ nhận hàng *</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createOrderMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </form>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Thông tin đơn hàng</h2>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>
                  {item.quantity} x {item.product_name || item.product_id}
                </span>
                <span>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-red-600">{cart.total.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

