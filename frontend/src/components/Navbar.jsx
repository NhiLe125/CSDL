import { Link, useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa'
import { getStoredUser, logout } from '../api/auth'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getStoredUser())
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Product Catalog
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Sản phẩm
            </Link>
            {user && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Đơn hàng
              </Link>
            )}

            {(!user || user.role !== 'admin') && (
              <Link
                to="/cart"
                className="text-gray-700 hover:text-blue-600 transition relative"
              >
                <FaShoppingCart className="text-xl" />
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' ? (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-blue-600 transition"
                  >
                    Đơn hàng
                  </Link>
                )}
                <span className="text-gray-700 flex items-center">
                  <FaUser className="mr-2" />
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 transition flex items-center"
                >
                  <FaSignOutAlt className="mr-2" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

