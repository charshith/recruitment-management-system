# Troubleshooting "Something Went Wrong" Error

## Common Causes and Solutions

### 1. Clear Cache and Restart

```bash
cd mobile-client
npm start -- --clear
```

### 2. Reinstall Dependencies

```bash
cd mobile-client
rm -rf node_modules
npm install
npm start
```

### 3. Check for JavaScript Errors

Open the Expo DevTools in your browser (usually opens automatically) or check the terminal for error messages.

### 4. Check Metro Bundler

Make sure Metro bundler is running properly. If port 8081 is in use:

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use a different port
npm start -- --port 8083
```

### 5. Check Expo Go App Version

Make sure you have the latest version of Expo Go:
- iOS: Update from App Store
- Android: Update from Google Play

### 6. Check Network Connection

- Ensure phone and computer are on the same WiFi network
- Try disabling VPN if active
- Check firewall settings

### 7. Check Backend Server

Make sure backend is running:
```bash
curl http://localhost:5001/api/health
```

### 8. Check API URL Configuration

Verify `config.js` has the correct IP address:
- Physical device: Your computer's IP (172.28.25.81)
- iOS Simulator: localhost
- Android Emulator: 10.0.2.2

### 9. View Detailed Error Logs

In the terminal where you ran `npm start`, look for:
- Red error messages
- Stack traces
- Module not found errors

### 10. Try Development Build

If Expo Go continues to have issues, try a development build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build development version
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

## Quick Fix Commands

```bash
# Full reset
cd mobile-client
rm -rf node_modules .expo
npm install
npm start -- --clear
```

## Still Having Issues?

1. Check the terminal output for specific error messages
2. Check Expo DevTools in browser for detailed errors
3. Try running on a different device/emulator
4. Check if backend server is accessible from your device
