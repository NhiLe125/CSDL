import client from './client'

export const getProducts = async (params = {}) => {
  const response = await client.get('/api/products', { params })
  return response.data
}

export const getProduct = async (id) => {
  const response = await client.get(`/api/products/${id}`)
  return response.data
}

export const getProductBySlug = async (slug) => {
  const response = await client.get(`/api/products/slug/${slug}`)
  return response.data
}

export const createProduct = async (data) => {
  const response = await client.post('/api/products', data)
  return response.data
}

export const updateProduct = async (id, data) => {
  const response = await client.put(`/api/products/${id}`, data)
  return response.data
}

export const deleteProduct = async (id) => {
  await client.delete(`/api/products/${id}`)
}

