import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import api from '@/services/api'

// Use relative URL to leverage Vite proxy, or absolute if VITE_API_URL is set
const API_URL = import.meta.env.VITE_API_URL || '/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const recruiter = ref(JSON.parse(localStorage.getItem('recruiter') || 'null'))
  const adminToken = ref(localStorage.getItem('adminToken') || null)
  const admin = ref(JSON.parse(localStorage.getItem('admin') || 'null'))
  const clientToken = ref(localStorage.getItem('clientToken') || null)
  const client = ref(JSON.parse(localStorage.getItem('client') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdminAuthenticated = computed(() => !!adminToken.value)
  const isClientAuthenticated = computed(() => !!clientToken.value)

  // Don't set axios defaults here - let the API interceptor handle it based on route

  async function login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/recruiter/login`, {
        email,
        password
      })
      
      if (!response.data || !response.data.token) {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        }
      }
      
      token.value = response.data.token
      recruiter.value = response.data.recruiter
      
      localStorage.setItem('token', token.value)
      localStorage.setItem('recruiter', JSON.stringify(recruiter.value))
      
      // Clear other tokens to avoid conflicts
      localStorage.removeItem('clientToken')
      localStorage.removeItem('client')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      
      return { success: true }
    } catch (error) {
      // Handle rate limit errors specifically
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60
        return { 
          success: false, 
          error: `Too many requests. Please wait ${retryAfter} seconds and try again.` 
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed. Please check your credentials.' 
      }
    }
  }

  async function refreshRecruiter() {
    if (!isAuthenticated.value) return;
    try {
      const response = await api.get('/recruiters/me');
      if (response.data) {
        recruiter.value = response.data;
        localStorage.setItem('recruiter', JSON.stringify(recruiter.value));
      }
    } catch (error) {
      // Don't auto-logout on refresh failure - let the component handle it
      // Only logout if it's a clear authentication error and we're not already on login page
      if (error.response?.status === 401 && window.location.pathname !== '/login') {
        // Clear token but don't redirect - let the router guard handle it
        token.value = null;
        recruiter.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('recruiter');
      }
    }
  }

  async function refreshAdmin() {
    if (!isAdminAuthenticated.value) return;
    try {
      const response = await axios.get(`${API_URL}/admin/me`, {
        headers: { Authorization: `Bearer ${adminToken.value}` }
      });
      if (response.data) {
        // Create new object to ensure reactivity
        admin.value = { ...response.data };
        localStorage.setItem('admin', JSON.stringify(admin.value));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        adminLogout();
      }
    }
  }

  async function adminLogin(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, {
        email,
        password
      });
      
      if (!response.data || !response.data.token) {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
      
      adminToken.value = response.data.token;
      admin.value = response.data.admin;
      
      localStorage.setItem('adminToken', adminToken.value);
      localStorage.setItem('admin', JSON.stringify(admin.value));
      
      // Clear other tokens to avoid conflicts
      localStorage.removeItem('token')
      localStorage.removeItem('recruiter')
      localStorage.removeItem('clientToken')
      localStorage.removeItem('client')
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Admin login failed. Please check your credentials.' 
      };
    }
  }

  function logout() {
    token.value = null
    recruiter.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('recruiter')
    delete axios.defaults.headers.common['Authorization']
  }

  async function clientLogin(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/client/login`, {
        email,
        password
      });
      
      if (!response.data || !response.data.token) {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
      
      clientToken.value = response.data.token;
      client.value = response.data.client;
      
      localStorage.setItem('clientToken', clientToken.value);
      localStorage.setItem('client', JSON.stringify(client.value));
      
      // Clear other tokens to avoid conflicts
      localStorage.removeItem('token')
      localStorage.removeItem('recruiter')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin')
      
      return { success: true };
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        return { 
          success: false, 
          error: `Too many requests. Please wait ${retryAfter} seconds and try again.` 
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Client login failed. Please check your credentials.' 
      };
    }
  }

  async function refreshClient() {
    if (!isClientAuthenticated.value) return;
    try {
      const response = await axios.get(`${API_URL}/clients/me`, {
        headers: { Authorization: `Bearer ${clientToken.value}` }
      });
      if (response.data) {
        client.value = { ...response.data };
        localStorage.setItem('client', JSON.stringify(client.value));
      }
    } catch (error) {
      if (error.response?.status === 401) {
        clientLogout();
      }
    }
  }

  function adminLogout() {
    adminToken.value = null
    admin.value = null
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    delete axios.defaults.headers.common['Authorization']
  }

  function clientLogout() {
    clientToken.value = null
    client.value = null
    localStorage.removeItem('clientToken')
    localStorage.removeItem('client')
    delete axios.defaults.headers.common['Authorization']
  }

  return {
    token,
    recruiter,
    isAuthenticated,
    adminToken,
    admin,
    isAdminAuthenticated,
    clientToken,
    client,
    isClientAuthenticated,
    login,
    adminLogin,
    clientLogin,
    logout,
    adminLogout,
    clientLogout,
    refreshRecruiter,
    refreshAdmin,
    refreshClient
  }
})

