// API Configuration
// Change this to your backend URL when deploying
export const API_URL = __DEV__ 
  ? 'http://172.28.25.81:5001/api'  // Development - your local IP (update if changed)
  : 'https://your-production-api.com/api';  // Production - update this

// For iOS Simulator, use: 'http://localhost:5001/api'
// For Android Emulator, use: 'http://10.0.2.2:5001/api'
// For Physical Device, use: 'http://YOUR_COMPUTER_IP:5001/api'

export const APP_NAME = 'Recruitment Client';
export const APP_VERSION = '1.0.0';
