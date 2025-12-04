# Security Implementation Guide for duvv.me

## Overview
This document outlines all security protocols implemented in the duvv.me application to ensure data protection, prevent unauthorized access, and maintain API integrity.

---

## 1. CORS (Cross-Origin Resource Sharing)

### Implementation
- **Whitelist Approach**: Only specific origins can access the API
- **Allowed Origins**:
  - `https://duvv-me.vercel.app` (Production Frontend)
  - `http://localhost:3000` (Local Development)
  - `http://localhost:8000` (Local Server)
  - `http://127.0.0.1:*` (Local Testing)

### Configuration
```javascript
const allowedOrigins = [
    'https://duvv-me.vercel.app',
    'https://www.duvv-me.vercel.app',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8000'
];
```

### Benefits
- ✅ Prevents unauthorized cross-origin requests
- ✅ Protects against CSRF attacks
- ✅ Blocks malicious third-party scripts

---

## 2. Security Headers (Helmet.js)

### Implemented Headers

| Header | Purpose |
|--------|---------|
| **Content-Security-Policy** | Restricts resource loading to prevent XSS |
| **X-Frame-Options: DENY** | Prevents clickjacking attacks |
| **X-Content-Type-Options: nosniff** | Prevents MIME-type sniffing |
| **Referrer-Policy** | Controls referrer information |
| **HSTS** | Enforces HTTPS (1 year max-age) |
| **Permissions-Policy** | Disables geolocation, microphone, camera access |

### Example CSP Directives
```javascript
default-src: ["'self'"]           // Only self origin
style-src: ["'self'", "'unsafe-inline'"]
script-src: ["'self'"]            // No inline scripts
img-src: ["'self'", "data:", "https:"]
connect-src: ["'self'", "https://sgp.cloud.appwrite.io"]
```

---

## 3. Rate Limiting

### Configured Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| **General API** | 100 requests | 15 minutes |
| **Authentication** | 10 attempts | 15 minutes |
| **File Uploads** | 50 uploads | 1 hour |
| **Create Duvv** | 30 creations | 1 hour |

### Key Features
- ✅ IP-based rate limiting
- ✅ Username/IP hybrid for auth endpoints
- ✅ Per-endpoint configuration
- ✅ Returns proper HTTP 429 status
- ✅ Includes Rate-Limit headers in response

---

## 4. Input Validation & Sanitization

### Username Validation
```
Regex: /^[a-zA-Z0-9_-]{3,30}$/
- 3-30 characters
- Alphanumeric, underscore, hyphen only
- No special characters or spaces
```

### Email Validation
```
Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Standard email format
- Prevents invalid domains
```

### File Upload Validation
- **Allowed MIME Types**:
  - `image/jpeg`, `image/png`, `image/webp`
  - `audio/webm`, `audio/mpeg`, `audio/wav`
- **Max File Size**: 10MB per upload
- **Whitelist Approach**: Only approved MIME types accepted

### Input Sanitization
```javascript
// HTML/Script tag removal
input.replace(/<[^>]*>/g, '').trim()

// Parameter pollution prevention
// Auto-converts array values to last element
```

---

## 5. JWT (JSON Web Token) Security

### Configuration
- **Algorithm**: HS256 (HMAC-SHA256)
- **Token Expiration**: 7 days (configurable)
- **Secret Key**: Environment variable (MUST be changed in production)

### Token Validation
```javascript
// Strict algorithm specification
jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })

// Token claim validation
- userId present and valid
- username present and valid
- Token structure validation
```

### Token Claims
```json
{
    "userId": "user_id",
    "username": "username",
    "iat": 1234567890,
    "exp": 1234654290
}
```

---

## 6. Authentication Security

### Password-like Recovery Codes
- **Format**: `XXXX-XXXX-XXXX` (12 characters)
- **Character Set**: Alphanumeric + Hyphens
- **Uniqueness**: Database-verified uniqueness
- **Never Exposed**: Only shown once during registration

### Secure Practices
- ✅ Recovery codes stored hashed in database
- ✅ Never transmitted in URLs
- ✅ Verified server-side only
- ✅ Rate-limited authentication attempts

---

## 7. Request Validation Middleware

### Checks Performed
```javascript
// 1. JSON structure validation
// 2. Body size limits (1MB max)
// 3. Suspicious pattern detection
// 4. Parameter pollution prevention
// 5. Content-type verification
```

---

## 8. Appwrite Security

### Configuration
- **Endpoint**: `https://sgp.cloud.appwrite.io/v1` (SSL/TLS)
- **API Key**: Stored in environment variables (never in code)
- **Database Access**: Restricted to read/write only (no schema modification)
- **Storage Access**: File-level permissions only

### Database Permissions
```javascript
// User data is isolated
// Only the owner can access their data
// Admin operations restricted
```

---

## 9. HTTPS/SSL Enforcement

### Production
- ✅ All connections use HTTPS
- ✅ HSTS enabled (1 year preload)
- ✅ Certificate pinning (on Render)

### Local Development
- Optional self-signed certificates
- HTTP fallback available
- SSL enforcement disabled for testing

---

## 10. Environment Variables

### Required Secrets (MUST be set in production)
```
JWT_SECRET=<change-this-to-random-string>
RAZORPAY_KEY_SECRET=<your-secret-key>
APPWRITE_API_KEY=<your-api-key>
```

### Security Best Practices
- ✅ Never commit `.env` to git
- ✅ Use `.env.example` with placeholder values
- ✅ Rotate secrets regularly
- ✅ Use strong, random values (min 32 characters)

---

## 11. Error Handling Security

### Sensitive Information Protection
- ❌ Stack traces not exposed in production
- ❌ Database errors not revealed to client
- ❌ File paths not displayed
- ✅ Generic error messages returned

### Error Response Format
```json
{
    "error": "User-friendly error message"
}
```

---

## 12. API Endpoint Security

### Public Endpoints (No Auth Required)
- `GET /api/health` (Health check)
- `POST /api/auth/register` (User registration)
- `POST /api/auth/login` (User login)

### Protected Endpoints (Auth Required)
- All `/api/duvvs/*` (except list public)
- All `/api/responses/*`
- All `/api/upload/*`
- All `/api/premium/*`
- `/api/auth/me`

---

## 13. Data Protection

### In Transit
- ✅ TLS/SSL encryption (HTTPS)
- ✅ Secure headers
- ✅ No sensitive data in URLs

### At Rest
- ✅ Appwrite database encryption
- ✅ Appwrite storage encryption
- ✅ No plaintext passwords or tokens

### In Logs
- ✅ Sensitive data masked
- ✅ Tokens truncated
- ✅ Passwords never logged

---

## 14. Frontend Security (app-script.js)

### Cookie Management
- ✅ Cleared on logout
- ✅ LocalStorage cleared
- ✅ SessionStorage cleared
- ✅ All data wiped

### XSS Prevention
- ✅ innerHTML avoided where possible
- ✅ Input sanitization
- ✅ CSP headers enforced

### CSRF Protection
- ✅ Same-origin policy enforced
- ✅ No cross-site form submissions

---

## 15. Compliance & Best Practices

### Implemented
- ✅ OWASP Top 10 protection
- ✅ CWE-200 (Information Exposure)
- ✅ CWE-352 (Cross-Site Request Forgery)
- ✅ CWE-79 (Cross-site Scripting)
- ✅ CWE-89 (SQL Injection) - via Appwrite
- ✅ CWE-287 (Authentication Bypass)

### Security Scanning Recommendations
```bash
# Regular security updates
npm audit fix

# Dependency checking
npm audit

# OWASP ZAP testing
owasp-zap scan <url>

# SSL Labs rating
https://www.ssllabs.com/ssltest/
```

---

## 16. Incident Response

### If Breach is Suspected
1. Immediately revoke all active sessions
2. Force password/recovery code changes
3. Review access logs
4. Rotate JWT secret
5. Notify affected users

### Monitoring Points
- Failed authentication attempts
- Unusual API usage patterns
- File upload anomalies
- Rate limit triggers
- CORS policy violations

---

## 17. Future Enhancements

### Recommended
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 integration
- [ ] IP whitelisting per user
- [ ] Audit logging database
- [ ] Real-time threat detection
- [ ] Automated backup encryption
- [ ] Bug bounty program
- [ ] Regular penetration testing

---

## 18. Security Checklist

### Before Production Deployment
- [ ] Change JWT_SECRET to strong random value
- [ ] Change all default API keys
- [ ] Enable HTTPS certificates
- [ ] Configure allowed CORS origins
- [ ] Set NODE_ENV=production
- [ ] Review rate limit settings
- [ ] Test HSTS headers
- [ ] Verify CSP directives
- [ ] Test error handling (no stack traces)
- [ ] Review environment variables

### Regular Maintenance
- [ ] Monthly npm audit
- [ ] Quarterly penetration testing
- [ ] Semi-annual security review
- [ ] Annual SOC 2 audit

---

## Contact & Support

For security issues:
1. **Do NOT** create public issues
2. Email: security@duvv-me.com (or equivalent)
3. Include: Description, reproduction steps, impact
4. Expected response: Within 48 hours

---

**Last Updated**: December 4, 2025
**Version**: 2.0 (Enhanced Security)
**Status**: Production Ready ✅
