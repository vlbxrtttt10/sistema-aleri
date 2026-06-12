import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Adjunta el token JWT a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aleri-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expira, redirige al login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aleri-token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
