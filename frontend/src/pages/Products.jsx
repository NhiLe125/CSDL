import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../api/products'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import Pagination from '../components/Pagination'

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState('desc')
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['products', page, searchQuery, filters, sort, order],
    queryFn: () =>
      getProducts({
        q: searchQuery || undefined,
        page,
        limit: 20,
        category: filters.category || undefined,
        min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        brand: filters.brand || undefined,
        sort,
        order,
      }),
  })

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sản phẩm</h1>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <FilterPanel onFilterChange={handleFilterChange} filters={filters} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {data?.total ? `Tìm thấy ${data.total} sản phẩm` : 'Đang tải...'}
            </p>
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-700">Sắp xếp:</label>
              <select
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [sortField, sortOrder] = e.target.value.split('-')
                  setSort(sortField)
                  setOrder(sortOrder)
                  setPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">Mới nhất</option>
                <option value="created_at-asc">Cũ nhất</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
                <option value="name-asc">Tên: A → Z</option>
              </select>
            </div>
          </div>

          {/* Products List */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Có lỗi xảy ra khi tải sản phẩm</p>
            </div>
          ) : data?.items?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {data?.items?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={data?.page || 1}
                pages={data?.pages || 0}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

