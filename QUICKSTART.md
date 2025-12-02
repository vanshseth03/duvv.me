# 🚀 QUICK START - DUVV.ME

The **fastest** way to test your app locally!

---

## ⚡ 1-Command Start

### Option 1: PowerShell Script (Recommended)
```powershell
# Right-click start.ps1 → Run with PowerShell
# OR in terminal:
.\start.ps1
```

**This script automatically:**
- ✅ Detects if you're using API mode or LocalStorage mode
- ✅ Checks for dependencies (Node.js, Python, MongoDB)
- ✅ Installs npm packages if needed
- ✅ Starts backend (if API mode enabled)
- ✅ Starts frontend server
- ✅ Opens browser automatically

### Option 2: Manual Start
```powershell
# Just frontend (LocalStorage mode)
python server.py

# OR with backend (API mode)
# Terminal 1:
node api.js

# Terminal 2:
python server.py
```

---

## 🎯 Choose Your Mode

### LocalStorage Mode (Default) ✨
**Best for:** Quick testing, no setup needed

**Pros:**
- ✅ Zero configuration
- ✅ Works immediately
- ✅ All features functional
- ✅ No server setup needed

**Cons:**
- ❌ Data stored in browser only
- ❌ No real file uploads
- ❌ Lost on browser clear

**Setup:** Nothing! Just run `python server.py`

---

### API Backend Mode 🚀
**Best for:** Production testing, real database

**Pros:**
- ✅ Real MongoDB database
- ✅ File uploads to DigitalOcean
- ✅ Premium payments (Razorpay)
- ✅ Production-ready

**Cons:**
- ⚠️ Requires setup (MongoDB, API keys)
- ⚠️ More configuration

**Setup:**
1. Edit `api-config.js`:
   ```javascript
   USE_API: true  // Change to true
   ```

2. Create `.env` from `.env.example`

3. Add your credentials:
   - MongoDB URI
   - DigitalOcean Spaces keys
   - Razorpay keys
   - JWT secret

4. Run:
   ```powershell
   cd backend
   npm install
   node api.js
   ```

---

## 🔥 Super Quick Test (30 seconds)

```powershell
# 1. Start server
python server.py

# 2. Open browser
https://localhost:8000

# 3. Accept certificate warning

# 4. Test:
✅ Create account
✅ Create a duvv
✅ Submit response
✅ View responses

Done! 🎉
```

---

## 📱 Test on Phone

1. Find your PC's IP:
```powershell
ipconfig
# Look for: IPv4 Address . . . : 192.168.x.x
```

2. On phone (same WiFi):
```
https://192.168.x.x:8000
```

3. Accept certificate warning

4. Test all features on mobile!

---

## 🐛 Quick Troubleshooting

### "SSL Certificate Warning"
**Solution:** Click "Advanced" → "Proceed to localhost" (safe for testing)

### "Microphone not working"
**Check:**
- Using `https://` (not http)
- Certificate accepted
- Browser has microphone permission

### "Can't connect"
**Check:**
- Server running? (should see startup message)
- Using correct URL? (`https://localhost:8000`)
- Firewall blocking? (unlikely for localhost)

### "API not responding" (API mode)
**Check:**
- Backend running? (`node api.js`)
- `.env` file configured?
- MongoDB running? (`net start MongoDB`)

---

## 📊 Check if Working

### LocalStorage Mode
Open browser DevTools (F12):
- Console should show: `Mode: LocalStorage Only`
- Application → Local Storage → see your data

### API Mode
Open browser DevTools (F12):
- Console should show: `Mode: API Backend`
- Visit: `http://localhost:3000/api/health`
- Should see: `{"status":"OK"}`

---

## 🎯 What to Test

### Basic Flow (5 minutes)
1. ✅ Create account → Save recovery code
2. ✅ Create duvv with theme
3. ✅ Copy share link
4. ✅ Open in incognito
5. ✅ Submit text response
6. ✅ View response in dashboard

### Full Features (15 minutes)
7. ✅ Submit audio response (try all 6 filters)
8. ✅ Submit drawing response (try all 4 modes)
9. ✅ Delete response
10. ✅ Delete duvv
11. ✅ Test premium flow
12. ✅ Test account recovery
13. ✅ Test theme toggle
14. ✅ Test on mobile

---

## 📚 Full Documentation

- **TESTING_GUIDE.md** - Complete testing guide
- **API_DOCUMENTATION.md** - API endpoints reference
- **PROJECT_DOCUMENTATION.md** - All features explained
- **README-HTTPS.md** - HTTPS setup details

---

## 🎉 You're Ready!

**LocalStorage Mode:** Just run `python server.py` and go!

**API Mode:** Follow setup in TESTING_GUIDE.md

**Need help?** Check the troubleshooting section above!

---

**Last updated:** December 2024
