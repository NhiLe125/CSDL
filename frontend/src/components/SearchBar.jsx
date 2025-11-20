import { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'

export default function SearchBar({ onSearch, placeholder = 'Tìm kiếm sản phẩm...' }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timer)
  }, [query, onSearch])

  return (
    <div className="relative w-full max-w-md">
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

