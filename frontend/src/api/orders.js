import client from './client'

export const createOrder = async (payload) => {
  const response = await client.post('/api/orders', payload)
  return response.data
}

export const getOrders = async () => {
  const response = await client.get('/api/orders')
  return response.data
}

export const getAllOrders = async (params = {}) => {
  const response = await client.get('/api/orders/all', { params })
  return response.data
}

export const getOrderSummary = async () => {
  const response = await client.get('/api/orders/summary')
  return response.data
}

export const getOrderMetrics = async () => {
  const response = await client.get('/api/orders/metrics')
  return response.data
}

export const updateOrderStatus = async (orderId, payload) => {
  const response = await client.patch(`/api/orders/${orderId}/status`, payload)
  return response.data
}

export const getOrderDetail = async (orderId) => {
  const response = await client.get(`/api/orders/${orderId}`)
  return response.data
}

