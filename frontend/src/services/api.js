import axios from 'axios'

// Use relative URL to leverage Vite proxy, or absolute if VITE_API_URL is set
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    // Determine which token to use based on the URL path
    const url = config.url || ''
    
    // Get all available tokens
    const clientToken = localStorage.getItem('clientToken')
    const adminToken = localStorage.getItem('adminToken')
    const recruiterToken = localStorage.getItem('token')
    
    // Check for client routes first (more specific)
    if (url.startsWith('/client/') || url.startsWith('/clients/me') || url.startsWith('/sessions/me')) {
      if (clientToken) {
        config.headers.Authorization = `Bearer ${clientToken}`
      }
    } 
    // Check for admin routes
    else if (url.startsWith('/admin/')) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`
      }
    } 
    // Everything else (recruiters, sessions, jobs, auth, etc.) uses recruiter token
    // This includes /sessions/end, /jobs, /recruiters/*, etc.
    else {
      if (recruiterToken) {
        config.headers.Authorization = `Bearer ${recruiterToken}`
      }
    }
    
    // Final fallback: if no Authorization header was set and we have a recruiter token,
    // use it (this handles edge cases where URL matching might fail)
    if (!config.headers.Authorization && recruiterToken) {
      config.headers.Authorization = `Bearer ${recruiterToken}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) - token expired or invalid
    // Only auto-redirect for login endpoints, let components handle their own 401s
    if (error.response?.status === 401 && error.config?.url?.includes('/login')) {
      // Login failed - don't redirect, let the component handle it
      return Promise.reject(error)
    }
    
    // For other 401s, clear tokens but don't auto-redirect
    // Let the components handle the redirect based on their context
    if (error.response?.status === 401) {
      const path = window.location.pathname
      
      // Clear appropriate tokens based on current route
      if (path.startsWith('/client')) {
        localStorage.removeItem('clientToken')
        localStorage.removeItem('client')
      } else if (path.startsWith('/admin')) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('recruiter')
      }
    }
    // Handle 429 (Rate Limit) - show user-friendly message
    if (error.response?.status === 429) {
      const retryAfter = error.response?.data?.retryAfter || 60
      error.response.data = {
        ...error.response.data,
        error: `Too many requests. Please wait ${retryAfter} seconds and try again.`
      }
    }
    return Promise.reject(error)
  }
)

export default api

