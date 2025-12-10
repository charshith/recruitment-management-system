# Fix: "Failed to Download Remote Update" Error

## What This Error Means

This error happens when Expo Go on your phone can't connect to the Expo development server on your computer.

## Quick Fixes (Try These in Order)

### Fix 1: Use Tunnel Mode (Most Reliable)

```bash
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npx expo start --tunnel
```

This uses Expo's tunnel service, which works even if your phone and computer are on different networks.

### Fix 2: Check Network Connection

1. **Ensure phone and computer are on the same WiFi network**
2. **Check your computer's IP address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
3. **Update config.js with the correct IP:**
   ```javascript
   export const API_URL = 'http://YOUR_ACTUAL_IP:5001/api';
   ```

### Fix 3: Check Firewall

**Mac:**
1. System Settings → Network → Firewall
2. Make sure Expo/Node is allowed through firewall
3. Or temporarily disable firewall to test

### Fix 4: Clear Expo Go Cache

1. In Expo Go app, shake your phone (or press Cmd+D on simulator)
2. Select "Clear cache"
3. Try scanning QR code again

### Fix 5: Restart Everything

```bash
# Stop Expo (Ctrl+C)
# Then:
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npm start -- --clear
```

### Fix 6: Use LAN Mode Explicitly

```bash
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npx expo start --lan
```

## Most Common Solution

**Use tunnel mode** - it's the most reliable:

```bash
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npx expo start --tunnel
```

Then scan the QR code again. Tunnel mode works even if your networks are different!

## Still Not Working?

1. **Check if backend is running:**
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Check Expo server:**
   - Look at terminal for any error messages
   - Make sure port 8081 is not blocked

3. **Try iOS Simulator instead:**
   ```bash
   npm run ios
   ```
