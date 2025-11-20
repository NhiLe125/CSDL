import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '../api/products'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => getProducts({ limit: 8, sort: 'rating', order: 'desc' }),
  })

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 mb-12 rounded-lg">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Chào mừng đến Product Catalog</h1>
          <p className="text-xl mb-8">Khám phá hàng ngàn sản phẩm chất lượng cao</p>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Xem sản phẩm
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Sản phẩm nổi bật</h2>
        
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data?.items?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/products"
            className="text-blue-600 hover:underline font-semibold"
          >
            Xem tất cả sản phẩm →
          </Link>
        </div>
      </section>
    </div>
  )
}

