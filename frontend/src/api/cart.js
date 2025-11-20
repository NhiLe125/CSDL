import client from './client'

export const getCart = async () => {
  const response = await client.get('/api/cart')
  return response.data
}

export const addToCart = async (productId, quantity = 1) => {
  const response = await client.post('/api/cart/items', {
    product_id: productId,
    quantity,
  })
  return response.data
}

export const updateCartItem = async (productId, quantity) => {
  const response = await client.put(`/api/cart/items/${productId}?quantity=${quantity}`)
  return response.data
}

export const removeFromCart = async (productId) => {
  const response = await client.delete(`/api/cart/items/${productId}`)
  return response.data
}

export const clearCart = async () => {
  await client.delete('/api/cart')
}

