import { useQuery } from '@tanstack/react-query'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'
import { getOrders } from '../api/orders'

export default function Orders() {
  const authenticated = isAuthenticated()

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: authenticated,
  })

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-4">Bạn chưa có đơn hàng nào.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Đơn hàng đã đặt</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <p className="font-semibold text-lg">Mã đơn: {order.id}</p>
                <p className="text-sm text-gray-500">
                  Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="text-right mt-4 sm:mt-0">
                <p className="text-xl font-bold text-red-600">
                  {order.total.toLocaleString('vi-VN')} ₫
                </p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm capitalize bg-blue-100 text-blue-700">
                  {order.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.product_id}`} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} x {item.product_name || item.product_id}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p>
                <strong>Người nhận:</strong> {order.shipping.full_name}
              </p>
              <p>
                <strong>Email:</strong> {order.shipping.email}
              </p>
              <p>
                <strong>Điện thoại:</strong> {order.shipping.phone}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {order.shipping.address}
              </p>
              {order.note && (
                <p>
                  <strong>Ghi chú:</strong> {order.note}
                </p>
              )}
            </div>

            {!!order.status_notes?.length && (
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">Ghi chú trạng thái:</p>
                <ul className="list-disc list-inside">
                  {order.status_notes.map((note, idx) => (
                    <li key={`${order.id}-note-${idx}`}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

