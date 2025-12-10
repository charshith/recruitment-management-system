import api from './api';

export const clientService = {
  async getDashboard() {
    try {
      const response = await api.get('/clients/me/dashboard');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to load dashboard',
      };
    }
  },

  async getJobs(page = 1, limit = 20) {
    try {
      const response = await api.get('/clients/me/jobs', {
        params: { page, limit },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to load jobs',
      };
    }
  },

  async getActiveSession() {
    try {
      const response = await api.get('/sessions/me/active');
      return {
        success: true,
        data: response.data || null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to load session',
        data: null,
      };
    }
  },

  async getSessionHistory(limit = 50) {
    try {
      const response = await api.get('/sessions/me/history', {
        params: { limit },
      });
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to load session history',
        data: [],
      };
    }
  },
};
