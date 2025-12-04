# 🌐 duvv.me Domain Setup Guide

Complete guide to deploying your application with custom domain `duvv.me` on Vercel (frontend) and Render (backend) with SSL certificates.

---

## 📋 Overview

- **Frontend Domain**: `https://duvv.me` (Vercel)
- **Backend Domain**: `https://api.duvv.me` (Render)
- **SSL Certificates**: Auto-provisioned by Vercel and Render
- **DNS Provider**: Your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)

---

## 🎯 Step-by-Step Setup

### **PART 1: DNS Configuration (Do This First!)**

#### Configure DNS Records at Your Domain Registrar

Log into your domain registrar (where you purchased `duvv.me`) and add these DNS records:

#### **For Frontend (Vercel)**

```
Type: A
Name: @ (or leave blank for root domain)
Value: 76.76.21.21
TTL: 3600 (or Auto)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### **For Backend (Render)**

```
Type: CNAME
Name: api
Value: <your-render-app>.onrender.com
TTL: 3600 (or Auto)
```

**Important**: Replace `<your-render-app>` with your actual Render service name (e.g., `duvv-me-api.onrender.com`)

#### **Example Complete DNS Setup**

```
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
CNAME  api    duvv-me-api.onrender.com
```

⏰ **DNS Propagation**: Wait 10-60 minutes for DNS changes to propagate globally.

---

### **PART 2: Vercel Frontend Deployment**

#### Step 1: Push Your Frontend to GitHub

```powershell
# In your project root (frontend)
cd C:\Users\sange\OneDrive\Desktop\duvv.me

# If not already a git repo
git init
git add .
git commit -m "Initial commit for duvv.me"

# Create a new GitHub repo at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/duvv.me.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository (`duvv.me`)
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: (leave empty, it's static HTML)
   - **Output Directory**: (leave empty)
5. Click **"Deploy"**

#### Step 3: Add Custom Domain to Vercel

1. In your Vercel project, go to **Settings > Domains**
2. Add domains:
   - `duvv.me`
   - `www.duvv.me`
3. Vercel will detect your DNS records and verify them
4. SSL certificate will be auto-provisioned (takes 1-5 minutes)

#### Step 4: Configure Environment Variables (if needed)

In Vercel **Settings > Environment Variables**, add:
```
NODE_ENV=production
```

---

### **PART 3: Render Backend Deployment**

#### Step 1: Push Your Backend to GitHub

```powershell
# In your backend directory
cd C:\Users\sange\OneDrive\Desktop\duvv.me\backend

# If not already a git repo
git init
git add .
git commit -m "Initial backend commit"

# Create a new GitHub repo at https://github.com/new
# Then push:
git remote add origin https://github.com/YOUR_USERNAME/duvv.me-backend.git
git branch -M main
git push -u origin main
```

#### Step 2: Create Web Service on Render

1. Go to **[render.com](https://render.com)** and sign in
2. Click **"New +"** > **"Web Service"**
3. Connect your GitHub repository (`duvv.me-backend`)
4. Configure:
   - **Name**: `duvv-me-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node api.js`
   - **Plan**: Free (or paid for better performance)

#### Step 3: Configure Environment Variables on Render

In your Render service **Environment** tab, add all these variables:

```bash
# Core Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Appwrite Configuration
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=692f536e0019d87ddf42
APPWRITE_API_KEY=your-appwrite-api-key-here
APPWRITE_DATABASE_ID=692f5989001852014ab2
APPWRITE_BUCKET_ID=692f5d0f001176538f79

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Security Note**: Generate a strong JWT_SECRET:
```powershell
# Run in PowerShell to generate a secure key
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### Step 4: Add Custom Domain to Render

1. In your Render service, go to **Settings > Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `api.duvv.me`
4. Render will show you the CNAME value (e.g., `duvv-me-api.onrender.com`)
5. Make sure your DNS CNAME record matches this value
6. Wait for verification (green checkmark appears when verified)
7. SSL certificate will be auto-provisioned by Render (takes 1-5 minutes)

---

## 🔒 SSL Certificate Verification

### Vercel SSL
- **Auto-provisioned**: Yes (via Let's Encrypt)
- **Verification**: Check `https://duvv.me` loads with 🔒 padlock
- **Renewal**: Automatic every 90 days
- **Force HTTPS**: Enabled by default

### Render SSL
- **Auto-provisioned**: Yes (via Let's Encrypt)
- **Verification**: Check `https://api.duvv.me` loads with 🔒 padlock
- **Renewal**: Automatic every 90 days
- **Force HTTPS**: Enabled by default

### Test SSL Certificates

```powershell
# Test frontend SSL
curl -I https://duvv.me

# Test backend SSL
curl -I https://api.duvv.me/api/health
```

Both should return `HTTP/2 200` with valid SSL.

---

## ✅ Post-Deployment Checklist

### 1. Test Frontend
- [ ] Visit `https://duvv.me` - Should load homepage
- [ ] Visit `https://www.duvv.me` - Should redirect to `https://duvv.me`
- [ ] Check SSL certificate (🔒 padlock in browser)
- [ ] Test navigation to About, Contact, etc.

### 2. Test Backend
- [ ] Visit `https://api.duvv.me/api/health` - Should return keeper status
- [ ] Check SSL certificate (🔒 padlock in browser)
- [ ] Test API endpoints with Postman/curl

### 3. Test Full Integration
- [ ] Register a new user on frontend
- [ ] Login and create a Duvv
- [ ] Upload an audio response
- [ ] Check browser console for any errors
- [ ] Verify no CORS errors

### 4. Security Checks
- [ ] CORS only allows `https://duvv.me` and `https://www.duvv.me`
- [ ] API rate limiting is active
- [ ] JWT authentication works
- [ ] All HTTP traffic redirects to HTTPS

---

## 🐛 Troubleshooting

### DNS Not Resolving

**Problem**: `duvv.me` doesn't load

**Solutions**:
1. Wait 10-60 minutes for DNS propagation
2. Check DNS records with: `nslookup duvv.me`
3. Verify A record points to `76.76.21.21`
4. Clear browser cache (Ctrl+Shift+Delete)

### SSL Certificate Not Working

**Problem**: "Not Secure" warning in browser

**Solutions**:
1. Wait 5-10 minutes after adding domain
2. Check Vercel/Render dashboard for SSL status
3. Ensure DNS records are correct
4. Force SSL renewal in platform settings

### CORS Errors

**Problem**: `Origin not allowed` errors in browser console

**Solutions**:
1. Verify `allowedOrigins` in `backend/api.js` includes:
   ```javascript
   'https://duvv.me',
   'https://www.duvv.me'
   ```
2. Restart Render service after updating CORS
3. Clear browser cache

### Backend Not Responding

**Problem**: `Failed to fetch` or `500 Internal Server Error`

**Solutions**:
1. Check Render logs: **Logs** tab in Render dashboard
2. Verify all environment variables are set correctly
3. Test with: `curl https://api.duvv.me/api/health`
4. Check if Render service is running

### Vercel Deployment Failed

**Problem**: Build fails on Vercel

**Solutions**:
1. Check Vercel deployment logs
2. Ensure `vercel.json` is valid JSON
3. Remove `node_modules` and `.next` from git
4. Check for any npm errors in build logs

---

## 📊 Performance Optimization

### Vercel Settings
1. **Edge Network**: Enable (automatic)
2. **Compression**: Enable Gzip/Brotli (automatic)
3. **Caching**: Configure in `vercel.json`:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "Cache-Control",
             "value": "public, max-age=3600, s-maxage=86400"
           }
         ]
       }
     ]
   }
   ```

### Render Settings
1. **Auto-Deploy**: Enable for `main` branch
2. **Health Check Path**: `/api/health`
3. **Instance Type**: Upgrade from Free for better performance

---

## 🔄 Continuous Deployment

### Vercel Auto-Deploy
Every push to `main` branch automatically deploys to `https://duvv.me`

### Render Auto-Deploy
Every push to `main` branch automatically deploys to `https://api.duvv.me`

### Manual Deploy
```powershell
# Deploy frontend
git push origin main

# Deploy backend
cd backend
git push origin main
```

---

## 📞 Support Resources

### Vercel
- **Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions

### Render
- **Docs**: https://render.com/docs
- **Support**: https://render.com/support
- **Community**: https://community.render.com

### DNS
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.ssllabs.com/ssltest

---

## 🎉 You're All Set!

Your application is now live at:
- **Frontend**: https://duvv.me
- **Backend API**: https://api.duvv.me

Both with automatic SSL certificates and secure HTTPS! 🔒✨
