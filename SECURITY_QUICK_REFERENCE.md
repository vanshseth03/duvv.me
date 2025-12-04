# 🔐 Security Quick Reference

## Essential Security Features at a Glance

---

## 🛡️ What's Protected?

### Frontend (`app-script.js`, `api-config.js`)
```
✅ XSS Prevention        - Input sanitization, CSP headers
✅ CSRF Protection       - Same-origin enforced
✅ Cookie Security       - Cleared on logout
✅ Token Management      - Secure storage, expiration
✅ Request Dedup         - Prevents accidental DDoS
```

### Backend API (`api.js`)
```
✅ CORS Whitelist        - Only approved origins
✅ Security Headers      - Helmet.js hardened
✅ Rate Limiting         - Per-endpoint limits
✅ Input Validation      - Strict rules
✅ JWT Authentication    - Signature verified
✅ Error Hiding          - No info leakage
```

### Database & Storage
```
✅ Encryption In Transit - TLS/SSL HTTPS
✅ Encryption At Rest    - Appwrite managed
✅ Access Control        - Per-user isolation
✅ Backup Encryption     - Appwrite handles
```

---

## 🔒 Quick Security Settings

### CORS Allowed Origins
```
✅ https://duvv-me.vercel.app
✅ http://localhost:3000
✅ http://localhost:8000
❌ Everything else → BLOCKED
```

### Rate Limits
```
✅ General API:      100 req / 15 min
✅ Auth:             10 req / 15 min
✅ Upload:           50 req / 1 hour
✅ Health Check:     UNLIMITED
```

### JWT Token
```
✅ Algorithm:        HS256
✅ Expiration:       7 days
✅ Secret:           Environment var
✅ Validation:       Signature + Claims
```

---

## ⚠️ What Could Go Wrong?

### If Someone Tries To...

| Attack | What Happens |
|--------|--------------|
| **CORS from evil.com** | Request rejected at browser ❌ |
| **Brute force password** | Rate limited after 10 attempts ❌ |
| **Upload malware** | MIME type rejected ❌ |
| **Inject HTML/Script** | Sanitized automatically ❌ |
| **Use expired token** | JWT rejected ❌ |
| **DDoS with requests** | Rate limited ❌ |
| **View error stack** | Generic message only ❌ |
| **Access other user's data** | Permission denied ❌ |

---

## 🚀 For Developers

### Before Deploying Changes

**Must Do**:
```bash
npm audit fix          # Fix vulnerabilities
npm audit              # Check for issues
```

**Must Check**:
```
[ ] No secrets in code
[ ] All inputs validated
[ ] No console.log in production
[ ] Error handling works
[ ] Rate limiting tested
[ ] CORS origins correct
```

### Environment Variables

**Critical** (Change these!):
```
JWT_SECRET=<random-32-chars>
RAZORPAY_KEY_SECRET=<your-secret>
APPWRITE_API_KEY=<your-api-key>
```

**Important**:
```
NODE_ENV=production
CORS_ORIGINS=https://duvv-me.vercel.app
```

---

## 🆘 If Breach Suspected

1. **Stop**: Don't panic, stay calm
2. **Notify**: Tell security team immediately
3. **Revoke**: Kill all active sessions
4. **Rotate**: Change JWT secret
5. **Investigate**: Review access logs
6. **Inform**: Notify affected users

---

## 📊 Security Levels Explained

### 🟢 Protected (Safe)
- CORS only from approved origins
- Input fully validated
- No sensitive data in logs
- Token properly signed

### 🟡 Caution (Verify)
- Large file uploads
- Many API requests
- Old authentication tokens
- Unusual user behavior

### 🔴 Alert (Immediate)
- CORS rejection
- Rate limit triggered
- Invalid token
- SQL injection attempt
- Brute force detected

---

## 🔧 Common Operations

### Test Rate Limit
```bash
# Should work (1 request)
curl https://api.duvv.me/api/health

# Should fail after 10 attempts
for i in {1..15}; do curl -X POST https://api.duvv.me/api/auth/login; done
```

### Check JWT Token
```bash
# Decode (without verification)
echo "TOKEN_HERE" | jq -R 'split(".") | .[1] | @base64d | fromjson'

# Verify signature (must match in code)
# Only HS256 accepted
```

### Verify SSL Certificate
```bash
# Check certificate
openssl s_client -connect api.duvv.me:443

# Check HSTS header
curl -i https://api.duvv.me/api/health | grep -i hsts
```

---

## 📋 Security Audit Checklist

### Weekly
- [ ] Check error logs for anomalies
- [ ] Review rate limit hit rates
- [ ] Verify SSL certificate validity

### Monthly
- [ ] `npm audit`
- [ ] Review authentication logs
- [ ] Check backup integrity
- [ ] Update dependencies

### Quarterly
- [ ] Security code review
- [ ] Penetration testing
- [ ] CORS configuration audit
- [ ] Rate limit tuning

### Annually
- [ ] Full security audit
- [ ] Third-party penetration test
- [ ] Compliance review
- [ ] Architecture security review

---

## 🎓 Key Concepts

### CORS (Cross-Origin Resource Sharing)
**What**: Browser security preventing unauthorized cross-origin requests  
**Why**: Stops malicious websites from accessing your API  
**How**: Server returns `Access-Control-*` headers  

### JWT (JSON Web Token)
**What**: Self-contained token with user info + signature  
**Why**: Stateless authentication, scalable  
**How**: `HS256` signature verified on each request  

### Rate Limiting
**What**: Restricting requests per IP/user  
**Why**: Prevents brute force, DDoS, abuse  
**How**: Track requests, reject if over limit  

### Content Security Policy (CSP)
**What**: Browser security restricting resource loading  
**Why**: Prevents XSS attacks  
**How**: Server specifies allowed sources via header  

### HSTS (HTTP Strict Transport Security)
**What**: Forces HTTPS for future connections  
**Why**: Prevents man-in-the-middle attacks  
**How**: Browser remembers for 1 year  

---

## 💾 Backup & Recovery

### Automatic Backups
```
✅ Appwrite handles encryption
✅ Database: Multiple replicas
✅ Storage: Redundant storage
✅ Frequency: Continuous
```

### In Case of Data Loss
```
1. Contact Appwrite support
2. Request point-in-time recovery
3. Restore to previous state
4. Verify data integrity
```

---

## 🔗 Useful Links

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MDN Security](https://developer.mozilla.org/en-US/docs/Web/Security/)
- [JWT.io](https://jwt.io/)
- [Helmet.js Docs](https://helmetjs.github.io/)

### Tools
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)

### Learning
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

---

## ❓ FAQ

**Q: Is my password stored?**  
A: No! We use recovery codes instead. Much better! 🔑

**Q: Can I access other user's data?**  
A: No. Appwrite permissions prevent that. ✅

**Q: What if I lose my recovery code?**  
A: Contact support (future feature). For now, keep it safe! 📝

**Q: Is my data encrypted?**  
A: Yes! In transit (HTTPS) and at rest (Appwrite). 🔒

**Q: How often are backups taken?**  
A: Appwrite does continuous replication. Very safe! 💾

**Q: What happens if the server is attacked?**  
A: Rate limiting + rate limit headers protect us. 🛡️

**Q: Is SSL/TLS mandatory?**  
A: Yes! HSTS forces it for 1 year. 🔐

**Q: Can I use my own domain?**  
A: Yes! Update CORS origins if you do. 🌐

---

## 📞 Security Contact

**Found a vulnerability?**
- Email: security@duvv-me.com
- Don't: Create public GitHub issue
- Do: Include reproduction steps
- Response: Within 48 hours

---

## ✨ TL;DR

**duvv.me is secure because:**

✅ CORS whitelist blocks bad origins  
✅ Rate limiting stops attacks  
✅ Input validation prevents injection  
✅ JWT tokens verified  
✅ HTTPS encrypts everything  
✅ Errors don't leak info  
✅ Appwrite handles database security  

**Rating: 🟢 A+ (Very Secure)**

---

**Last Updated**: December 4, 2025  
**Version**: 2.0 - Quick Reference
