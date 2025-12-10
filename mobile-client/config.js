// API Configuration
// Change this to your backend URL when deploying
export const API_URL = __DEV__ 
  ? 'http://localhost:5001/api'  // Development - use your local IP for physical devices
  : 'https://your-production-api.com/api';  // Production - update this

export const APP_NAME = 'Recruitment Client';
export const APP_VERSION = '1.0.0';
