# ⚡ Quick DNS Setup - duvv.me

## Copy-Paste DNS Records

Add these DNS records at your domain registrar:

### 📝 DNS Records Table

| Type  | Name | Value                     | TTL  |
|-------|------|---------------------------|------|
| A     | @    | 76.76.21.21               | 3600 |
| CNAME | www  | cname.vercel-dns.com      | 3600 |
| CNAME | api  | duvv-me-api.onrender.com  | 3600 |

---

## 🎯 Platform-Specific Instructions

### GoDaddy
1. Go to **DNS Management**
2. Click **Add** for each record
3. Select record type, enter name and value
4. Save all records

### Namecheap
1. Go to **Advanced DNS**
2. Click **Add New Record**
3. Select type, enter host and value
4. Save changes

### Cloudflare
1. Go to **DNS** tab
2. Click **Add record**
3. Enter type, name, and value
4. Set proxy status to **DNS only** (grey cloud)
5. Save

### Google Domains
1. Go to **DNS** section
2. Scroll to **Custom resource records**
3. Add each record with type, name, and value
4. Save

---

## ⏱️ Wait Time

- DNS propagation: **10-60 minutes**
- SSL provisioning: **1-5 minutes** after DNS verification

---

## ✅ Verify Setup

```powershell
# Check DNS propagation
nslookup duvv.me
nslookup api.duvv.me

# Test SSL
curl -I https://duvv.me
curl -I https://api.duvv.me/api/health
```

---

## 🚀 After DNS is Set

1. Add `duvv.me` to Vercel project (Settings > Domains)
2. Add `api.duvv.me` to Render service (Settings > Custom Domains)
3. Wait for SSL verification (green checkmark)
4. Done! ✨
