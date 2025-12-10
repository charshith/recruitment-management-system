import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/client/login', {
        email,
        password,
      });

      if (response.data && response.data.token) {
        // Store token and client data
        await AsyncStorage.setItem('clientToken', response.data.token);
        await AsyncStorage.setItem('client', JSON.stringify(response.data.client));
        return {
          success: true,
          client: response.data.client,
          token: response.data.token,
        };
      }

      return {
        success: false,
        error: 'Invalid response from server',
      };
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || 60;
        return {
          success: false,
          error: `Too many requests. Please wait ${retryAfter} seconds and try again.`,
        };
      }

      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed. Please check your credentials.',
      };
    }
  },

  async logout() {
    try {
      await AsyncStorage.multiRemove(['clientToken', 'client']);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getStoredToken() {
    try {
      return await AsyncStorage.getItem('clientToken');
    } catch (error) {
      return null;
    }
  },

  async getStoredClient() {
    try {
      const clientStr = await AsyncStorage.getItem('client');
      return clientStr ? JSON.parse(clientStr) : null;
    } catch (error) {
      return null;
    }
  },

  async refreshClient() {
    try {
      const response = await api.get('/clients/me');
      if (response.data) {
        await AsyncStorage.setItem('client', JSON.stringify(response.data));
        return { success: true, client: response.data };
      }
      return { success: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
};
