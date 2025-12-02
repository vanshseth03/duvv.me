# 🌐 DUVV.ME - COMPLETE ECOSYSTEM EXPLANATION

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Storage Mechanisms](#storage-mechanisms)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Data Flow](#data-flow)
6. [File Structure](#file-structure)
7. [How Everything Works Together](#how-everything-works-together)

---

## 🏗️ Architecture Overview

DUVV.ME is a **dual-mode application** that can operate in two distinct ways:

### **Mode 1: LocalStorage Mode (Browser-Only)**
- ✅ No server required
- ✅ Data stored in browser's localStorage
- ✅ Perfect for quick demos and testing
- ❌ Data lost when browser cache is cleared
- ❌ No cross-device sync
- ❌ No file uploads

### **Mode 2: Full Backend API Mode (Client-Server)**
- ✅ Persistent storage on server
- ✅ Cross-device access
- ✅ File uploads (audio, images)
- ✅ Payment processing
- ✅ User authentication
- ✅ Production-ready

**Switching between modes:** Change `USE_API: true/false` in `api-config.js`

---

## 💾 Storage Mechanisms

### **1. LocalStorage Mode Storage**
```
Location: Browser's localStorage API
Access: Only from same browser on same device
Persistence: Until browser cache cleared
Capacity: ~5-10MB limit

Data Structure:
├── localStorage.user → Current user object
├── localStorage.duvvs → Array of questions
├── localStorage.responses → Array of responses
└── localStorage.theme → UI theme settings
```

### **2. File-Based API Storage (For Testing)**
```
Location: backend/data/ folder on your PC
Access: Available to all devices connecting to your PC
Persistence: Permanent until manually deleted
Capacity: Limited by disk space

Directory Structure:
backend/
├── data/
│   ├── users.json → All registered users
│   ├── duvvs.json → All questions/duvvs
│   ├── responses.json → All responses
│   └── transactions.json → Payment records
└── uploads/
    ├── audio/
    │   └── *.mp3, *.wav → Voice responses
    └── images/
        └── *.png, *.jpg → Drawing responses
```

### **3. Production API Storage (MongoDB + DigitalOcean)**
```
Location: Cloud servers (DigitalOcean Droplet)
Access: Available globally via internet
Persistence: Permanent with backups
Capacity: Scalable

Storage Distribution:
├── MongoDB Database (Droplet)
│   ├── users collection → User accounts
│   ├── duvvs collection → Questions
│   ├── responses collection → Response metadata
│   └── transactions collection → Payments
└── DigitalOcean Spaces (S3-compatible)
    ├── Audio files → Voice responses
    └── Image files → Drawing responses
```

---

## 🎨 Frontend Architecture

### **Core Files**

#### **1. HTML Pages**
```
index.html → Landing page with registration/login
app.html → Dashboard (view your duvvs, create new ones)
respond.html → Public response page (answer someone's duvv)
```

#### **2. JavaScript Files**

**script.js** - Authentication & Landing Page
```javascript
// Handles user registration and login
// Functions: register(), login()
// Stores user in localStorage or calls API
```

**app-script.js** - Dashboard Logic
```javascript
// Manages user's duvvs (questions)
// Functions: 
// - createDuvv() → Create new question
// - loadDuvvs() → Load user's questions
// - deleteDuvv() → Delete question
// - copyDuvvLink() → Share link
```

**respond-script.js** - Response Submission
```javascript
// Handles public responses to duvvs
// Functions:
// - submitTextResponse()
// - submitAudioResponse()
// - submitDrawingResponse()
// - applyVoiceFilter() → Voice effects
```

**api-config.js** - Integration Layer ⭐ **KEY FILE**
```javascript
// This is the "brain" that decides:
// Should I use localStorage OR call the backend API?

const API_CONFIG = {
    USE_API: true,  // ← Toggle here to switch modes
    BASE_URL: 'http://localhost:3000/api'
};

// Wrapper functions that work in both modes:
async function createDuvv(question, theme, responseTypes) {
    if (API_CONFIG.USE_API) {
        // Call backend API
        return fetch('/api/duvvs/create', {...});
    } else {
        // Use localStorage
        let duvvs = JSON.parse(localStorage.getItem('duvvs')) || [];
        duvvs.push(newDuvv);
        localStorage.setItem('duvvs', JSON.stringify(duvvs));
    }
}
```

#### **3. CSS Files**
```
styles.css → Main landing page styles
app-styles.css → Dashboard styles
respond-styles.css → Response page styles
```

---

## 🔧 Backend Architecture

### **Two Backend Options**

#### **Option A: api-file-storage.js (Testing - NEW!)**
```javascript
// Storage: JSON files on your PC
// Perfect for: Local testing without MongoDB setup

Storage Location:
backend/data/users.json → [{username, recoveryCode, isPremium}]
backend/data/duvvs.json → [{duvvId, question, responses}]
backend/uploads/audio/ → Voice files
backend/uploads/images/ → Drawing images

Advantages:
✅ No database installation needed
✅ Easy to inspect data (just open JSON files)
✅ Perfect for development and testing
✅ Fast setup - just run: node api-file-storage.js
```

#### **Option B: api.js (Production)**
```javascript
// Storage: MongoDB + DigitalOcean Spaces
// Perfect for: Production deployment

Storage Location:
MongoDB Collections (on DigitalOcean Droplet):
- users → User accounts with authentication
- duvvs → Questions with metadata
- responses → Response records

DigitalOcean Spaces (S3-compatible storage):
- Audio files → Uploaded voice responses
- Image files → Uploaded drawings

Advantages:
✅ Scalable to millions of users
✅ Professional cloud storage
✅ Automatic backups
✅ CDN for fast file delivery
```

### **Backend Components**

#### **1. Authentication System**
```javascript
// JWT (JSON Web Token) based authentication

Flow:
1. User registers → Generate recovery code
2. Recovery code saved → User gets JWT token
3. Token stored in cookie → Used for all API requests
4. Token expires after 30 days → User must login again

Security Features:
- bcrypt password hashing (for recovery codes)
- JWT signature verification
- Rate limiting (max 10 auth attempts per 15 min)
- IP address hashing (for anonymity)
```

#### **2. File Upload System**
```javascript
// Multer middleware for handling file uploads

Process:
1. Frontend sends file → Base64 or multipart/form-data
2. Backend receives → Validates file type and size
3. File saved to disk → Or uploaded to DigitalOcean Spaces
4. URL returned → Frontend can display/play file

Supported Formats:
- Audio: MP3, WAV, WebM (max 10MB)
- Images: PNG, JPG, WebP (max 10MB)
```

#### **3. Payment Integration**
```javascript
// Razorpay for premium subscriptions (₹99/year)

Flow:
1. User clicks "Go Premium"
2. Backend creates Razorpay order
3. Frontend shows payment modal
4. User completes payment
5. Razorpay callback verifies payment
6. Backend activates premium status
7. Transaction saved to database
```

---

## 🔄 Data Flow

### **Scenario 1: User Creates a Duvv (Question)**

#### **LocalStorage Mode:**
```
1. User fills form in app.html
   ↓
2. Clicks "Create Duvv"
   ↓
3. app-script.js calls createDuvv()
   ↓
4. api-config.js checks: USE_API = false
   ↓
5. Data saved to localStorage.duvvs
   ↓
6. UI updated with new duvv
```

#### **Backend API Mode:**
```
1. User fills form in app.html
   ↓
2. Clicks "Create Duvv"
   ↓
3. app-script.js calls createDuvv()
   ↓
4. api-config.js checks: USE_API = true
   ↓
5. Sends POST request to /api/duvvs/create
   ↓
6. Backend validates JWT token
   ↓
7. Creates duvv in database/JSON file
   ↓
8. Returns duvv object to frontend
   ↓
9. UI updated with new duvv
```

### **Scenario 2: Someone Responds to a Duvv**

#### **Text Response:**
```
1. Visitor opens: duvv.me/respond.html?id=abc123
   ↓
2. respond-script.js loads duvv details
   ↓
3. Visitor types text response
   ↓
4. Clicks "Submit"
   ↓
5. POST /api/responses/text
   ↓
6. Backend saves response
   ↓
7. Response count incremented
   ↓
8. Duvv owner can see response in dashboard
```

#### **Audio Response:**
```
1. Visitor opens respond.html?id=abc123
   ↓
2. Clicks "Record Voice"
   ↓
3. Browser records audio via MediaRecorder API
   ↓
4. Audio converted to Blob
   ↓
5. Optional: Voice filter applied (pitch shift, etc.)
   ↓
6. Sent to POST /api/responses/audio
   ↓
7. Backend saves audio file:
   - File storage: backend/uploads/audio/
   - Production: DigitalOcean Spaces
   ↓
8. Response metadata saved with audio URL
   ↓
9. Duvv owner can play audio in dashboard
```

#### **Drawing Response:**
```
1. Visitor opens respond.html?id=abc123
   ↓
2. Clicks "Draw"
   ↓
3. HTML5 Canvas opens
   ↓
4. Visitor draws with mouse/touch
   ↓
5. Canvas converted to Base64 PNG
   ↓
6. Sent to POST /api/responses/drawing
   ↓
7. Backend converts Base64 to image file
   ↓
8. Image saved:
   - File storage: backend/uploads/images/
   - Production: DigitalOcean Spaces
   ↓
9. Response saved with image URL
   ↓
10. Duvv owner can view drawing in dashboard
```

---

## 📁 File Structure

```
duvv.me/
│
├── Frontend (Client-Side)
│   ├── index.html ────────────► Landing page
│   ├── app.html ──────────────► Dashboard
│   ├── respond.html ──────────► Response page
│   ├── script.js ─────────────► Auth logic
│   ├── app-script.js ─────────► Dashboard logic
│   ├── respond-script.js ─────► Response logic
│   ├── api-config.js ─────────► API/LocalStorage toggle
│   ├── styles.css ────────────► Main styles
│   ├── app-styles.css ────────► Dashboard styles
│   └── respond-styles.css ────► Response styles
│
├── Backend (Server-Side)
│   ├── api.js ────────────────► Production API (MongoDB)
│   ├── api-file-storage.js ───► Testing API (JSON files) ⭐ NEW
│   ├── .env ──────────────────► Environment variables
│   ├── package.json ──────────► Dependencies
│   │
│   ├── data/ ─────────────────► File-based storage
│   │   ├── users.json
│   │   ├── duvvs.json
│   │   ├── responses.json
│   │   └── transactions.json
│   │
│   └── uploads/ ──────────────► File uploads
│       ├── audio/
│       └── images/
│
├── Documentation
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── TESTING_GUIDE.md
│   ├── QUICKSTART.md
│   └── ECOSYSTEM_EXPLAINED.md ► This file
│
└── Utilities
    ├── start.ps1 ─────────────► Auto-start script
    ├── generate_cert.py ──────► HTTPS certificate
    └── server.py ─────────────► Python HTTPS server
```

---

## 🔗 How Everything Works Together

### **Complete User Journey Example**

#### **1. Registration & Authentication**
```
User visits: http://localhost:8000/index.html

┌─────────────────────────────────────────────────┐
│ FRONTEND (index.html + script.js)              │
├─────────────────────────────────────────────────┤
│ 1. User enters username: "john_doe"             │
│ 2. Clicks "Register"                            │
│ 3. script.js calls: register("john_doe")        │
│ 4. api-config.js checks: USE_API?               │
└─────────────────────────────────────────────────┘
                    ↓
        ┌─────────────────────┐
        │ USE_API = false?    │
        │ (LocalStorage Mode) │
        └─────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Store in localStorage:                          │
│ {                                               │
│   username: "john_doe",                         │
│   recoveryCode: "alpha-bravo-charlie-delta",    │
│   isPremium: false                              │
│ }                                               │
└─────────────────────────────────────────────────┘
                    OR
        ┌─────────────────────┐
        │ USE_API = true?     │
        │ (Backend API Mode)  │
        └─────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ BACKEND (api-file-storage.js)                  │
├─────────────────────────────────────────────────┤
│ POST /api/auth/register                         │
│ 1. Validate username format                     │
│ 2. Check if username exists                     │
│ 3. Generate unique recovery code                │
│ 4. Save to backend/data/users.json:             │
│    {                                            │
│      _id: "abc123...",                          │
│      username: "john_doe",                      │
│      recoveryCode: "alpha-bravo-charlie-delta", │
│      isPremium: false,                          │
│      stats: {totalDuvvs: 0, totalResponses: 0}  │
│    }                                            │
│ 5. Generate JWT token                           │
│ 6. Return token + user data                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND receives response                      │
│ - Saves JWT token in cookie                     │
│ - Redirects to app.html (dashboard)             │
└─────────────────────────────────────────────────┘
```

#### **2. Creating a Duvv (Question)**
```
User is now on: http://localhost:8000/app.html

┌─────────────────────────────────────────────────┐
│ FRONTEND (app.html + app-script.js)            │
├─────────────────────────────────────────────────┤
│ 1. User fills form:                             │
│    Question: "What's your favorite movie?"      │
│    Response types: [text, audio, drawing]       │
│    Theme: midnight-blue                         │
│ 2. Clicks "Create Duvv"                         │
│ 3. app-script.js calls: createDuvv(...)         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ BACKEND (api-file-storage.js)                  │
├─────────────────────────────────────────────────┤
│ POST /api/duvvs/create                          │
│ 1. Verify JWT token (user authenticated?)      │
│ 2. Generate unique duvvId: "a7f3c2"            │
│ 3. Save to backend/data/duvvs.json:             │
│    {                                            │
│      duvvId: "a7f3c2",                          │
│      userId: "abc123...",                       │
│      username: "john_doe",                      │
│      question: "What's your favorite movie?",   │
│      theme: {...},                              │
│      responseTypes: ["text","audio","drawing"], │
│      responses: [],                             │
│      responseCount: 0,                          │
│      views: 0                                   │
│    }                                            │
│ 4. Update user stats (totalDuvvs++)            │
│ 5. Return duvv object                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND updates UI                             │
│ - Shows new duvv in list                        │
│ - Displays shareable link:                      │
│   http://localhost:8000/respond.html?id=a7f3c2  │
└─────────────────────────────────────────────────┘
```

#### **3. Someone Responds (Anonymous User)**
```
Friend visits: http://localhost:8000/respond.html?id=a7f3c2

┌─────────────────────────────────────────────────┐
│ FRONTEND (respond.html + respond-script.js)    │
├─────────────────────────────────────────────────┤
│ 1. Parse URL parameter: duvvId = "a7f3c2"      │
│ 2. Load duvv details: GET /api/duvvs/a7f3c2    │
│ 3. Display question: "What's your favorite..."  │
│ 4. Show response options: Text | Audio | Draw   │
└─────────────────────────────────────────────────┘
                    ↓
        Friend chooses: 🎤 Audio Response
                    ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND (Audio Recording)                      │
├─────────────────────────────────────────────────┤
│ 1. Request microphone access                    │
│ 2. Start MediaRecorder                          │
│ 3. User records: "The Matrix is my favorite!"   │
│ 4. Stop recording → Audio Blob created          │
│ 5. Apply voice filter (optional): "robot"       │
│ 6. Convert to FormData                          │
│ 7. POST /api/responses/audio                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ BACKEND (api-file-storage.js)                  │
├─────────────────────────────────────────────────┤
│ POST /api/responses/audio                       │
│ 1. Verify duvv exists (id: a7f3c2)             │
│ 2. Check audio responses allowed                │
│ 3. Save audio file:                             │
│    → backend/uploads/audio/1733088000-xyz.mp3   │
│ 4. Create response record:                      │
│    {                                            │
│      _id: "resp123...",                         │
│      duvvId: "a7f3c2",                          │
│      type: "audio",                             │
│      content: {                                 │
│        audioUrl: "/uploads/audio/1733088000.mp3"│
│        voiceFilter: "robot"                     │
│      },                                         │
│      senderIPHash: "7a8f3c..."                  │
│    }                                            │
│ 5. Save to backend/data/responses.json          │
│ 6. Update duvv: responseCount++                 │
│ 7. Update user stats: totalResponses++          │
│ 8. Return success + audioUrl                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND shows success message                  │
│ "Your response has been submitted! 🎉"          │
└─────────────────────────────────────────────────┘
```

#### **4. Viewing Responses (Duvv Owner)**
```
John returns to dashboard: http://localhost:8000/app.html

┌─────────────────────────────────────────────────┐
│ FRONTEND (app.html + app-script.js)            │
├─────────────────────────────────────────────────┤
│ 1. Load user's duvvs: GET /api/duvvs            │
│ 2. Display duvv with badge: "1 response"        │
│ 3. User clicks "View Responses"                 │
│ 4. Fetch: GET /api/responses/a7f3c2             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ BACKEND returns responses                       │
│ [{                                              │
│   type: "audio",                                │
│   content: {                                    │
│     audioUrl: "/uploads/audio/1733088000.mp3",  │
│     voiceFilter: "robot"                        │
│   },                                            │
│   createdAt: "2025-12-01T10:30:00Z"             │
│ }]                                              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ FRONTEND displays response                      │
│ ┌─────────────────────────────────────────┐     │
│ │ 🎤 Audio Response                       │     │
│ │ [▶ Play] ━━━━━━━━━━ 0:15 / 0:45        │     │
│ │ Filter: Robot 🤖                        │     │
│ │ Received: 5 minutes ago                 │     │
│ └─────────────────────────────────────────┘     │
│                                                 │
│ User clicks Play → Audio streams from:          │
│ http://localhost:3000/uploads/audio/173308...   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Key Takeaways

### **Where Data is Stored:**

1. **LocalStorage Mode (USE_API = false)**
   - Location: Browser's localStorage
   - Accessible: Only in same browser
   - Persistence: Until cache cleared
   - Use case: Quick testing, demos

2. **File-Based API (USE_API = true + api-file-storage.js)**
   - Location: `backend/data/` folder on your PC ⭐ **YOUR QUESTION ANSWER**
   - Accessible: From any device connected to your PC
   - Persistence: Permanent files on disk
   - Use case: Local development, testing without MongoDB

3. **Production API (USE_API = true + api.js)**
   - Location: MongoDB on DigitalOcean Droplet + Spaces
   - Accessible: From anywhere via internet
   - Persistence: Professional cloud storage
   - Use case: Production deployment

### **Why This Architecture?**

✅ **Flexibility**: Start with localStorage, upgrade to backend when ready  
✅ **Testing**: File storage makes debugging easy (just open JSON files)  
✅ **Scalability**: MongoDB + Spaces handles millions of users  
✅ **Developer Experience**: No complex setup needed to start coding  
✅ **Production Ready**: Same codebase works for all environments  

---

## 🚀 Quick Start Commands

### **Test with LocalStorage (No Backend)**
```powershell
# Just open in browser
python server.py
# Visit: https://localhost:8000

# In api-config.js, set:
USE_API: false
```

### **Test with File Storage API**
```powershell
# Start backend
cd backend
node api-file-storage.js

# Start frontend (separate terminal)
python server.py

# In api-config.js, set:
USE_API: true
BASE_URL: 'http://localhost:3000/api'

# Data stored in:
backend/data/users.json
backend/data/duvvs.json
backend/uploads/audio/*
backend/uploads/images/*
```

### **Production with MongoDB**
```powershell
# Configure .env file
cd backend
# Set: MONGODB_URI, DO_SPACES credentials

# Start backend
node api.js

# Deploy frontend to web host
# Update api-config.js:
USE_API: true
BASE_URL: 'https://your-api-domain.com/api'
```

---

## 📊 Summary Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │ index.html │  │  app.html  │  │   respond.html       │   │
│  │ (Login)    │→ │(Dashboard) │→ │(Public Response Page)│   │
│  └────────────┘  └────────────┘  └──────────────────────┘   │
│         ↓               ↓                    ↓               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            api-config.js (Integration Layer)          │   │
│  │  Checks: USE_API = true or false?                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │    USE_API = false?             │
        │    (LocalStorage Mode)          │
        └─────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│               Browser's localStorage                         │
│  • user: {...}                                               │
│  • duvvs: [{...}, {...}]                                     │
│  • responses: [{...}, {...}]                                 │
└──────────────────────────────────────────────────────────────┘

                          OR

        ┌─────────────────────────────────┐
        │    USE_API = true?              │
        │    (Backend API Mode)           │
        └─────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                    YOUR PC / SERVER                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Node.js Backend (api-file-storage.js)                 │  │
│  │  Running on: http://localhost:3000                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  File-Based Storage (PC's Hard Drive)                  │  │
│  │                                                         │  │
│  │  📁 backend/data/                                       │  │
│  │     ├── users.json ← User accounts                     │  │
│  │     ├── duvvs.json ← Questions/duvvs                   │  │
│  │     ├── responses.json ← Response metadata             │  │
│  │     └── transactions.json ← Payments                   │  │
│  │                                                         │  │
│  │  📁 backend/uploads/                                    │  │
│  │     ├── audio/ ← Voice response files (.mp3, .wav)     │  │
│  │     └── images/ ← Drawing files (.png, .jpg)           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

                          OR (Production)

┌──────────────────────────────────────────────────────────────┐
│                   DIGITALOCEAN CLOUD                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MongoDB Database (Droplet)                            │  │
│  │  • users collection                                    │  │
│  │  • duvvs collection                                    │  │
│  │  • responses collection                                │  │
│  │  • transactions collection                             │  │
│  └────────────────────────────────────────────────────────┘  │
│                          +                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  DigitalOcean Spaces (S3 Storage)                      │  │
│  │  • Audio files                                         │  │
│  │  • Image files                                         │  │
│  │  • CDN for fast delivery                               │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## ❓ FAQ

**Q: Where is my data stored when I use the backend?**  
A: In the `backend/data/` folder as JSON files and `backend/uploads/` for media files.

**Q: Is the data persistent?**  
A: Yes! Unlike localStorage (which can be cleared), file-based storage is permanent until you manually delete the files.

**Q: Can others access my data?**  
A: Only if they have access to your PC or you deploy the backend to a server they can reach.

**Q: How do I switch between localStorage and backend?**  
A: Change `USE_API: true/false` in `api-config.js`. No other code changes needed!

**Q: What happens to localStorage data when I switch to backend?**  
A: Nothing. They're separate. You'd need to manually migrate data if desired.

**Q: Can I view the data files?**  
A: Absolutely! Open `backend/data/users.json` in any text editor to see all users.

**Q: When should I use MongoDB instead of file storage?**  
A: When deploying to production, expecting high traffic, or needing advanced queries.

---

**🎉 You now understand the complete DUVV.ME ecosystem!**

For testing and development, use `api-file-storage.js` - it stores everything on your PC in easy-to-inspect JSON files and folders. No MongoDB setup required!
