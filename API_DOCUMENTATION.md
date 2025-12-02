# 🕊️ DUVV.ME API DOCUMENTATION

Complete API documentation for the duvv.me anonymous Q&A platform.

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Premium Features](#premium-features)
3. [Duvv Management](#duvv-management)
4. [Response Management](#response-management)
5. [Statistics & Analytics](#statistics--analytics)
6. [Theme System](#theme-system)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

All authenticated endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

### Register New User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "isPremium": false,
    "stats": {
      "totalDuvvs": 0,
      "totalResponses": 0
    }
  },
  "recoveryCode": "ABCD-EFGH",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important:** Save the `recoveryCode` - it's the only way to recover the account!

---

### Recover Account
```http
POST /api/auth/recover
```

**Request Body:**
```json
{
  "recoveryCode": "ABCD-EFGH",
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "isPremium": false,
    "premiumExpiry": null,
    "stats": {
      "totalDuvvs": 5,
      "totalResponses": 23
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "isPremium": true,
    "premiumExpiry": null,
    "stats": {
      "totalDuvvs": 12,
      "totalResponses": 56
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastActive": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Recovery Code
```http
GET /api/auth/recovery-code
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "recoveryCode": "ABCD-EFGH"
}
```

---

## 💎 Premium Features

### Create Razorpay Order
```http
POST /api/premium/create-order
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 29900,
  "duration": "lifetime"
}
```
*Note: Amount is in paise (29900 = ₹299)*

**Response:**
```json
{
  "success": true,
  "orderId": "order_1234567890_abc123",
  "amount": 29900,
  "currency": "INR",
  "keyId": "rzp_test_xxxxxxxxxxxxxx"
}
```

---

### Verify Payment
```http
POST /api/premium/verify-payment
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order_1234567890_abc123",
  "paymentId": "pay_xyz789",
  "signature": "abcdef123456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Premium activated successfully! 🎉",
  "premiumActive": true,
  "premiumExpiry": null
}
```

---

### Check Premium Status
```http
GET /api/premium/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "isPremium": true,
  "premiumExpiry": null,
  "premiumPurchaseDate": "2024-01-01T00:00:00.000Z"
}
```

---

## 📝 Duvv Management

### Create New Duvv
```http
POST /api/duvvs/create
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "question": "What's your honest opinion about me?",
  "theme": {
    "name": "cyber-pink",
    "text": "#ffffff",
    "bg": "#ff006e",
    "outline": "#7209b7"
  },
  "responseTypes": ["text", "audio", "drawing"],
  "isPremium": false
}
```

**Response:**
```json
{
  "success": true,
  "duvv": {
    "id": "lq4p2x8k9m",
    "question": "What's your honest opinion about me?",
    "theme": {
      "name": "cyber-pink",
      "text": "#ffffff",
      "bg": "#ff006e",
      "outline": "#7209b7"
    },
    "responseTypes": ["text", "audio", "drawing"],
    "isPremium": false,
    "shareUrl": "http://localhost:8000/john_doe/lq4p2x8k9m",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get User's Duvvs
```http
GET /api/duvvs/:username
```

**Response:**
```json
{
  "success": true,
  "username": "john_doe",
  "duvvs": [
    {
      "id": "lq4p2x8k9m",
      "question": "What's your honest opinion about me?",
      "theme": {
        "name": "cyber-pink",
        "text": "#ffffff",
        "bg": "#ff006e",
        "outline": "#7209b7"
      },
      "responseTypes": ["text", "audio", "drawing"],
      "isPremium": false,
      "responseCount": 12,
      "views": 45,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Get Specific Duvv
```http
GET /api/duvvs/:username/:duvvId
```

**Response:**
```json
{
  "success": true,
  "duvv": {
    "id": "lq4p2x8k9m",
    "question": "What's your honest opinion about me?",
    "theme": {
      "name": "cyber-pink",
      "text": "#ffffff",
      "bg": "#ff006e",
      "outline": "#7209b7"
    },
    "responseTypes": ["text", "audio", "drawing"],
    "isPremium": false,
    "responseCount": 12,
    "views": 46,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Delete Duvv
```http
DELETE /api/duvvs/:duvvId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Duvv deleted successfully"
}
```

---

## 💬 Response Management

### Submit Text Response
```http
POST /api/responses/text
```

**Request Body:**
```json
{
  "duvvId": "lq4p2x8k9m",
  "text": "You're super creative and always bring positive vibes! 🌟"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Response submitted successfully!",
  "response": {
    "id": "507f1f77bcf86cd799439011",
    "type": "text",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Submit Audio Response
```http
POST /api/responses/audio
Content-Type: multipart/form-data
```

**Form Data:**
- `duvvId`: "lq4p2x8k9m"
- `voiceFilter`: "robot" (options: original, robot, alien, chipmunk, monster, underwater)
- `audio`: [audio file]

**Response:**
```json
{
  "success": true,
  "message": "Audio response submitted successfully!",
  "response": {
    "id": "507f1f77bcf86cd799439011",
    "type": "audio",
    "audioUrl": "https://duvv-media.nyc3.cdn.digitaloceanspaces.com/audio/lq4p2x8k9m/1234567890_abc123.webm",
    "voiceFilter": "robot",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Submit Drawing Response
```http
POST /api/responses/drawing
```

**Request Body:**
```json
{
  "duvvId": "lq4p2x8k9m",
  "drawingDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "drawingMode": "neon",
  "brushColor": "#ff006e",
  "backgroundColor": "#ffffff"
}
```

**Drawing Modes:** normal, neon, hearts, spray

**Response:**
```json
{
  "success": true,
  "message": "Drawing response submitted successfully!",
  "response": {
    "id": "507f1f77bcf86cd799439011",
    "type": "drawing",
    "drawingUrl": "https://duvv-media.nyc3.cdn.digitaloceanspaces.com/drawings/lq4p2x8k9m/1234567890_abc123.png",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Get Duvv Responses
```http
GET /api/responses/:duvvId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "duvvId": "lq4p2x8k9m",
  "responseCount": 3,
  "responses": [
    {
      "id": "507f1f77bcf86cd799439011",
      "type": "text",
      "text": "You're super creative!",
      "anonymous": true,
      "author": "Anonymous",
      "createdAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "type": "audio",
      "audioUrl": "https://...",
      "audioDuration": 30,
      "voiceFilter": "robot",
      "anonymous": true,
      "author": "Anonymous",
      "createdAt": "2024-01-15T11:05:00.000Z"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "type": "drawing",
      "drawingUrl": "https://...",
      "drawingMode": "hearts",
      "drawingBrushColor": "#ff006e",
      "drawingBackgroundColor": "#ffffff",
      "anonymous": true,
      "author": "Anonymous",
      "createdAt": "2024-01-15T11:10:00.000Z"
    }
  ]
}
```

---

### Delete Response
```http
DELETE /api/responses/:responseId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Response deleted successfully"
}
```

---

## 📊 Statistics & Analytics

### Get User Statistics
```http
GET /api/stats/:username
```

**Response:**
```json
{
  "success": true,
  "username": "john_doe",
  "stats": {
    "totalDuvvs": 12,
    "totalResponses": 56
  },
  "isPremium": true,
  "memberSince": "2024-01-01T00:00:00.000Z"
}
```

---

### Get Duvv Statistics
```http
GET /api/stats/duvv/:duvvId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "duvvId": "lq4p2x8k9m",
  "stats": {
    "totalResponses": 12,
    "views": 45,
    "responseBreakdown": {
      "text": 5,
      "audio": 4,
      "drawing": 3
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🎨 Theme System

### Get Available Themes
```http
GET /api/themes
```

**Response:**
```json
{
  "success": true,
  "themes": [
    {
      "name": "cyber-pink",
      "displayName": "Cyber Pink 💗",
      "text": "#ffffff",
      "bg": "#ff006e",
      "outline": "#7209b7"
    },
    {
      "name": "electric-blue",
      "displayName": "Electric Blue ⚡",
      "text": "#0a0a0f",
      "bg": "#00d9ff",
      "outline": "#b388ff"
    },
    {
      "name": "soft-peach",
      "displayName": "Soft Peach 🍑",
      "text": "#1a1a2e",
      "bg": "#ffb4a2",
      "outline": "#ff6b6b"
    },
    {
      "name": "neon-green",
      "displayName": "Neon Green 💚",
      "text": "#0a0a0f",
      "bg": "#38ef7d",
      "outline": "#4ecdc4"
    },
    {
      "name": "lavender-dream",
      "displayName": "Lavender Dream 💜",
      "text": "#1a1a2e",
      "bg": "#b388ff",
      "outline": "#7209b7"
    },
    {
      "name": "dark-mode",
      "displayName": "Dark Mode 🌑",
      "text": "#ff006e",
      "bg": "#0a0a0f",
      "outline": "#ff006e"
    }
  ]
}
```

---

## 🎙️ Voice Filters

Available voice filters for audio responses:
1. **original** - No filter applied
2. **robot** - Smooth robotic voice with vocoder
3. **alien** - High pitch (1.6x) with highpass resonance
4. **chipmunk** - Very high pitch (2.2x) with bright boost
5. **monster** - Deep growly voice (0.6x) with heavy bass
6. **underwater** - Muffled lowpass filter with slight slowdown

---

## 🎨 Drawing Modes

Available drawing modes for canvas responses:
1. **normal** - Standard smooth brush
2. **neon** - Intense glowing brush with continuous lines
3. **hearts** - Hollow gradient-outlined hearts with sparkles
4. **spray** - Spray paint effect

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes:
- **200** - Success
- **201** - Created
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing/invalid token)
- **403** - Forbidden (premium required, access denied)
- **404** - Not Found
- **409** - Conflict (username taken)
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

---

## 🛡️ Rate Limiting

### General API Endpoints
- **100 requests** per 15 minutes per IP

### Authentication Endpoints
- **10 requests** per 15 minutes per IP

### Upload Endpoints
- **30 requests** per 15 minutes per IP

When rate limit is exceeded:
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

---

## 🔧 Health Check

### Health Status
```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "service": "duvv.me API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "database": "Connected"
}
```

---

### API Information
```http
GET /api/info
```

**Response:**
```json
{
  "service": "duvv.me API",
  "description": "Anonymous Q&A Platform with Multi-format Responses",
  "version": "1.0.0",
  "features": [
    "User Authentication with Recovery Codes",
    "Premium Subscriptions via Razorpay",
    "Multi-format Responses (Text, Audio, Drawing)",
    "DigitalOcean Spaces Media Storage",
    "Voice Filters (6 types)",
    "Drawing Modes (4 types)",
    "Theme Customization (6 color packs)",
    "Real-time Statistics",
    "Rate Limiting & Security",
    "Anonymous Response System"
  ],
  "endpoints": {
    "auth": [...],
    "premium": [...],
    "duvvs": [...],
    "responses": [...],
    "stats": [...],
    "themes": [...]
  }
}
```

---

## 🚀 Quick Start Example

```javascript
// 1. Register new user
const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'johndoe' })
});
const { user, token, recoveryCode } = await registerResponse.json();

// Save token and recoveryCode!
localStorage.setItem('token', token);
localStorage.setItem('recoveryCode', recoveryCode);

// 2. Create a duvv
const createDuvvResponse = await fetch('http://localhost:3000/api/duvvs/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: "What's your honest opinion about me?",
    theme: {
      name: 'cyber-pink',
      text: '#ffffff',
      bg: '#ff006e',
      outline: '#7209b7'
    },
    responseTypes: ['text', 'audio', 'drawing']
  })
});
const { duvv } = await createDuvvResponse.json();

// 3. Submit text response (no auth needed - anonymous!)
const submitResponse = await fetch('http://localhost:3000/api/responses/text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    duvvId: duvv.id,
    text: "You're awesome! 🌟"
  })
});

// 4. Get responses (auth required - only duvv owner)
const responsesData = await fetch(`http://localhost:3000/api/responses/${duvv.id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { responses } = await responsesData.json();
```

---

## 📦 Dependencies

```json
{
  "express": "^5.1.0",
  "mongoose": "^9.0.0",
  "multer": "^2.0.2",
  "aws-sdk": "^2.1692.0",
  "bcryptjs": "^3.0.3",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "helmet": "^8.1.0",
  "morgan": "^1.10.1",
  "express-rate-limit": "^8.2.1",
  "dotenv": "^17.2.3",
  "axios": "^1.13.2"
}
```

---

## 🛠️ Development Tips

### Testing with curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Create Duvv
curl -X POST http://localhost:3000/api/duvvs/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"Test question?","responseTypes":["text"]}'

# Submit Response
curl -X POST http://localhost:3000/api/responses/text \
  -H "Content-Type: application/json" \
  -d '{"duvvId":"lq4p2x8k9m","text":"Test response"}'
```

---

## 📞 Support

For issues or questions:
- Check `/api/info` endpoint for current features
- Check `/api/health` to verify server status
- Review error messages - they're descriptive!

---

**Last Updated:** December 2024  
**API Version:** 1.0.0  
**Status:** Production Ready 🚀
