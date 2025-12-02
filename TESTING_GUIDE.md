# 🧪 DUVV.ME - LOCAL TESTING GUIDE

Complete guide to test your app locally with or without the backend API.

---

## 🎯 Two Testing Modes

### Mode 1: LocalStorage Only (No Backend Required) ✨
- ✅ **Easiest to start**
- ✅ All features work
- ✅ Data stored in browser
- ❌ No real file uploads
- ❌ Data lost on browser clear

### Mode 2: Full API Backend (Complete Setup) 🚀
- ✅ Real database storage
- ✅ File uploads to DigitalOcean
- ✅ Premium payments (Razorpay)
- ✅ Production-ready
- ⚠️ Requires setup

---

## 🏁 Quick Start: LocalStorage Mode

### Step 1: Open Terminal
```powershell
cd "C:\Users\sange\OneDrive\Desktop\Rants ngl"
```

### Step 2: Start HTTPS Server (for microphone)
```powershell
python server.py
```

**You'll see:**
```
============================================================
   🕊️  duvv.me LOCAL SERVER STARTING...
============================================================

✅ SSL/HTTPS Enabled! (Microphone will work)

📍 Access from THIS computer:
   https://localhost:8000/

📱 Access from PHONE (Same WiFi):
   https://192.168.x.x:8000/
```

### Step 3: Open in Browser
```
https://localhost:8000/
```

**Accept the SSL certificate warning** (it's self-signed, safe for local testing)

### Step 4: Test the App
1. ✅ Create account → Get recovery code
2. ✅ Create duvv with any theme
3. ✅ Share link with yourself
4. ✅ Submit text/audio/drawing responses
5. ✅ View responses in dashboard

**All data is stored in browser localStorage!**

---

## 🚀 Full Setup: API Backend Mode

### Prerequisites
- Node.js installed
- MongoDB installed OR MongoDB Atlas account
- DigitalOcean account (for file storage)
- Razorpay account (for payments)

### Step 1: Install Dependencies
```powershell
cd backend
npm install
cd ..
```

**Installs:**
- express (web server)
- mongoose (MongoDB)
- multer (file uploads)
- aws-sdk (DigitalOcean Spaces)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- cors, helmet, morgan (security & logging)
- express-rate-limit (rate limiting)
- dotenv (environment variables)
- axios (HTTP requests)

### Step 2: Setup MongoDB

#### Option A: Local MongoDB on Windows
```powershell
# Download MongoDB Community Server from:
# https://www.mongodb.com/try/download/community

# Install and start service
net start MongoDB

# Verify it's running
mongo --version
```

#### Option B: MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/duvv_me
   ```

### Step 3: Setup DigitalOcean Spaces

1. **Create Space:**
   - Go to https://cloud.digitalocean.com/spaces
   - Click "Create a Space"
   - Choose region: **Bangalore (blr1)** or nearest
   - Name: `duvv-media`
   - Enable CDN: ✅
   - Set to Public (for file access)

2. **Generate API Keys:**
   - Go to API → Spaces Keys
   - Click "Generate New Key"
   - Copy **Access Key** and **Secret Key**

3. **Note your CDN URL:**
   ```
   https://duvv-media.blr1.cdn.digitaloceanspaces.com
   ```

### Step 4: Setup Razorpay

1. Sign up at https://razorpay.com
2. Go to **Settings → API Keys**
3. Generate **Test Keys** (for development)
4. Copy:
   - Key ID: `rzp_test_xxxxxxxxxxxxx`
   - Key Secret: `your_secret_key`

### Step 5: Configure Environment

```powershell
# Copy example file
Copy-Item backend\.env.example backend\.env

# Edit .env file
notepad backend\.env
```

**Fill in your values:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/duvv_me
JWT_SECRET=your-generated-secret-here

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

DO_SPACES_KEY=your_spaces_access_key
DO_SPACES_SECRET=your_spaces_secret_key
DO_SPACES_BUCKET=duvv-media
DO_SPACES_ENDPOINT=blr1.digitaloceanspaces.com
DO_SPACES_CDN_URL=https://duvv-media.blr1.cdn.digitaloceanspaces.com
```

**Generate JWT Secret:**
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 6: Enable API Mode

Edit `api-config.js`:
```javascript
const API_CONFIG = {
    USE_API: true,  // ← Change to true
    API_BASE_URL: 'http://localhost:3000/api',
    TOKEN_KEY: 'duvv_api_token'
};
```

### Step 7: Start Backend Server

```powershell
cd backend
node api.js
```

**You'll see:**
```
============================================================
   🕊️  DUVV.ME API SERVER STARTED
============================================================

📍 Server running on: http://localhost:3000
📊 MongoDB: ✅ Connected
🔒 Security: Rate limiting enabled
☁️  Storage: DigitalOcean Spaces configured
💳 Payment: Razorpay configured

🚀 API Endpoints:
   Health: http://localhost:3000/api/health
   Info: http://localhost:3000/api/info
```

### Step 8: Start Frontend Server

**Open NEW terminal:**
```powershell
cd "C:\Users\sange\OneDrive\Desktop\Rants ngl"
python server.py
```

### Step 9: Test Full Stack

1. Open browser: `https://localhost:8000/`
2. Open DevTools Console (F12)
3. Should see: `Mode: API Backend`

**Test Flow:**
1. ✅ Register account → Stored in MongoDB
2. ✅ Create duvv → Stored in MongoDB
3. ✅ Submit audio response → Uploaded to DigitalOcean
4. ✅ Submit drawing → Uploaded to DigitalOcean
5. ✅ View responses → Loaded from MongoDB
6. ✅ Try premium purchase → Razorpay integration

---

## 🔍 Verify Backend is Working

### Check API Health
Open in browser or use curl:
```
http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "duvv.me API",
  "version": "1.0.0",
  "database": "Connected"
}
```

### Check API Info
```
http://localhost:3000/api/info
```

Shows all available endpoints and features.

### Test Registration with curl
```powershell
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser"}'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "isPremium": false
  },
  "recoveryCode": "ABCD-EFGH",
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

## 🐛 Troubleshooting

### Issue: "SSL Certificate Warning"
**Solution:** This is normal for self-signed certificates. Click "Advanced" → "Proceed to localhost" (safe for local testing)

### Issue: "MongoDB Connection Failed"
**Check:**
```powershell
# Is MongoDB running?
mongo --version

# Start MongoDB service
net start MongoDB
```

**Or use MongoDB Atlas** (cloud, easier)

### Issue: "Microphone Not Working"
**Solution:** Must use HTTPS or localhost. Check:
1. Using `https://localhost:8000/` (not http)
2. SSL certificate accepted
3. Browser has microphone permission

### Issue: "API Not Responding"
**Check:**
```powershell
# Is backend running?
# Terminal should show: "🕊️ DUVV.ME API SERVER STARTED"

# Test health endpoint
curl http://localhost:3000/api/health
```

### Issue: "CORS Error"
**Check:** Both servers running?
- Frontend: `https://localhost:8000`
- Backend: `http://localhost:3000`

### Issue: "File Upload Failed"
**Check DigitalOcean Spaces:**
1. Space is public
2. API keys are correct in `.env`
3. CDN is enabled

### Issue: "Premium Payment Not Working"
**For Testing:**
- Using Razorpay TEST keys
- In production, use LIVE keys
- Test with Razorpay test cards

---

## 📊 Check Your Data

### LocalStorage Mode
**Open DevTools → Application → Local Storage**
- `duvvs_username` - User's duvvs
- `duvvPremium` - Premium status
- `theme` - Theme preference

### API Mode
**MongoDB:**
```powershell
mongo
use duvv_me
db.users.find().pretty()
db.duvvs.find().pretty()
db.responses.find().pretty()
```

**DigitalOcean Spaces:**
- Go to your Space in DigitalOcean dashboard
- Check `audio/` and `drawings/` folders

---

## 🎯 Testing Checklist

### Basic Features ✅
- [ ] User registration
- [ ] Account recovery
- [ ] Create duvv with each theme
- [ ] Text response
- [ ] Audio response (all 6 filters)
- [ ] Drawing response (all 4 modes)
- [ ] View responses
- [ ] Delete response
- [ ] Delete duvv
- [ ] Theme toggle (dark/bright)
- [ ] Copy links
- [ ] Share to story

### Premium Features 💎
- [ ] Premium purchase flow
- [ ] Premium status check
- [ ] Create premium duvv
- [ ] Premium-only colors

### Mobile Testing 📱
- [ ] Access from phone (same WiFi)
- [ ] Responsive design
- [ ] Touch drawing
- [ ] Mobile audio recording

---

## 🚀 Switch Between Modes

### LocalStorage → API
1. Set `USE_API: true` in `api-config.js`
2. Start backend: `node api.js`
3. Refresh browser
4. Data moves to MongoDB

### API → LocalStorage
1. Set `USE_API: false` in `api-config.js`
2. Refresh browser
3. Can stop backend server
4. Data stored in browser

---

## 📝 Development Tips

### Auto-restart Backend on Changes
```powershell
npm install -g nodemon
nodemon api.js
```

### View Backend Logs
Backend shows all API requests:
```
POST /api/auth/register 201 234ms
GET /api/duvvs/testuser 200 45ms
POST /api/responses/text 201 89ms
```

### Clear All Data

**LocalStorage:**
```javascript
// In browser console
localStorage.clear()
location.reload()
```

**MongoDB:**
```javascript
mongo
use duvv_me
db.dropDatabase()
```

### Test with Multiple Users
1. Open Chrome: `https://localhost:8000/`
2. Open Edge: `https://localhost:8000/`
3. Open Incognito: `https://localhost:8000/`
4. Each browser = different user

---

## 🌐 Access from Phone

### Same WiFi Required
1. Find your PC's IP:
```powershell
ipconfig
# Look for: IPv4 Address . . . . . . : 192.168.x.x
```

2. On phone, visit:
```
https://192.168.x.x:8000/
```

3. Accept certificate warning

4. Test all features on mobile!

---

## 📚 Next Steps

### For Production Deployment:
1. Deploy backend to DigitalOcean Droplet
2. Use real domain with SSL
3. Switch to Razorpay LIVE keys
4. Set `NODE_ENV=production`
5. Enable MongoDB authentication
6. Configure firewall rules

### Documentation:
- **API Docs:** `API_DOCUMENTATION.md`
- **Project Info:** `PROJECT_DOCUMENTATION.md`
- **HTTPS Setup:** `README-HTTPS.md`

---

## ❓ Need Help?

### Quick Checks:
1. ✅ Both servers running?
2. ✅ Using HTTPS (not HTTP)?
3. ✅ Certificate accepted?
4. ✅ `.env` file configured?
5. ✅ MongoDB connected?

### Still stuck?
- Check browser console (F12)
- Check backend terminal logs
- Check MongoDB connection
- Verify DigitalOcean Space settings

---

**Happy Testing! 🚀**

Remember: Start with LocalStorage mode for quickest testing!
