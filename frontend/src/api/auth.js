import client from './client'

export const login = async (username, password) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  
  const response = await client.post('/api/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  }
  
  return response.data
}

export const register = async (data) => {
  const response = await client.post('/api/auth/register', data)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await client.get('/api/auth/me')
  return response.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export const getStoredUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

