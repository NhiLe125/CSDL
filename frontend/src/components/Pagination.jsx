import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null

  const pageNumbers = []
  const maxVisible = 5

  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(pages, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
      >
        <FaChevronLeft />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            1
          </button>
          {start > 2 && <span className="px-2">...</span>}
        </>
      )}

      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-4 py-2 border rounded-lg transition ${
            page === num
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-100'
          }`}
        >
          {num}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="px-2">...</span>}
          <button
            onClick={() => onPageChange(pages)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            {pages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition"
      >
        <FaChevronRight />
      </button>
    </div>
  )
}

