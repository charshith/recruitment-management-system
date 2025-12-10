# Testing Guide - How to Run the Mobile App

## Prerequisites

1. **Backend Server Must Be Running**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/server
   npm start
   # Server should be running on http://localhost:5001
   ```

2. **Install Expo Go App** (for physical device testing)
   - iOS: Download from App Store
   - Android: Download from Google Play Store

## Step-by-Step Testing Instructions

### Option 1: Test on Physical Device (Recommended for First Test)

1. **Ensure your phone and computer are on the same WiFi network**

2. **Start the backend server:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/server
   npm start
   ```

3. **Start the mobile app:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
   npm start
   ```

4. **You'll see a QR code in the terminal**

5. **On your phone:**
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Scan the QR code from terminal
   - App will load on your phone

6. **Test Login:**
   - Use client credentials (email/password)
   - Should see dashboard with stats and sessions

### Option 2: Test on iOS Simulator (Mac Only)

1. **Start backend server:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/server
   npm start
   ```

2. **Update config.js for simulator:**
   ```javascript
   export const API_URL = __DEV__ 
     ? 'http://localhost:5001/api'  // For iOS Simulator
     : 'https://your-production-api.com/api';
   ```

3. **Start the app:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
   npm run ios
   # Or: npm start, then press 'i'
   ```

4. **iOS Simulator will open automatically**

### Option 3: Test on Android Emulator

1. **Start backend server:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/server
   npm start
   ```

2. **Update config.js for emulator:**
   ```javascript
   export const API_URL = __DEV__ 
     ? 'http://10.0.2.2:5001/api'  // For Android Emulator
     : 'https://your-production-api.com/api';
   ```

3. **Start Android Emulator** (from Android Studio)

4. **Start the app:**
   ```bash
   cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
   npm run android
   # Or: npm start, then press 'a'
   ```

## Quick Test Checklist

- [ ] Backend server is running on port 5001
- [ ] API URL in config.js matches your testing method
- [ ] Phone/emulator and computer on same network (for physical device)
- [ ] Expo Go app installed (for physical device)
- [ ] Client credentials ready for login

## Testing Features

1. **Login Screen:**
   - Enter client email and password
   - Should navigate to dashboard on success
   - Should show error on invalid credentials

2. **Dashboard:**
   - Shows job statistics (Today, Week, Month, Total)
   - Shows active session if one exists
   - Shows session history
   - Shows recent jobs
   - Pull down to refresh

3. **Session Management:**
   - Active session shows live timer
   - Session history shows past sessions
   - Auto-refreshes every minute

4. **Logout:**
   - Tap logout button
   - Should return to login screen

## Troubleshooting

### "Network Error" or "Can't connect to API"

1. **Check backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   # Should return: {"status":"ok",...}
   ```

2. **Check API URL in config.js:**
   - Physical device: Use your computer's IP (172.28.25.81)
   - iOS Simulator: Use localhost
   - Android Emulator: Use 10.0.2.2

3. **Check firewall:**
   - Ensure port 5001 is not blocked
   - Try disabling firewall temporarily

4. **Check network:**
   - Phone and computer must be on same WiFi
   - Try restarting WiFi on both devices

### "Expo Go can't connect"

1. **Check Expo CLI is installed:**
   ```bash
   npx expo --version
   ```

2. **Clear cache:**
   ```bash
   cd mobile-client
   npm start -- --clear
   ```

3. **Restart Expo:**
   ```bash
   npm start
   ```

### App crashes on startup

1. **Check dependencies:**
   ```bash
   cd mobile-client
   npm install
   ```

2. **Clear cache and restart:**
   ```bash
   npm start -- --clear
   ```

## Common Commands

```bash
# Start development server
npm start

# Start for iOS
npm run ios

# Start for Android
npm run android

# Clear cache and start
npm start -- --clear

# Check if backend is running
curl http://localhost:5001/api/health
```

## Next Steps After Testing

Once testing is successful:
1. Build production APK/IPA for app stores
2. Update API URL to production server
3. Configure app icons and splash screens
4. Set up app store accounts (Google Play & Apple App Store)
