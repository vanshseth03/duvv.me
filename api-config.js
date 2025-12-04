/**
 * ========================================================================
 * API CONFIGURATION & HELPER FUNCTIONS
 * ========================================================================
 * Handles API calls with fallback to localStorage for local testing
 * 
 * USAGE:
 * 1. For LOCAL TESTING (without backend):
 *    - Keep USE_API = false
 *    - Data stored in browser's localStorage
 *    - No server needed
 * 
 * 2. For PRODUCTION (with backend):
 *    - Set USE_API = true
 *    - Set API_BASE_URL to your server
 *    - Requires running Node.js server
 * ========================================================================
 */

// ========================================================================
// CONFIGURATION
// ========================================================================

const API_CONFIG = {
    // Toggle API usage: false = localStorage only, true = use backend
    USE_API: true,
    
    // API Base URL - auto-detects environment
    API_BASE_URL: (() => {
        // Check if we're in production (deployed)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Production: use Render backend
            return 'https://duvv-me-api.onrender.com/api';
        }
        // Local development
        return 'http://localhost:3000/api';
    })(),
    
    // Token storage key
    TOKEN_KEY: 'duvv_api_token'
};

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

/**
 * Get stored JWT token
 */
function getApiToken() {
    return localStorage.getItem(API_CONFIG.TOKEN_KEY) || getCookie('duvvToken');
}

/**
 * Store JWT token
 */
function setApiToken(token) {
    localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    setCookie('duvvToken', token, 365);
}

/**
 * Remove JWT token
 */
function removeApiToken() {
    localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    deleteCookie('duvvToken');
}

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    const token = getApiToken();
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {

        throw error;
    }
}

/**
 * Upload file to API
 */
async function apiUpload(endpoint, formData) {
    const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
    
    const token = getApiToken();
    const headers = {};
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        
        return data;
    } catch (error) {

        throw error;
    }
}

// ========================================================================
// API WRAPPER FUNCTIONS WITH LOCALSTORAGE FALLBACK
// ========================================================================

/**
 * AUTH: Register new user
 */
async function registerUser(username) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
        
        setApiToken(data.token);
        return {
            username: data.user.username,
            recoveryCode: data.recoveryCode,
            isPremium: data.user.isPremium
        };
    } else {
        // LocalStorage fallback (current implementation)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            if (i > 0 && i % 4 === 0) code += '-';
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return {
            username: username.toLowerCase(),
            recoveryCode: code,
            isPremium: false
        };
    }
}

/**
 * AUTH: Recover account
 */
async function recoverAccount(recoveryCode, username) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest('/auth/recover', {
            method: 'POST',
            body: JSON.stringify({ recoveryCode, username })
        });
        
        setApiToken(data.token);
        return {
            username: data.user.username,
            isPremium: data.user.isPremium,
            stats: data.user.stats
        };
    } else {
        // LocalStorage fallback - basic validation
        return {
            username: username.toLowerCase(),
            isPremium: localStorage.getItem('duvvPremium') === 'true',
            stats: {
                totalDuvvs: 0,
                totalResponses: 0
            }
        };
    }
}

/**
 * AUTH: Get current user info
 */
async function getCurrentUser() {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest('/auth/me', {
            method: 'GET'
        });
        return data.user;
    } else {
        // LocalStorage fallback
        const username = getCookie('duvvUsername');
        return {
            username,
            isPremium: localStorage.getItem('duvvPremium') === 'true',
            stats: {
                totalDuvvs: 0,
                totalResponses: 0
            }
        };
    }
}

/**
 * PREMIUM: Create payment order
 */
async function createPremiumOrder(amount = 29900) {
    if (API_CONFIG.USE_API) {
        return await apiRequest('/premium/create-order', {
            method: 'POST',
            body: JSON.stringify({ amount, duration: 'lifetime' })
        });
    } else {
        // LocalStorage fallback - simulate order
        return {
            orderId: `order_${Date.now()}`,
            amount,
            currency: 'INR',
            keyId: 'rzp_test_demo'
        };
    }
}

/**
 * PREMIUM: Verify payment
 */
async function verifyPremiumPayment(orderId, paymentId, signature) {
    if (API_CONFIG.USE_API) {
        return await apiRequest('/premium/verify-payment', {
            method: 'POST',
            body: JSON.stringify({ orderId, paymentId, signature })
        });
    } else {
        // LocalStorage fallback
        localStorage.setItem('duvvPremium', 'true');
        return { success: true, premiumActive: true };
    }
}

/**
 * DUVV: Create new duvv
 */
async function createDuvv(question, theme, responseTypes, isPremium = false) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest('/duvvs/create', {
            method: 'POST',
            body: JSON.stringify({ question, theme, responseTypes, isPremium })
        });
        return data.duvv;
    } else {
        // LocalStorage fallback (current implementation)
        const username = getCookie('duvvUsername');
        const duvvId = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
        
        const duvv = {
            id: duvvId,
            question,
            theme,
            responseTypes,
            isPremium,
            createdAt: new Date().toISOString(),
            responses: []
        };
        
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        duvvs.push(duvv);
        localStorage.setItem(`duvvs_${username}`, JSON.stringify(duvvs));
        
        return duvv;
    }
}

/**
 * DUVV: Get user's duvvs
 */
async function getUserDuvvs(username) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest(`/duvvs/${username}`, {
            method: 'GET'
        });
        return data.duvvs;
    } else {
        // LocalStorage fallback
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        return duvvs;
    }
}

/**
 * DUVV: Get specific duvv
 */
async function getDuvv(username, duvvId) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest(`/duvvs/${username}/${duvvId}`, {
            method: 'GET'
        });
        return data.duvv;
    } else {
        // LocalStorage fallback
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        return duvvs.find(d => d.id === duvvId);
    }
}

/**
 * DUVV: Delete duvv
 */
async function deleteDuvv(duvvId) {
    if (API_CONFIG.USE_API) {
        return await apiRequest(`/duvvs/${duvvId}`, {
            method: 'DELETE'
        });
    } else {
        // LocalStorage fallback
        const username = getCookie('duvvUsername');
        let duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        duvvs = duvvs.filter(d => d.id !== duvvId);
        localStorage.setItem(`duvvs_${username}`, JSON.stringify(duvvs));
        return { success: true };
    }
}

/**
 * RESPONSE: Submit text response
 */
async function submitTextResponse(duvvId, text, posterUsername) {
    if (API_CONFIG.USE_API) {
        return await apiRequest('/responses/text', {
            method: 'POST',
            body: JSON.stringify({ duvvId, text })
        });
    } else {
        // LocalStorage fallback
        const response = {
            type: 'text',
            text,
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date().toISOString()
        };
        
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${posterUsername}`)) || [];
        const duvv = duvvs.find(d => d.id === duvvId);
        
        if (duvv) {
            duvv.responses = duvv.responses || [];
            duvv.responses.push(response);
            localStorage.setItem(`duvvs_${posterUsername}`, JSON.stringify(duvvs));
        }
        
        return { success: true, response };
    }
}

/**
 * RESPONSE: Submit audio response
 */
async function submitAudioResponse(duvvId, audioBlob, voiceFilter, posterUsername) {
    if (API_CONFIG.USE_API) {
        const formData = new FormData();
        formData.append('duvvId', duvvId);
        formData.append('voiceFilter', voiceFilter);
        formData.append('audio', audioBlob, 'audio.webm');
        
        return await apiUpload('/responses/audio', formData);
    } else {
        // LocalStorage fallback - convert to data URL
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const response = {
                    type: 'audio',
                    audioUrl: reader.result,
                    audioDuration: 30,
                    voiceFilter,
                    anonymous: true,
                    author: 'Anonymous',
                    createdAt: new Date().toISOString()
                };
                
                const duvvs = JSON.parse(localStorage.getItem(`duvvs_${posterUsername}`)) || [];
                const duvv = duvvs.find(d => d.id === duvvId);
                
                if (duvv) {
                    duvv.responses = duvv.responses || [];
                    duvv.responses.push(response);
                    localStorage.setItem(`duvvs_${posterUsername}`, JSON.stringify(duvvs));
                }
                
                resolve({ success: true, response });
            };
            reader.readAsDataURL(audioBlob);
        });
    }
}

/**
 * RESPONSE: Submit drawing response
 */
async function submitDrawingResponse(duvvId, drawingDataUrl, drawingMode, brushColor, backgroundColor, posterUsername) {
    if (API_CONFIG.USE_API) {
        return await apiRequest('/responses/drawing', {
            method: 'POST',
            body: JSON.stringify({
                duvvId,
                drawingDataUrl,
                drawingMode,
                brushColor,
                backgroundColor
            })
        });
    } else {
        // LocalStorage fallback
        const response = {
            type: 'drawing',
            drawingUrl: drawingDataUrl,
            drawingMode,
            drawingBrushColor: brushColor,
            drawingBackgroundColor: backgroundColor,
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date().toISOString()
        };
        
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${posterUsername}`)) || [];
        const duvv = duvvs.find(d => d.id === duvvId);
        
        if (duvv) {
            duvv.responses = duvv.responses || [];
            duvv.responses.push(response);
            localStorage.setItem(`duvvs_${posterUsername}`, JSON.stringify(duvvs));
        }
        
        return { success: true, response };
    }
}

/**
 * RESPONSE: Get responses for a duvv
 */
async function getDuvvResponses(duvvId) {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest(`/responses/${duvvId}`, {
            method: 'GET'
        });
        return data.responses;
    } else {
        // LocalStorage fallback
        const username = getCookie('duvvUsername');
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        const duvv = duvvs.find(d => d.id === duvvId);
        return duvv ? duvv.responses || [] : [];
    }
}

/**
 * RESPONSE: Delete response
 */
async function deleteResponse(responseId, duvvId) {
    if (API_CONFIG.USE_API) {
        return await apiRequest(`/responses/${responseId}`, {
            method: 'DELETE'
        });
    } else {
        // LocalStorage fallback
        const username = getCookie('duvvUsername');
        const duvvs = JSON.parse(localStorage.getItem(`duvvs_${username}`)) || [];
        const duvv = duvvs.find(d => d.id === duvvId);
        
        if (duvv && duvv.responses) {
            duvv.responses = duvv.responses.filter((r, index) => index !== responseId);
            localStorage.setItem(`duvvs_${username}`, JSON.stringify(duvvs));
        }
        
        return { success: true };
    }
}

/**
 * THEMES: Get available themes
 */
async function getThemes() {
    if (API_CONFIG.USE_API) {
        const data = await apiRequest('/themes', {
            method: 'GET'
        });
        return data.themes;
    } else {
        // LocalStorage fallback - hardcoded themes
        return [
            {
                name: 'cyber-pink',
                displayName: 'Cyber Pink 💗',
                text: '#ffffff',
                bg: '#ff006e',
                outline: '#7209b7'
            },
            {
                name: 'electric-blue',
                displayName: 'Electric Blue ⚡',
                text: '#0a0a0f',
                bg: '#00d9ff',
                outline: '#b388ff'
            },
            {
                name: 'soft-peach',
                displayName: 'Soft Peach 🍑',
                text: '#1a1a2e',
                bg: '#ffb4a2',
                outline: '#ff6b6b'
            },
            {
                name: 'neon-green',
                displayName: 'Neon Green 💚',
                text: '#0a0a0f',
                bg: '#38ef7d',
                outline: '#4ecdc4'
            },
            {
                name: 'lavender-dream',
                displayName: 'Lavender Dream 💜',
                text: '#1a1a2e',
                bg: '#b388ff',
                outline: '#7209b7'
            },
            {
                name: 'dark-mode',
                displayName: 'Dark Mode 🌑',
                text: '#ff006e',
                bg: '#0a0a0f',
                outline: '#ff006e'
            }
        ];
    }
}

// ========================================================================
// CONSOLE INFO
// ========================================================================



if (API_CONFIG.USE_API) {

} else {

}
