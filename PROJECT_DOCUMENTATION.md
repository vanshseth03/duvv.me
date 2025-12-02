# duvv.me - Anonymous Q&A Platform 💭

## Project Overview
duvv.me is a modern, Gen Z-focused anonymous question and answer platform inspired by NGL (Not Gonna Lie). It allows users to create custom questions (called "duvvs"), share them with friends, and receive anonymous responses in multiple formats (text, audio, drawing).

## Core Concept
- **Duvvs** = Questions (terminology used throughout the app)
- **Completely anonymous** = Responses are 100% anonymous and incognito
- **Cookie-based authentication** = No server-side auth, all data stored locally
- **Multi-format responses** = Text, voice messages (30s), and drawings
- **Theme customization** = 6 color packs with 3 colors each (text, background, outline)

---

## Tech Stack
- **Frontend**: Pure HTML, CSS, JavaScript (Vanilla JS)
- **Storage**: LocalStorage + Cookies
- **No Backend**: Fully client-side application
- **Styling**: Custom CSS with CSS variables for theming

---

## File Structure

### Authentication Pages
1. **index.html** - Landing/Authentication page
   - Create new account flow
   - Account recovery flow
   - Username creation (alphanumeric + underscore, 3-20 chars)
   - Recovery code generation (12-character format: XXXX-XXXX-XXXX)
   - Cookie storage for persistent login

2. **styles.css** - Authentication page styles
   - Dark/Bright mode theming
   - Animated gradient background (3 floating orbs)
   - Smooth transitions and animations
   - Mobile responsive design

3. **script.js** - Authentication logic
   - Cookie management (setCookie, getCookie, deleteCookie)
   - Recovery code generation
   - Username validation
   - Theme toggle functionality

### Main Application Pages
4. **app.html** - Main user dashboard
   - User profile card (avatar, username, stats)
   - Create new duvv button
   - Active duvvs list
   - Duvv detail modal
   - Response detail modal
   - Share functionality
   - Footer with links

5. **app-styles.css** - Main app styles
   - Profile card styling
   - Duvv cards with theme colors
   - Multi-step modal design
   - Response type badges
   - Custom scrollbar
   - Mobile responsive breakpoints

6. **app-script.js** - Main app functionality
   - Duvv creation (4-step process)
   - Duvv rendering with theme colors
   - Response viewing (text/audio/drawing)
   - Canvas generation for story sharing
   - LocalStorage management
   - Copy notification system

### Response Pages
7. **respond.html** - Page for responding to duvvs
   - View duvv question
   - Select response type
   - Submit text/audio/drawing response
   - Anonymous submission

---

## Key Features

### 1. Authentication System
- **Username Creation**: 3-20 characters, letters/numbers/underscore only
- **Recovery Code**: Auto-generated 12-character code (format: XXXX-XXXX-XXXX)
- **Cookie Storage**: 
  - `duvvUsername` - stores username
  - `duvvRecoveryCode` - stores recovery code
  - `theme` - stores dark/bright preference
- **Session Check**: Redirects to app.html if cookies exist
- **Logout**: Clears cookies and returns to index.html

### 2. Duvv Creation (4-Step Process)

#### Step 1: Choose Question
- **6 Preset Questions**:
  1. "What's something you've never told anyone? 🤫"
  2. "Spill the tea about me fr fr ☕"
  3. "Biggest ick about me? No cap 🚩"
  4. "Rate me 1-10 and explain why 💯"
  5. "What's your honest opinion about me? 👀"
  6. "Confess something you did but never said 😳"
- **Custom Question**: User can type their own (200 char max)
- **Validation**: Minimum 5 characters required

#### Step 2: Choose Theme (6 Color Packs)
Each pack has 3 colors: Text, Background, Outline

1. **Cyber Pink 💗**
   - Text: #ffffff (white)
   - Background: #ff006e (hot pink)
   - Outline: #7209b7 (deep purple)

2. **Electric Blue ⚡**
   - Text: #0a0a0f (dark)
   - Background: #00d9ff (cyan)
   - Outline: #b388ff (lavender)

3. **Soft Peach 🍑**
   - Text: #1a1a2e (dark)
   - Background: #ffb4a2 (peach)
   - Outline: #ff6b6b (coral)

4. **Neon Green 💚**
   - Text: #0a0a0f (dark)
   - Background: #38ef7d (lime green)
   - Outline: #4ecdc4 (teal)

5. **Lavender Dream 💜**
   - Text: #1a1a2e (dark)
   - Background: #b388ff (lavender)
   - Outline: #7209b7 (deep purple)

6. **Dark Mode 🌑**
   - Text: #ff006e (pink)
   - Background: #0a0a0f (black)
   - Outline: #ff006e (pink)

#### Step 3: Choose Response Types (Multiple Selection)
- ✍️ **Text Response** - Plain text answers
- 🎙️ **Voice Message** - 30 second audio recordings
- 🎨 **Draw Response** - Canvas drawing submissions
- User can select multiple types

#### Step 4: Success & Share
- Generates unique duvv ID
- Creates shareable link: `/respond.html?rant={id}&user={username}`
- Copy link functionality with bottom notification
- Saves to LocalStorage under key: `duvvs_{username}`

### 3. Duvv Data Structure
```javascript
{
  id: "unique_id_timestamp",
  question: "What's the tea?",
  theme: {
    name: "cyber-pink",
    text: "#ffffff",
    bg: "#ff006e",
    outline: "#7209b7"
  },
  responseTypes: ["text", "audio", "drawing"],
  createdAt: "2024-01-01T12:00:00.000Z",
  responses: [
    {
      type: "text",
      text: "Response content here",
      anonymous: true,
      author: "Anonymous",
      createdAt: "2024-01-01T13:00:00.000Z"
    }
  ]
}
```

### 4. Response Types

#### Text Response
- Simple text input
- Displayed in cards with badge
- Can be opened in detail view
- Shareable to story as canvas image

#### Audio Response
- 30 second limit
- **6 Voice Filters** (all make voice unidentifiable):
  1. 🎤 **Original** - No filter
  2. 🤖 **Robot** - Smooth robotic voice with vocoder + bandpass filter
  3. 👽 **Alien** - Moderately high pitch (1.6x) + highpass resonance
  4. ️ **Chipmunk** - Very high pitch (2.2x) + bright high-shelf boost
  5. 👹 **Monster** - Deep growly voice (0.6x) + heavy bass boost + distortion
  6.  **Underwater** - Muffled lowpass (600Hz) + highpass combo + slight slow down
- Filters applied during playback using Web Audio API
- Real-time filter switching
- Displayed with play button
- Animated waveform visualization
- Duration indicator
- Audio player in detail view

#### Drawing Response
- Canvas-based drawing (500x500px)
- **4 Drawing Modes**:
  1. ✏️ Normal - Standard smooth brush
  2. ✨ Neon - Intense glowing brush with continuous lines (no gaps)
  3. 💖 Hearts - Hollow gradient-outlined hearts with sparkles and smart spacing
  4. 💨 Spray - Spray paint effect
- **10 Unique Brush Colors**: 
  - Black (#000000)
  - White (#ffffff)
  - Hot Pink (#ff006e)
  - Deep Purple (#7209b7)
  - Cyan (#00d9ff)
  - Gold (#ffd700)
  - Orange (#ff6b35)
  - Mint (#06ffa5)
  - Magenta (#f72585)
  - Blue (#4361ee)
- **10 Attractive Background Colors**:
  - Pure White (#ffffff)
  - Black (#000000)
  - Soft Pink (#fff0f3)
  - Dark Navy (#1a1a2e)
  - Light Pink (#ffe5ec)
  - Sky Blue (#e0f4ff)
  - Cream (#fff9e6)
  - Mint Green (#e8f5e9)
  - Lavender (#f3e5f5)
  - Rose (#fce4ec)
- **Instant Background Change**: Canvas preserves drawing when changing background
- **Brush Size**: Adjustable from 2-50px
- **Eraser Tool**: Erases with current background color
- **Undo Feature**: Up to 20 steps
- **Touch Support**: Works on mobile devices
- Stored as image data URL
- Preview in card view
- Full size in detail view
- Shareable to story

### 5. Story Sharing Feature
When sharing a response to story:
- Generates 1080x1920px canvas (Instagram story size)
- Shows question at top
- Shows response content in middle
- Applies theme colors (bg, text, outline)
- Adds border with outline color
- Footer: "duvv.me - No cap, just vibes ✨"
- Downloads as PNG for sharing

### 6. Theme System

#### Dark Mode (Default)
```css
--dark-bg: #0a0a0f
--dark-card: rgba(25, 25, 35, 0.85)
--dark-text: #ffffff
--dark-text-secondary: #b4b4c8
--dark-border: rgba(255, 255, 255, 0.1)
```

#### Bright Mode
```css
--bright-bg: #fef7ff
--bright-card: rgba(255, 255, 255, 0.95)
--bright-text: #1a1a2e
--bright-text-secondary: #6b6b8c
--bright-border: rgba(0, 0, 0, 0.1)
```

#### Accent Colors
- Cyber Pink: #ff006e
- Lavender: #b388ff
- Cyber Blue: #00d9ff
- Soft Peach: #ffb4a2
- Deep Purple: #7209b7
- Lime Green: #38ef7d
- Sunset Orange: #ff6b6b
- Teal Blue: #4ecdc4

#### 5 Gradient Presets
1. `linear-gradient(135deg, #ff006e, #7209b7)` - Pink to Purple
2. `linear-gradient(135deg, #00d9ff, #b388ff)` - Blue to Lavender
3. `linear-gradient(135deg, #ffb4a2, #ff006e)` - Peach to Pink
4. `linear-gradient(135deg, #38ef7d, #4ecdc4)` - Green to Teal
5. `linear-gradient(135deg, #ff6b6b, #ff006e)` - Orange to Pink

### 7. UI/UX Features

#### Animations
- **Floating Orbs**: 3 gradient orbs float in background (20s loop)
- **Slide Up**: Cards and modals slide up with fade-in
- **Hover Effects**: Scale, translate, color changes
- **Theme Toggle**: Smooth 0.6s transition
- **Logo Bounce**: Cubic-bezier bounce on hover
- **Waveform**: Animated bars for audio responses

#### Notifications
- **Copy Notification**: "→ Link copied ←" appears at bottom
- **Success Messages**: Toast-style notifications
- **Position**: Fixed bottom center
- **Duration**: 2-2.5 seconds
- **Style**: Gradient background with shadow

#### Modal System
- **Backdrop**: Blur + dark overlay
- **Positioning**: Vertically and horizontally centered
- **Scroll**: Contained within modal (no background scroll)
- **Close**: X button, backdrop click, or ESC key
- **Mobile**: Full-width with top margin on small screens
- **Custom Scrollbar**: Thin, themed scrollbar inside modal

#### Responsive Design
Breakpoints:
- **768px**: Tablet adjustments
- **480px**: Mobile optimizations

Changes:
- Single column layouts
- Larger touch targets
- Full-width buttons
- Reduced padding
- Smaller font sizes
- Simplified animations

### 8. User Statistics
Displayed on profile card:
- **Total Duvvs**: Count of created duvvs
- **Total Responses**: Sum of all responses across duvvs

### 9. Footer Links
- About
- Safety
- Contact
- Instagram (external link)
- Privacy Policy
- Terms of Service
- Tagline: "🔒 Completely anonymous & highly incognito"

---

## LocalStorage Structure

### Key: `duvvs_{username}`
Stores array of all duvvs for a user
```javascript
[
  {
    id: "abc123",
    question: "Question here",
    theme: {...},
    responseTypes: [...],
    createdAt: "ISO date",
    responses: [...]
  }
]
```

### Key: `theme`
Stores current theme preference: "dark" or "bright"

---

## Cookie Structure

### `duvvUsername`
- **Value**: Username string
- **Expiry**: 365 days
- **Path**: /

### `duvvRecoveryCode`
- **Value**: 12-character recovery code
- **Expiry**: 365 days
- **Path**: /

### `theme`
- **Value**: "dark" or "bright"
- **Expiry**: 365 days
- **Path**: /

---

## Helper Functions

### Time Formatting
```javascript
getTimeAgo(date)
// Returns: "just now", "5m ago", "2h ago", "3d ago"
```

### Text Processing
```javascript
escapeHtml(text)
// Escapes HTML entities for XSS prevention

wrapText(ctx, text, maxWidth)
// Wraps text for canvas rendering
```

### ID Generation
```javascript
generateId()
// Returns: timestamp + random string
// Example: "lq4p2x8k9m"
```

### Recovery Code Generation
```javascript
generateRecoveryCode()
// Returns: "XXXX-XXXX-XXXX" format
// Uses: A-Z, 2-9 (no confusing chars like 0, O, 1, I)
```

---

## User Flow Diagrams

### New User Journey

---

## Development Commands
```bash
# HTTPS Setup (for microphone support)

# 1. Generate SSL certificate (one-time):
generate-cert.bat              # Windows
./generate-cert.sh             # Mac/Linux

# 2. Start HTTPS server:
start-https-server.bat         # Windows
python server.py               # Mac/Linux/Manual

# 3. Open in browser:
https://localhost:8000/index.html

# Alternative: Use localhost without HTTPS
python -m http.server 8000
# Open: http://localhost:8000/
# Microphone works on localhost even without HTTPS!

# For development server (optional):
npx serve .
# or
python -m http.server 8000
```

## Browser Requirements

### Microphone Access
Modern browsers require one of:
- ✅ **HTTPS** (https://domain.com)
- ✅ **Localhost** (http://localhost:8000)
- ❌ IP Address over HTTP (http://192.168.x.x) - BLOCKED

**Solution:** Use the HTTPS server or access via localhost!

### Supported Browsers
- Chrome/Edge 60+ ✅
- Firefox 55+ ✅
- Safari 11+ ✅
- Opera 47+ ✅

---

## Credits
- Inspired by NGL (Not Gonna Lie) app
- Built for Gen Z aesthetic and language
- Designed with privacy and anonymity in mind

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Active Development 🚧

## Setup Instructions

See **README-HTTPS.md** for detailed HTTPS setup instructions!
