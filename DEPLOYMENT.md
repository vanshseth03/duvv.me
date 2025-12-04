# 🚀 Duvv.me Deployment Guide

## Overview

Duvv.me consists of:
- **Backend API**: Node.js/Express server (dynamic)
- **Frontend**: HTML/CSS/JS with server-side routing (semi-dynamic)
- **Database**: Appwrite Cloud (already hosted)
- **Storage**: Appwrite Storage (already hosted)

**Important**: The frontend requires server-side routing for clean URLs like `/username` and `/username/duvvId`

## ✅ Recommended Platforms

### Backend API - Best Options:

1. **Render.com** ⭐ RECOMMENDED
   - Free tier available
   - Auto-deploys from GitHub
   - Built-in SSL
   - Easy environment variables
   - Good for Node.js

2. **Railway.app**
   - $5/month minimum
   - Similar to Render
   - Very developer-friendly

3. **Fly.io**
   - Free tier available
   - Fast global deployment
   - More technical setup

### Frontend - Best Options:

1. **Vercel** ⭐ RECOMMENDED
   - Free for personal projects
   - Automatic HTTPS
   - Global CDN
   - Handles rewrites/routing easily via vercel.json
   - Easy custom domains

2. **Netlify**
   - Similar to Vercel
   - Free tier
   - Handles redirects via _redirects file

3. **Render Static Site**
   - Free tier
   - Can use custom routing rules
   
**Note**: GitHub Pages won't work well due to routing requirements

---

## 📋 Pre-Deployment Checklist

- [x] Remove hardcoded IPs/localhost
- [x] Add environment variable support
- [x] Remove SSL certificate requirement
- [x] Remove test mode bypasses
- [x] Add .env.example
- [ ] Test locally without SSL
- [ ] Configure Appwrite CORS for production domains
- [ ] Get Razorpay production keys
- [ ] Prepare custom domains (optional)

---

## 🔧 Backend Deployment (Render.com)

### Step 1: Prepare Repository
```bash
# Navigate to backend folder
cd backend

# Ensure package.json has start script
# Already done - "start": "node api.js"
```

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### Step 3: Configure Service
- **Name**: `duvv-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` (or paid)

### Step 4: Environment Variables
Add these in Render dashboard:

```
NODE_ENV=production
PORT=3000
USE_SSL=false

JWT_SECRET=<generate-random-string>

API_BASE_URL=https://duvv-api.onrender.com
FRONTEND_URL=https://your-vercel-app.vercel.app

APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=692f536e0019d87ddf42
APPWRITE_API_KEY=<your-key-from-appwrite>
APPWRITE_DATABASE_ID=692f5989001852014ab2
APPWRITE_BUCKET_ID=692f5d0f001176538f79

RAZORPAY_KEY_ID=<your-razorpay-key>
RAZORPAY_KEY_SECRET=<your-razorpay-secret>
```

### Step 5: Deploy
- Click "Create Web Service"
- Render will automatically deploy
- Get your API URL: `https://duvv-api.onrender.com`

**Note**: Free tier spins down after inactivity (30s startup delay)

---
## 🎨 Frontend Deployment (Vercel)

### Why Vercel Works Best
Your frontend uses server-side routing (like the Python server does) to handle:
- Clean URLs: `/username` → `app.html`
- Nested URLs: `/username/duvvId` → `respond.html`
- Static pages: `/about` → `about.html`

Vercel handles this perfectly with `vercel.json` (already created ✅)

### Step 1: Prepare Files
Your frontend files are already ready:
- `index.html`, `app.html`, `respond.html`, etc.
- `styles.css`, `app-styles.css`
- `script.js`, `app-script.js`, `api-config.js`
- `vercel.json` ✅ (already created with routing rules)

### Step 2: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New" → "Project"

### Step 3: Import Repository
- Select your GitHub repo
- **Root Directory**: `./` (main folder, not backend)
- **Framework Preset**: Other
- **Build Command**: Leave empty (no build needed)
- **Output Directory**: `./`

### Step 4: Verify Routing Configuration
The `vercel.json` file is already configured with your routing rules:
```json
{
  "rewrites": [
    { "source": "/about", "destination": "/about.html" },
    { "source": "/safety", "destination": "/safety.html" },
    { "source": "/contact", "destination": "/contact.html" },
    { "source": "/privacy", "destination": "/privacy.html" },
    { "source": "/terms", "destination": "/terms.html" },
    { "source": "/:username/:duvvId", "destination": "/respond.html" },
    { "source": "/:username", "destination": "/app.html" }
  ]
}
```

This replicates your Python server's routing logic!

### Step 5: Deploy
- Click "Deploy"
- Vercel will deploy with routing enabled
- Get your URL: `https://duvv.vercel.app`

### Step 6: Test Routing
```
✅ https://duvv.vercel.app/ → index.html
✅ https://duvv.vercel.app/about → about.html
✅ https://duvv.vercel.app/john → app.html (user profile)
✅ https://duvv.vercel.app/john/abc123 → respond.html (duvv response page)
```
- Get your URL: `https://duvv.vercel.app`

---

## 🔗 Connect Frontend to Backend

### Update Frontend URL in Backend
1. Go to Render dashboard
2. Update environment variable:
   ```
   FRONTEND_URL=https://duvv.vercel.app
   ```
3. Save and redeploy

### API Config Auto-Detects
The `api-config.js` now automatically detects:
- **Local**: Uses `http://localhost:3000/api`
- **Production**: Uses same origin `/api` or detects hostname

If backend is on different domain, update api-config.js:
```javascript
API_BASE_URL: 'https://duvv-api.onrender.com/api'
```

---

## 🔐 Appwrite CORS Configuration

### Add Production Domains
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Select your project
3. Go to Settings → Platforms
4. Add Web Platform:
   - **Name**: Production
   - **Hostname**: `duvv.vercel.app` (or your domain)
5. Add another for API:
   - **Name**: API
   - **Hostname**: `duvv-api.onrender.com`

---

## 💳 Razorpay Production Setup

### Get Production Keys
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to "Live Mode" (not Test Mode)
3. Go to Settings → API Keys
4. Generate new keys
5. Update in Render environment variables

---

## 🌐 Custom Domains (Optional)

### For Backend (Render)
1. Buy domain (e.g., `api.duvv.me`)
2. In Render: Settings → Custom Domain
3. Add CNAME record in DNS:
   ```
   api.duvv.me → duvv-api.onrender.com
   ```

### For Frontend (Vercel)
1. Buy domain (e.g., `duvv.me`)
2. In Vercel: Settings → Domains
3. Add domain and follow DNS instructions

---

## 🧪 Testing Deployment

### Test API
```bash
# Health check
curl https://duvv-api.onrender.com/api/health

# Should return: {"status":"OK","service":"duvv.me API",...}
```

### Test Frontend
1. Visit `https://duvv.vercel.app`
2. Register a new account
3. Create a duvv
4. Share link and test responses
5. Test payment flow (with test keys first)

---

## 🐛 Troubleshooting

### API Not Connecting
- Check Render logs for errors
- Verify all environment variables are set
- Check Appwrite credentials

### CORS Errors
- Verify domains in Appwrite platforms
- Check API_BASE_URL matches deployed URL

### Payment Not Working
- Ensure Razorpay keys are production keys
- Check webhook URLs if needed

### Slow First Request (Render Free Tier)
- Free tier spins down after inactivity
- First request takes 30-50 seconds
- Upgrade to paid tier for always-on
## 📊 Is It Dynamic?

### Backend API: ✅ FULLY DYNAMIC
- Node.js Express server
- Processes requests in real-time
- Connects to database
- Handles file uploads
- Perfect for Render, Railway, Fly.io

### Frontend: 🔄 SEMI-DYNAMIC (Requires Routing)
- HTML/CSS/JavaScript files
- **Requires server-side routing** for clean URLs
- Uses rewrites/redirects (not pure static)
- No database processing
- Perfect for Vercel, Netlify, Render Static

**Why it needs routing**:
- `/username` → serves `app.html`
- `/username/duvvId` → serves `respond.html`
- Without routing: users would need `/app.html?user=username` (ugly!)

**They work together**: Routed frontend → Dynamic API → Database

---

## 📊 Is It Dynamic?

### Backend API: ✅ DYNAMIC
- Node.js Express server
- Processes requests in real-time
- Connects to database
- Handles file uploads
- Perfect for Render, Railway, Fly.io

### Frontend: ❌ STATIC
- Pure HTML/CSS/JavaScript
- No server-side rendering
- Files served as-is
## 🎉 Alternative Deployment Options

### Option A: Render for Both (Separate Services)
1. **API**: Web Service (Node.js) - as shown above
2. **Frontend**: Static Site with redirects
   - Name: `duvv-frontend`
   - Build: None
   - Publish: `./` (root folder)
   - Add `_redirects` file (see below)

### Option B: Single Node.js Server (Everything Together)
Deploy both frontend and API in one Node.js app on Render:
- Serve static files from Express
- API routes at `/api/*`
- Frontend routes handled by Express
- **Benefit**: Single deployment, simpler
- **Drawback**: Not as fast as CDN

### Option C: Railway
Railway can host both backend and frontend in one project with automatic HTTPS.

### Creating _redirects for Netlify/Render Static
If using Netlify or Render Static Site, create this file:

**`_redirects`**:
```
/about           /about.html          200
/safety          /safety.html         200
/contact         /contact.html        200
/privacy         /privacy.html        200
/terms           /terms.html          200
/:username/:id   /respond.html        200
/:username       /app.html            200
/*               /index.html          200
```
   - Name: `duvv-frontend`
   - Build: None
   - Publish: `./` (root folder)

### Or Use Railway
Railway can host both backend and frontend in one project with automatic HTTPS and domains.

---

## 📝 Post-Deployment

1. ✅ Update README with live URLs
2. ✅ Test all features thoroughly
3. ✅ Set up monitoring (UptimeRobot)
4. ✅ Configure Razorpay webhooks (if needed)
5. ✅ Share your live duvv.me with the world! 🎊
