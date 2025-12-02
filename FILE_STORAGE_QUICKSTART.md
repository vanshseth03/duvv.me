# 🚀 QUICK START GUIDE - File-Based Storage

## ✅ Setup (2 minutes)

### 1. Install Dependencies
```powershell
cd backend
npm install
```

### 2. Start Backend API
```powershell
# In backend folder
node api-file-storage.js
```

You should see:
```
========================================
🚀 DUVV.ME API SERVER (FILE STORAGE)
========================================
📡 Server running on: http://localhost:3000
📁 Data stored in: C:\Users\...\backend\data
📂 Uploads stored in: C:\Users\...\backend\uploads
========================================
```

### 3. Configure Frontend
Open `api-config.js` and ensure:
```javascript
const API_CONFIG = {
    USE_API: true,  // ← Must be true for backend
    BASE_URL: 'http://localhost:3000/api'
};
```

### 4. Start Frontend
```powershell
# In root folder (separate terminal)
python server.py
```

### 5. Open Browser
Visit: `https://localhost:8000`

## 🎯 What Happens Now?

### Data Storage Location
All your data is stored in **easy-to-inspect files**:

```
backend/
├── data/
│   ├── users.json ← All registered users
│   ├── duvvs.json ← All questions/duvvs
│   ├── responses.json ← All responses
│   └── transactions.json ← Payment records
└── uploads/
    ├── audio/ ← Voice response files
    └── images/ ← Drawing response files
```

### Testing the System

#### 1. Register a User
- Go to `https://localhost:8000`
- Enter username: `testuser`
- Click Register
- You'll get a recovery code (save it!)
- Check `backend/data/users.json` - you'll see your user!

#### 2. Create a Duvv
- You're now on the dashboard
- Click "Create New Duvv"
- Enter question: "What's your favorite movie?"
- Select response types: Text, Audio, Drawing
- Click Create
- Check `backend/data/duvvs.json` - your duvv is there!

#### 3. Get Shareable Link
- Copy the duvv link
- Open in incognito/another browser
- You'll see the response page

#### 4. Submit Responses
- Try text response → Check `backend/data/responses.json`
- Try audio response → Check `backend/uploads/audio/` folder
- Try drawing → Check `backend/uploads/images/` folder

#### 5. View Responses
- Go back to dashboard as testuser
- Click on your duvv
- See all responses!

## 🔍 Inspecting Data

### View All Users
```powershell
cat backend/data/users.json
```

### View All Duvvs
```powershell
cat backend/data/duvvs.json
```

### View All Responses
```powershell
cat backend/data/responses.json
```

### View Uploaded Files
```powershell
ls backend/uploads/audio
ls backend/uploads/images
```

## 🛠️ Troubleshooting

### Backend won't start?
```powershell
# Check if Node.js is installed
node --version

# Should show: v16.x.x or higher
```

### Port 3000 already in use?
Edit `api-file-storage.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

And update `api-config.js`:
```javascript
BASE_URL: 'http://localhost:3001/api'
```

### Data not showing up?
Check `api-config.js`:
```javascript
USE_API: true  // ← Must be true, not false
```

### Can't connect to backend?
Check if backend is running:
```powershell
# Should see the server running in terminal
# Try visiting: http://localhost:3000/api/health
```

## 📝 Comparison Table

| Feature | LocalStorage Mode | File Storage API | MongoDB API |
|---------|------------------|------------------|-------------|
| Setup Time | 0 seconds | 2 minutes | 30+ minutes |
| Dependencies | None | Node.js | Node.js + MongoDB |
| Data Location | Browser | PC Folder | Cloud Database |
| Persistence | Temporary | Permanent | Permanent |
| Inspect Data | Browser DevTools | Text Editor | Database Client |
| File Uploads | ❌ No | ✅ Yes | ✅ Yes |
| Multi-Device | ❌ No | ✅ Yes (local network) | ✅ Yes (internet) |
| Production Ready | ❌ No | ⚠️ Testing only | ✅ Yes |

## ✨ Why File Storage is Perfect for Testing

1. **See Your Data**: Just open JSON files in any text editor
2. **No Database Setup**: No MongoDB, no connection strings, no complexity
3. **Easy Debugging**: Know exactly where everything is stored
4. **Fast Iteration**: Make changes and restart server in seconds
5. **Version Control Friendly**: Can commit sample data to git
6. **Learn the System**: Understand data structure before MongoDB

## 🎓 Learning Exercise

Try this to understand the flow:

1. **Create a user** → Open `users.json` → See your user object
2. **Create a duvv** → Open `duvvs.json` → See your duvv with unique ID
3. **Submit response** → Open `responses.json` → See response linked to duvv
4. **Check stats** → Open `users.json` → See stats updated

## 🚀 When to Switch to MongoDB?

Switch to `api.js` (MongoDB version) when:
- ✅ Deploying to production
- ✅ Expecting high traffic (1000+ users)
- ✅ Need advanced queries
- ✅ Want automatic backups
- ✅ Need cloud file storage (DigitalOcean Spaces)

For now, **file storage is perfect** for:
- ✅ Development
- ✅ Testing
- ✅ Learning the system
- ✅ Demo purposes
- ✅ Local prototyping

---

**🎉 You're all set! Start testing the complete ecosystem.**

**Next Steps:**
1. Run the quick start commands above
2. Create a test user
3. Create a test duvv
4. Share the link and get responses
5. Inspect the data files to see how it all works

**Need help?** Check `ECOSYSTEM_EXPLAINED.md` for the complete architecture explanation.
