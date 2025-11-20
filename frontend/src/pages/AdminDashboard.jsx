import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '../api/products'
import { getCategories, deleteCategory } from '../api/categories'
import {
  getAllOrders,
  getOrderSummary,
  getOrderMetrics,
  updateOrderStatus,
} from '../api/orders'
import toast from 'react-hot-toast'
import ProductForm from '../components/ProductForm'
import CategoryForm from '../components/CategoryForm'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products')

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'products'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Quản lý sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'categories'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Quản lý danh mục
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-semibold transition ${
            activeTab === 'orders'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Đơn hàng
        </button>
      </div>

      {activeTab === 'products' && <ProductsManagement />}
      {activeTab === 'categories' && <CategoriesManagement />}
      {activeTab === 'orders' && <OrdersManagement />}
    </div>
  )
}

function ProductsManagement() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'admin'],
    queryFn: () => getProducts({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products'])
      toast.success('Đã xóa sản phẩm')
    },
  })

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Đang tải...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Sản phẩm</h2>
        <button
          onClick={() => {
            setEditingProduct(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Thêm sản phẩm
        </button>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data?.items?.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.price.toLocaleString('vi-VN')} ₫
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:underline"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>
              </div>
            </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CategoriesManagement() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('Đã xóa danh mục')
    },
  })

  if (isLoading) {
    return <div className="animate-pulse">Đang tải...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh mục</h2>
        <button
          onClick={() => {
            setEditingCategory(null)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Thêm danh mục
        </button>
      </div>

      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={() => {
            setShowForm(false)
            setEditingCategory(null)
          }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <div key={category.id} className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setEditingCategory(category)
                  setShowForm(true)
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Sửa
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
                    deleteMutation.mutate(category.id)
                  }
                }}
                className="text-red-600 hover:underline text-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h3 className="text-xl font-semibold">Chi tiết đơn {order.id}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <div className="px-6 py-4 space-y-6">
          <div>
            <p className="text-sm text-gray-500">Thông tin khách hàng</p>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">{order.shipping.full_name}</p>
                <p className="text-gray-600">{order.shipping.email}</p>
                <p className="text-gray-600">{order.shipping.phone}</p>
              </div>
              <div>
                <p className="font-semibold">Địa chỉ</p>
                <p className="text-gray-600 whitespace-pre-line">{order.shipping.address}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Sản phẩm</p>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity} x {item.product_name}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Trạng thái hiện tại</p>
              <p className="text-lg font-semibold capitalize">{order.status}</p>
              <p className="text-xs text-gray-500 mt-2">
                Tạo lúc {new Date(order.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="text-lg font-semibold text-red-600">
                {order.total.toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>

          {!!order.status_notes?.length && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Ghi chú trạng thái</p>
              <ul className="space-y-1 text-sm text-gray-600">
                {order.status_notes.map((note, idx) => (
                  <li key={`${note}-${idx}`}>• {note}</li>
                ))}
              </ul>
            </div>
          )}

          {order.note && (
            <div>
              <p className="text-sm text-gray-500">Ghi chú của khách</p>
              <p className="text-sm text-gray-700">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

function OrdersManagement() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [selectedOrder, setSelectedOrder] = useState(null)

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['orders', 'summary'],
    queryFn: getOrderSummary,
  })

  const { data: metrics } = useQuery({
    queryKey: ['orders', 'metrics'],
    queryFn: getOrderMetrics,
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'admin', filters],
    queryFn: () =>
      getAllOrders({
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
      }),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }) => updateOrderStatus(id, { status, note }),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries(['orders', 'admin'])
      queryClient.invalidateQueries(['orders', 'summary'])
      queryClient.invalidateQueries(['orders', 'metrics'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Không thể cập nhật trạng thái')
    },
  })

  const statusEntries = summary ? Object.entries(summary.status_counts || {}) : []

  const handleStatusChange = (order, newStatus) => {
    if (order.status === newStatus) return
    const note = window.prompt('Ghi chú (tùy chọn) cho việc cập nhật trạng thái này?') || undefined
    updateStatusMutation.mutate({ id: order.id, status: newStatus, note })
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Tổng quan đơn hàng</h2>

      {summaryLoading ? (
        <div className="animate-pulse h-24 bg-gray-200 rounded-lg mb-6"></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Tổng số đơn</p>
            <p className="text-3xl font-bold">{summary?.total_orders ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-500">Tổng doanh thu</p>
            <p className="text-3xl font-bold text-green-600">
              {(summary?.total_revenue ?? 0).toLocaleString('vi-VN')} ₫
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
            <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {ORDER_STATUSES.map((status) => (
                <div key={status.value} className="bg-gray-50 rounded px-3 py-2 text-center">
                  <p className="text-xs uppercase text-gray-500">{status.label}</p>
                  <p className="text-lg font-semibold">
                    {statusEntries.find(([key]) => key === status.value)?.[1] || 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md h-72">
          <p className="font-semibold mb-4">Doanh thu 7 ngày gần nhất</p>
          {metrics?.revenue_by_date?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.revenue_by_date}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md h-72">
          <p className="font-semibold mb-4">Top sản phẩm theo doanh thu</p>
          {metrics?.top_products?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.top_products}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`} />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm">Chưa có dữ liệu</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Danh sách đơn hàng</h3>
            <p className="text-sm text-gray-500">Quản lý chi tiết từng đơn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full lg:w-auto">
            <div>
              <label className="text-xs text-gray-500">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Tất cả</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên hoặc email"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Từ ngày</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Đến ngày</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {ordersLoading ? (
          <div className="p-6">Đang tải...</div>
        ) : !orders?.length ? (
          <div className="p-6 text-center text-gray-500">Chưa có đơn hàng nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders?.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.shipping.full_name}</div>
                      <div className="text-sm text-gray-500">{order.shipping.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.total.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm capitalize"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

