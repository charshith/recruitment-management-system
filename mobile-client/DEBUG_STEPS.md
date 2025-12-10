# Debug Steps - "Something Went Wrong" Error

## Status Check Results

✅ **Backend Server:** Running on port 5001
✅ **Backend Health:** API responding correctly
✅ **Expo Server:** Running

## What I Fixed

1. Simplified `config.js` - removed `__DEV__` check that might cause issues
2. Set API_URL directly to your IP: `http://172.28.25.81:5001/api`

## Next Steps to Debug

### Step 1: Restart Expo with Clear Cache

```bash
# Stop current Expo (Ctrl+C)
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npm start -- --clear
```

### Step 2: Check Expo DevTools

When Expo starts, it should open a browser window with DevTools. Look for:
- Red error messages
- JavaScript errors
- Module not found errors

### Step 3: Check Terminal Output

Look in the terminal where `npm start` is running for:
- Red error messages
- Stack traces
- "Cannot find module" errors

### Step 4: Test API Connection from Phone

Make sure your phone can reach the backend:
1. On your phone's browser, go to: `http://172.28.25.81:5001/api/health`
2. Should see: `{"status":"ok","message":"Server is running",...}`
3. If you see "Cannot connect", check:
   - Phone and computer on same WiFi
   - Firewall not blocking port 5001
   - IP address is correct (might have changed)

### Step 5: Check Expo Go Logs

In Expo Go app:
1. Shake your phone (or press Cmd+D on simulator)
2. Select "Debug Remote JS"
3. Check browser console for errors

### Step 6: Try iOS Simulator Instead

If physical device keeps failing:
```bash
cd /Users/harshithcharugulla/Desktop/cons_app/mobile-client
npm run ios
```

This will show errors more clearly.

## Common Errors to Look For

1. **"Network Error"** - Backend not reachable from phone
2. **"Cannot find module"** - Missing dependency
3. **"TypeError: Cannot read property"** - Code error
4. **"SyntaxError"** - JavaScript syntax issue

## Share the Error

When you see "something went wrong", please share:
1. The exact error message from terminal
2. Any red text in Expo DevTools browser
3. What happens when you test `http://172.28.25.81:5001/api/health` on your phone's browser
