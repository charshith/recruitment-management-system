# Quick Start Guide

## 1. Install Dependencies

```bash
cd mobile-client
npm install
```

## 2. Configure API URL

Edit `config.js` and set your backend API URL:

```javascript
export const API_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:5001/api'  // For physical devices
  : 'https://your-production-api.com/api';
```

**Finding your IP:**
- Mac/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` (look for IPv4 Address)

**For Emulators:**
- Android: Use `http://10.0.2.2:5001/api`
- iOS: Use `http://localhost:5001/api`

## 3. Start Development Server

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 4. Test the App

1. Make sure your backend server is running on port 5001
2. Use client credentials to login
3. View dashboard with stats and sessions

## Building for Production

### Android APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform android --profile preview
```

### iOS IPA

```bash
eas build --platform ios --profile preview
```

## Troubleshooting

**Can't connect to API:**
- Check backend is running
- Verify IP address in config.js
- Ensure phone/emulator and computer are on same network
- Check firewall settings

**Build errors:**
- Clear cache: `expo start -c`
- Reinstall: `rm -rf node_modules && npm install`

## Notes

- Web app is completely untouched
- Mobile app uses same backend API
- All authentication handled via JWT tokens
