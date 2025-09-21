import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    getProfile: () => apiClient.get('/auth/profile')
  },
  
  // Task endpoints
  tasks: {
    getAll: (params) => apiClient.get('/tasks', { params }),
    getById: (id) => apiClient.get(`/tasks/${id}`),
    create: (taskData) => apiClient.post('/tasks', taskData),
    update: (id, updates) => apiClient.put(`/tasks/${id}`, updates),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
    addComment: (id, comment) => apiClient.post(`/tasks/${id}/comments`, comment)
  },
  
  // User endpoints
  users: {
    getAll: () => apiClient.get('/users'),
    getMembers: () => apiClient.get('/users/members')
  }
}

export default apiClient