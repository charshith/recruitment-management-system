# Recruitment Client Mobile App

A React Native mobile application for clients to view their job applications, active sessions, and job statistics. Built with Expo for cross-platform support (Android & iOS).

## Features

- 🔐 Client authentication
- 📊 Dashboard with job statistics
- ⏱️ Active session monitoring with live timer
- 📜 Session history
- 📱 Native mobile experience
- 🔄 Pull-to-refresh
- 🌐 Works with existing backend API

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: Xcode (Mac only)
- For Android: Android Studio

## Setup

1. **Install dependencies:**
   ```bash
   cd mobile-client
   npm install
   ```

2. **Configure API URL:**
   - Open `config.js`
   - Update `API_URL` to point to your backend server
   - For physical devices, use your computer's IP address (e.g., `http://192.168.1.100:5001/api`)
   - For emulators:
     - Android: `http://10.0.2.2:5001/api`
     - iOS: `http://localhost:5001/api`

3. **Start the development server:**
   ```bash
   npm start
   ```

## Running the App

### Development

- **iOS Simulator:** Press `i` in the terminal or run `npm run ios`
- **Android Emulator:** Press `a` in the terminal or run `npm run android`
- **Physical Device:** Scan the QR code with Expo Go app

### Building for Production

#### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview
```

#### iOS (IPA)

```bash
# Build for iOS
eas build --platform ios --profile preview
```

#### Using Expo Application Services (EAS)

1. Create an Expo account at https://expo.dev
2. Run `eas build:configure`
3. Update `app.json` with your project ID
4. Run `eas build --platform all`

## Project Structure

```
mobile-client/
├── App.js                 # Main app component with navigation
├── config.js              # API configuration
├── screens/
│   ├── LoginScreen.js     # Client login screen
│   └── DashboardScreen.js # Client dashboard
├── services/
│   ├── api.js             # Axios instance with interceptors
│   ├── auth.js            # Authentication service
│   └── clientService.js   # Client API calls
└── assets/                # App icons and splash screens
```

## API Integration

The app uses the same backend API as the web application:

- **Authentication:** `/api/auth/client/login`
- **Dashboard:** `/api/clients/me/dashboard`
- **Active Session:** `/api/sessions/me/active`
- **Session History:** `/api/sessions/me/history`

## Configuration

### API URL Setup

For different environments, update `config.js`:

```javascript
export const API_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:5001/api'  // Development
  : 'https://your-production-api.com/api';  // Production
```

### Finding Your Local IP

- **Mac/Linux:** Run `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows:** Run `ipconfig` and look for IPv4 Address

## Troubleshooting

### Connection Issues

- Ensure your backend server is running
- Check firewall settings
- For physical devices, ensure phone and computer are on the same network
- Verify API URL in `config.js`

### Build Issues

- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

## Notes

- The web application remains completely untouched
- Both web and mobile apps share the same backend API
- Mobile app uses AsyncStorage for token persistence
- All API calls are authenticated using JWT tokens

## License

Same as the main project.
