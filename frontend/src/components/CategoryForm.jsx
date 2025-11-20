import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, updateCategory } from '../api/categories'
import toast from 'react-hot-toast'

export default function CategoryForm({ category, onClose }) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('Đã tạo danh mục')
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories'])
      toast.success('Đã cập nhật danh mục')
      onClose()
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (category) {
      updateMutation.mutate({ id: category.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {category ? 'Sửa danh mục' : 'Thêm danh mục'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
            >
              {category ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

