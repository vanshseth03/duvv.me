# 🏗️ DUVV.ME - ARCHITECTURE OVERVIEW

Visual guide to understand how all components work together.

---

## 🎯 Two Operating Modes

### Mode 1: LocalStorage Only (Default)
```
┌─────────────┐
│   Browser   │
│             │
│  ┌───────┐  │
│  │ HTML  │  │
│  │  CSS  │  │
│  │  JS   │  │
│  └───┬───┘  │
│      │      │
│  ┌───▼────┐ │
│  │LocalSto│ │  ← All data here
│  │  rage  │ │
│  └────────┘ │
└─────────────┘

✅ Zero setup
✅ Works offline
❌ Data in browser only
```

### Mode 2: Full Stack (Production)
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │         │  API Server  │         │  Services   │
│             │         │  (Node.js)   │         │             │
│  ┌───────┐  │  HTTPS  │  ┌────────┐  │  Store  │ ┌─────────┐ │
│  │ HTML  │──┼────────►│  │Express │──┼────────►│ │ MongoDB │ │
│  │  CSS  │  │         │  │Routes  │  │         │ └─────────┘ │
│  │  JS   │◄─┼─────────┤  └────────┘  │         │             │
│  └───────┘  │  JSON   │               │  Upload │ ┌─────────┐ │
│             │         │  ┌────────┐   │────────►│ │   DO    │ │
│  Microphone │         │  │Mongoose│   │         │ │ Spaces  │ │
│  Canvas     │         │  └────────┘   │         │ └─────────┘ │
└─────────────┘         └──────────────┘         │             │
                                                  │ ┌─────────┐ │
                                                  │ │Razorpay │ │
                                                  │ └─────────┘ │
                                                  └─────────────┘

✅ Production ready
✅ Real storage
✅ Scalable
⚠️ Requires setup
```

---

## 📂 File Structure & Purpose

```
Rants ngl/
│
├── 🌐 FRONTEND FILES
│   ├── index.html              # Landing/Auth page
│   ├── app.html                # User dashboard
│   ├── respond.html            # Response submission page
│   ├── about.html              # About page
│   ├── contact.html            # Contact page
│   ├── privacy.html            # Privacy policy
│   ├── terms.html              # Terms of service
│   ├── safety.html             # Safety info
│   │
│   ├── styles.css              # Auth page styles
│   ├── app-styles.css          # Dashboard styles
│   ├── respond-styles.css      # Response page styles
│   │
│   ├── script.js               # Auth logic
│   ├── app-script.js           # Dashboard logic
│   ├── respond-script.js       # Response logic
│   │
│   └── api-config.js           # 🔧 API integration layer
│                                  (Toggle API/LocalStorage)
│
├── 🔧 BACKEND FILES
│   ├── api.js                  # Complete API server
│   ├── .env                    # Environment config (YOU CREATE)
│   ├── .env.example            # Config template
│   └── package.json            # Dependencies
│
├── 🚀 SERVER FILES
│   ├── server.py               # HTTPS frontend server
│   ├── start-server.py         # Alternative starter
│   ├── generate_cert.py        # SSL certificate generator
│   ├── cert.pem               # SSL certificate (auto-generated)
│   └── key.pem                # SSL key (auto-generated)
│
├── 📚 DOCUMENTATION
│   ├── QUICKSTART.md           # ← START HERE! Quick guide
│   ├── TESTING_GUIDE.md        # Complete testing instructions
│   ├── API_DOCUMENTATION.md    # API reference
│   ├── PROJECT_DOCUMENTATION.md # Feature details
│   └── README-HTTPS.md         # HTTPS setup
│
└── 🎯 CONVENIENCE
    └── start.ps1               # Auto-start script (Windows)
```

---

## 🔄 Data Flow

### Creating a Duvv (Question)
```
User clicks "Create Duvv"
         ↓
Choose question & theme
         ↓
Select response types
         ↓
    ┌────────────┐
    │ api-config │ ← Decides routing
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  USE_API?  │
    └─────┬──────┘
          │
    ┌─────┴──────┐
    │            │
    NO          YES
    │            │
    ▼            ▼
┌───────┐   ┌────────┐
│Local  │   │ POST   │
│Storage│   │ /api/  │
│.setItem   │ duvvs/ │
└───────┘   │ create │
            └────┬───┘
                 │
            ┌────▼────┐
            │ MongoDB │
            └─────────┘
```

### Submitting Response
```
User submits response
         ↓
    ┌────────────┐
    │ Response   │
    │ Type?      │
    └─────┬──────┘
          │
    ┌─────┴──────┬──────────┐
    │            │          │
   Text        Audio     Drawing
    │            │          │
    ▼            ▼          ▼
Plain text   Record    Canvas
             30s       500x500
             │          │
             ▼          ▼
         Convert    Convert
         to Blob   to Base64
             │          │
    ┌────────┴──────────┴────┐
    │                         │
    NO API              YES API
    │                         │
    ▼                         ▼
LocalStorage         Upload to
as Data URL        DigitalOcean
                      Spaces
                        │
                        ▼
                   Store URL
                   in MongoDB
```

### Viewing Responses
```
User opens duvv detail
         ┓
         ▼
    Fetch responses
         ↓
    ┌────────────┐
    │ api-config │
    └─────┬──────┘
          │
    ┌─────▼──────┐
    │  USE_API?  │
    └─────┬──────┘
          │
    ┌─────┴──────┐
    │            │
    NO          YES
    │            │
    ▼            ▼
┌───────┐   ┌────────┐
│Read   │   │ GET    │
│Local  │   │ /api/  │
│Storage│   │response│
└───┬───┘   └────┬───┘
    │            │
    └─────┬──────┘
          ▼
    Render responses
    (text/audio/drawing)
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────┐
│          New User Flow                   │
└──────────────────────────────────────────┘
    1. Enter username
    2. Generate recovery code (XXXX-XXXX)
    3. Display code (SAVE THIS!)
    4. Store in cookie + API/LocalStorage
    5. Redirect to dashboard

┌──────────────────────────────────────────┐
│       Recovery Flow                      │
└──────────────────────────────────────────┘
    1. Enter recovery code
    2. Enter username
    3. Verify match
    4. Restore session
    5. Redirect to dashboard

┌──────────────────────────────────────────┐
│       Session Check                      │
└──────────────────────────────────────────┘
    Every page load:
    1. Check cookies for username + code
    2. If present → Allow access
    3. If missing → Redirect to login
```

---

## 🎨 Theme System

```
6 Color Packs
     ↓
┌────────────────────────────────────┐
│ Each pack has 3 colors:            │
│  - Text color                      │
│  - Background color                │
│  - Outline color                   │
└────────────────────────────────────┘
     ↓
Applied to duvv cards
     ↓
┌────────────────────────────────────┐
│ CSS Variables:                     │
│  style.background = theme.bg       │
│  style.color = theme.text          │
│  style.borderColor = theme.outline │
└────────────────────────────────────┘
```

---

## 🎙️ Audio Processing

```
Record Audio (30s max)
     ↓
MediaRecorder API
     ↓
Get audio blob
     ↓
┌────────────────┐
│ Voice Filter   │
│ Selection:     │
│  - Original    │
│  - Robot       │
│  - Alien       │
│  - Chipmunk    │
│  - Monster     │
│  - Underwater  │
└────────┬───────┘
         ↓
┌────────────────┐
│  USE_API?      │
└────────┬───────┘
         │
    ┌────┴────┐
    NO       YES
    │         │
    ▼         ▼
Convert   Upload
to Data   to DO
URL       Spaces
    │         │
    ▼         ▼
  Store   Store URL
  locally in MongoDB
         with filter
         metadata
```

---

## 🎨 Drawing Processing

```
Canvas 500x500px
     ↓
┌────────────────┐
│ Drawing Mode:  │
│  - Normal      │
│  - Neon        │
│  - Hearts      │
│  - Spray       │
└────────┬───────┘
         ↓
User draws with brush
     ↓
Convert canvas to Data URL
     ↓
┌────────────────┐
│  USE_API?      │
└────────┬───────┘
         │
    ┌────┴────┐
    NO       YES
    │         │
    ▼         ▼
  Store   Convert to
  Data    buffer &
  URL     upload to
          DO Spaces
    │         │
    ▼         ▼
Stored as  Store CDN
base64     URL in
string     MongoDB
```

---

## 💎 Premium System

```
User clicks Premium
     ↓
┌────────────────┐
│  USE_API?      │
└────────┬───────┘
         │
    ┌────┴────┐
    NO       YES
    │         │
    ▼         ▼
Simulate   Create
payment    Razorpay
success    Order
    │         │
    ▼         ▼
  Set      Show
localStorage  Razorpay
flag      Checkout
    │         │
    ▼         ▼
Premium   Verify
unlocked  payment
          signature
             │
             ▼
          Update
          MongoDB
             │
             ▼
          Premium
          unlocked
```

---

## 🔒 Security Layers

```
┌─────────────────────────────────────┐
│        Frontend Security            │
├─────────────────────────────────────┤
│ - Cookie-based sessions             │
│ - Input validation (regex)          │
│ - XSS prevention (escapeHtml)       │
│ - HTTPS required for mic            │
│ - Anonymous IP (no tracking)        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        Backend Security             │
├─────────────────────────────────────┤
│ - JWT token authentication          │
│ - Rate limiting (100/15min)         │
│ - Helmet.js security headers        │
│ - CORS protection                   │
│ - IP hashing (privacy)              │
│ - Input validation                  │
│ - File size limits (10MB)           │
│ - MongoDB injection prevention      │
└─────────────────────────────────────┘
```

---

## 📊 Statistics Tracking

```
Every action updates counters:

Create Duvv
     ↓
User.stats.totalDuvvs++
     ↓
Duvv.responseCount = 0

Receive Response
     ↓
Duvv.responseCount++
     ↓
User.stats.totalResponses++

View Duvv
     ↓
Duvv.views++
```

---

## 🌐 URL Routing

```
server.py handles clean URLs:

/                  → index.html  (auth)
/username          → app.html    (dashboard)
/username/duvvid   → respond.html (submit response)
/about             → about.html
/privacy           → privacy.html
/terms             → terms.html
/contact           → contact.html
/safety            → safety.html

Static files (css, js) → served directly
```

---

## 🔄 Toggle Between Modes

### Switch to LocalStorage Mode:
```javascript
// In api-config.js:
USE_API: false

// Then:
python server.py
```

### Switch to API Mode:
```javascript
// In api-config.js:
USE_API: true

// Then:
node api.js        # Terminal 1
python server.py   # Terminal 2
```

---

## 🎯 Key Files Explained

| File | Purpose | Mode |
|------|---------|------|
| `api-config.js` | Routes API calls | Both |
| `api.js` | Backend server | API only |
| `server.py` | Frontend server | Both |
| `.env` | Configuration | API only |
| `package.json` | Dependencies | API only |

---

## 📈 Performance Optimization

```
┌──────────────────────────────────┐
│     LocalStorage Mode            │
├──────────────────────────────────┤
│ ✅ Instant (no network)          │
│ ✅ No server load                │
│ ❌ Limited storage (~10MB)       │
│ ❌ No cross-device sync          │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│        API Mode                  │
├──────────────────────────────────┤
│ ✅ Unlimited storage             │
│ ✅ Cross-device sync             │
│ ✅ CDN-accelerated media         │
│ ⚠️ Network latency               │
└──────────────────────────────────┘
```

---

## 🎬 Complete User Journey

```
1. User visits site
        ↓
2. Create account / Recover
        ↓
3. View dashboard
        ↓
4. Create duvv with theme
        ↓
5. Copy share link
        ↓
6. Share with friends
        ↓
7. Friend visits link
        ↓
8. Friend submits response
   (text/audio/drawing)
        ↓
9. Response stored
        ↓
10. User views responses
        ↓
11. Share to story
        ↓
12. Optional: Buy premium
        ↓
13. Unlock premium features
```

---

## 🔧 Debugging Flow

```
Issue Reported
     ↓
Check Browser Console (F12)
     ↓
┌────────────────┐
│ Error Type?    │
└────────┬───────┘
         │
    ┌────┴────┬────────┬───────┐
    │         │        │       │
 Network   Cookie   Storage  API
  Error     Error    Error   Error
    │         │        │       │
    ▼         ▼        ▼       ▼
Check     Check    Check   Check
HTTPS     Domain   Local   Backend
server    cookie   Storage  logs
running   set      quota   running
```

---

This architecture ensures flexibility, security, and scalability! 🚀
