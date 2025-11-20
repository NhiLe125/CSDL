import client from './client'

export const getCategories = async () => {
  const response = await client.get('/api/categories')
  return response.data
}

export const getCategory = async (id) => {
  const response = await client.get(`/api/categories/${id}`)
  return response.data
}

export const createCategory = async (data) => {
  const response = await client.post('/api/categories', data)
  return response.data
}

export const updateCategory = async (id, data) => {
  const response = await client.put(`/api/categories/${id}`, data)
  return response.data
}

export const deleteCategory = async (id) => {
  await client.delete(`/api/categories/${id}`)
}

