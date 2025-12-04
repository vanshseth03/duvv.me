# 🚀 QUICK DEPLOYMENT REFERENCE

## Platform Recommendations

| Component | Platform | Type | Cost | Best For |
|-----------|----------|------|------|----------|
| **Backend API** | Render.com ⭐ | Dynamic | Free/$7 | Node.js APIs |
| **Frontend** | Vercel ⭐ | Semi-Dynamic | Free | Routing + Static |
| **Database** | Appwrite Cloud ✅ | Managed | Free | Already setup |
| **Storage** | Appwrite Storage ✅ | Managed | Free | Already setup |

## Both Dynamic?

- **Backend**: ✅ YES - Node.js server (needs dynamic hosting)
- **Frontend**: 🔄 SEMI-DYNAMIC - HTML/CSS/JS with routing (needs routing support)

**Why frontend needs routing**: 
Your Python server routes clean URLs like:
- `/username` → `app.html`
- `/username/duvvId` → `respond.html`

Vercel handles this with `vercel.json` (already created ✅)

## Render.com Setup (Backend)

1. Sign up at render.com with GitHub
2. New → Web Service
3. Connect your repo
4. Settings:
   - **Root**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
5. Add environment variables (see .env.example)
6. Deploy!

**Your API URL**: `https://your-app.onrender.com`

## Vercel Setup (Frontend)

1. Sign up at vercel.com with GitHub
2. Import your repo
3. Settings:
   - **Root**: `./` (main folder)
   - **Framework**: Other
   - **Build**: Leave empty
4. Deploy!

**Your Frontend URL**: `https://your-app.vercel.app`

## Environment Variables (Render Backend)

```env
API_BASE_URL=https://your-app.onrender.com
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=<generate-random-64-char-string>
APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=692f536e0019d87ddf42
APPWRITE_API_KEY=<from-appwrite-console>
APPWRITE_DATABASE_ID=692f5989001852014ab2
APPWRITE_BUCKET_ID=692f5d0f001176538f79
RAZORPAY_KEY_ID=<from-razorpay-dashboard>
RAZORPAY_KEY_SECRET=<from-razorpay-dashboard>
```

## Appwrite CORS Setup

1. Go to cloud.appwrite.io
2. Your Project → Settings → Platforms
3. Add Web Platform:
   - Hostname: `your-app.vercel.app`
4. Add another:
   - Hostname: `your-app.onrender.com`

## Cost Breakdown

### Free Setup (Recommended for Testing):
- Appwrite: Free
- Render API: Free (30s cold start)
- Vercel: Free
- **Total: $0/month**

### Production Setup:
- Appwrite: Free tier (sufficient)
- Render API: $7/month (always-on)
- Vercel: Free
- **Total: $7/month**

## Test Deployment

```bash
# Test API
curl https://your-app.onrender.com/api/health

# Expected response:
{
  "status": "OK",
  "service": "duvv.me API",
  "version": "2.0.0"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS error | Add domain to Appwrite platforms |
| 502 Bad Gateway | Check environment variables in Render |
| Payment fails | Use production Razorpay keys |
| Slow first load | Render free tier cold start (upgrade to $7/month) |
| API not found | Check `API_BASE_URL` in api-config.js |

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test duvv creation
- [ ] Test all response types (text, audio, drawing)
- [ ] Test premium payment flow
- [ ] Test sharing links
- [ ] Update Razorpay to production keys
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring (optional)

## Need Help?

Read the full guide: **DEPLOYMENT.md**
