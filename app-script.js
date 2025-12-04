// Cookie Management
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
}

function clearAllCookies() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/';
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;domain=' + window.location.hostname;
    }
}

// Custom Dialog System
function showDialog(options) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customDialogOverlay');
        const icon = document.getElementById('dialogIcon');
        const title = document.getElementById('dialogTitle');
        const message = document.getElementById('dialogMessage');
        const buttons = document.getElementById('dialogButtons');
        const closeBtn = document.getElementById('dialogClose');

        icon.textContent = options.icon || '💬';
        title.textContent = options.title || '';
        message.textContent = options.message || '';
        buttons.innerHTML = '';
        
        // Close button handler - return null to indicate closed without action
        const closeHandler = () => {
            overlay.classList.remove('active');
            resolve(null);
        };
        
        // Remove old listeners and add new one
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', closeHandler);

        if (options.type === 'confirm') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'dialog-btn dialog-btn-secondary';
            cancelBtn.textContent = options.cancelText || 'Cancel';
            cancelBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(false);
            };

            const confirmBtn = document.createElement('button');
            confirmBtn.className = `dialog-btn ${options.danger ? 'dialog-btn-danger' : 'dialog-btn-primary'}`;
            confirmBtn.textContent = options.confirmText || 'Confirm';
            confirmBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(true);
            };

            buttons.appendChild(cancelBtn);
            buttons.appendChild(confirmBtn);
        } else {
            const okBtn = document.createElement('button');
            okBtn.className = 'dialog-btn dialog-btn-primary';
            okBtn.textContent = options.buttonText || 'OK';
            okBtn.onclick = () => {
                overlay.classList.remove('active');
                resolve(true);
            };
            buttons.appendChild(okBtn);
        }

        overlay.classList.add('active');
    });
}

function showAlert(message, title = 'Hey bestie! 👋', icon = '💬') {
    return showDialog({ message, title, icon, type: 'alert' });
}

function showConfirm(message, title = 'Are you sure? 🤔', confirmText = 'Confirm', cancelText = 'Cancel', icon = '✨', danger = false) {
    return showDialog({ message, title, icon, type: 'confirm', danger, confirmText, cancelText });
}

// Utility: Attach close listeners for any modal (MOVED TO TOP)
function attachModalCloseListeners(modal, closeButtonId, backdropId, closeFn) {
    const closeBtn = modal.querySelector(`#${closeButtonId}`);
    const backdrop = modal.querySelector(`#${backdropId}`);
    
    if (closeBtn) {
        closeBtn.replaceWith(closeBtn.cloneNode(true));
        const newCloseBtn = modal.querySelector(`#${closeButtonId}`);
        newCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeFn();
        });
    }
    
    if (backdrop) {
        backdrop.replaceWith(backdrop.cloneNode(true));
        const newBackdrop = modal.querySelector(`#${backdropId}`);
        newBackdrop.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeFn();
        });
    }
}

// Check Authentication - STRICT LOCK
const username = getCookie('duvvUsername');
const recoveryCode = getCookie('duvvRecoveryCode');

// If no secret code or username in cookies, KICK to home
if (!username || !recoveryCode) {
    window.location.href = '/index.html';
    throw new Error("Unauthorized"); // Stop execution
}

// If using API mode, check for token
if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
    const token = getCookie(API_CONFIG.TOKEN_KEY);
    if (!token) {
        clearAllCookies();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/index.html';
        throw new Error("No API token");
    }
}

// Display Username
document.getElementById('displayUsername').textContent = `@${username}`;

// Secret Code Logic
const profileCodeWrapper = document.getElementById('profileCodeWrapper');
const profileRecoveryCode = document.getElementById('profileRecoveryCode');
const toggleProfileCode = document.getElementById('toggleProfileCode');
const copyProfileCode = document.getElementById('copyProfileCode');

let isCodeVisible = false;
const maskedCode = '••••-••••'; // Shortened mask

// Initialize
profileRecoveryCode.textContent = maskedCode;

function showCode() {
    profileRecoveryCode.textContent = recoveryCode;
    toggleProfileCode.textContent = '🔒'; // Icon changes to lock/hide
    profileRecoveryCode.style.color = 'var(--cyber-pink)';
    isCodeVisible = true;
}

function hideCode() {
    profileRecoveryCode.textContent = maskedCode;
    toggleProfileCode.textContent = '👁️';
    profileRecoveryCode.style.color = '';
    isCodeVisible = false;
}

// Toggle on click
toggleProfileCode.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isCodeVisible) hideCode();
    else showCode();
});

// Also toggle when clicking the wrapper text
profileCodeWrapper.addEventListener('click', () => {
    if (isCodeVisible) hideCode();
    else showCode();
});

// Hide when mouse leaves the area
profileCodeWrapper.addEventListener('mouseleave', () => {
    if (isCodeVisible) hideCode();
});

// Copy Code
copyProfileCode.addEventListener('click', () => {
    // Create a temporary input to copy the real code even if masked
    const tempInput = document.createElement('input');
    tempInput.value = recoveryCode;
    document.body.appendChild(tempInput);
    
    handleCopy(tempInput, copyProfileCode);
    
    document.body.removeChild(tempInput);
});

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

// PREMIUM LOGIC
let isPremium = false; // Will be fetched from API

const premiumBtn = document.getElementById('premiumBtn');
const premiumModal = document.getElementById('premiumModal');
const closePremiumModal = document.getElementById('closePremiumModal');
const premiumBackdrop = document.getElementById('premiumBackdrop');
const buyPremiumBtn = document.getElementById('buyPremiumBtn');

// Premium Active Modal Elements
const premiumActiveModal = document.getElementById('premiumActiveModal');
const closePremiumActiveModal = document.getElementById('closePremiumActiveModal');
const premiumActiveBackdrop = document.getElementById('premiumActiveBackdrop');
const closePremiumActiveBtn = document.getElementById('closePremiumActiveBtn');

// Open Premium Modal
function openPremiumModal() {
    premiumModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Attach close listeners
    attachModalCloseListeners(premiumModal, 'closePremiumModal', 'premiumBackdrop', closePremium);
}

// Close Premium Modal
function closePremium() {
    premiumModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// Open Premium Active Modal
function openPremiumActiveModal() {
    premiumActiveModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Attach close listeners
    attachModalCloseListeners(premiumActiveModal, 'closePremiumActiveModal', 'premiumActiveBackdrop', closePremiumActive);
    
    const closeBtn = premiumActiveModal.querySelector('#closePremiumActiveBtn');
    if (closeBtn) {
        closeBtn.onclick = closePremiumActive;
    }
}

// Close Premium Active Modal
function closePremiumActive() {
    premiumActiveModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

// Handle Premium Button Click
premiumBtn.addEventListener('click', () => {
    if (isPremium) {
        openPremiumActiveModal();
    } else {
        openPremiumModal();
    }
});

// Premium Purchase Flow with API
buyPremiumBtn.addEventListener('click', async () => {
    buyPremiumBtn.innerHTML = 'Processing... ↻';
    buyPremiumBtn.disabled = true;
    
    try {
        // Step 1: Create order
        const orderResponse = await fetch(`${API_CONFIG.API_BASE_URL}/premium/create-order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getApiToken()}`
            },
            body: JSON.stringify({
                amount: 29900, // 299 INR in paise
                duration: 'lifetime'
            })
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const orderData = await orderResponse.json();

        // Step 2: Open Razorpay payment gateway
        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Duvv.me',
            description: 'Premium Membership',
            order_id: orderData.orderId,
            handler: async function (response) {
                // Step 3: Verify payment
                try {
                    const verifyResponse = await fetch(`${API_CONFIG.API_BASE_URL}/premium/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getApiToken()}`
                        },
                        body: JSON.stringify({
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        })
                    });

                    if (!verifyResponse.ok) {
                        throw new Error('Payment verification failed');
                    }

                    const verifyData = await verifyResponse.json();
                    
                    // Show success message
                    await showAlert(
                        'Welcome to Duvv.me GOLD! 👑',
                        'Premium Activated! ✨',
                        '🎉'
                    );

                    // Reload to reflect premium status
                    window.location.reload();
                } catch (error) {

                    await showAlert(
                        'Payment verification failed. Please contact support if amount was deducted.',
                        'Verification Error',
                        '⚠️'
                    );
                }
            },
            prefill: {
                name: username,
                email: '',
                contact: ''
            },
            theme: {
                color: '#ff006e'
            },
            modal: {
                ondismiss: function() {
                    buyPremiumBtn.innerHTML = 'Upgrade Now via Razorpay';
                    buyPremiumBtn.disabled = false;
                }
            }
        };

        // Initialize Razorpay
        const rzp = new Razorpay(options);
        rzp.open();
        
        buyPremiumBtn.innerHTML = 'Upgrade Now via Razorpay';
        buyPremiumBtn.disabled = false;

    } catch (error) {

        await showAlert(
            'Failed to initiate payment. Please try again.',
            'Payment Error',
            '⚠️'
        );
        buyPremiumBtn.innerHTML = 'Upgrade Now via Razorpay';
        buyPremiumBtn.disabled = false;
    }
});

// Update UI based on Premium Status
function updatePremiumUI() {
    if (isPremium) {
        premiumBtn.classList.add('is-premium');
        document.querySelectorAll('.locked-theme').forEach(el => {
            el.classList.add('unlocked');
            el.removeAttribute('data-locked');
            const overlay = el.querySelector('.lock-overlay');
            if(overlay) overlay.remove();
        });
    }
}

function setTheme(isDark) {
    if (isDark) {
        document.body.classList.remove('bright-mode');
        themeIcon.textContent = '🌙';
        setCookie('theme', 'dark');
    } else {
        document.body.classList.add('bright-mode');
        themeIcon.textContent = '☀️';
        setCookie('theme', 'bright');
    }
}

const savedTheme = getCookie('theme');
if (savedTheme === 'bright') {
    setTheme(false);
}

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('bright-mode');
    setTheme(!isDark);
});

// Fetch user's premium status from API
async function fetchUserPremiumStatus() {
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        try {
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getApiToken()}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                isPremium = data.user.isPremium || false;
                updatePremiumUI();
            }
        } catch (error) {

            // Default to non-premium on failure
            isPremium = false;
            updatePremiumUI();
        }
    } else {
        // API is required; default non-premium
        isPremium = false;
        updatePremiumUI();
    }
}

// Fetch premium status on page load
fetchUserPremiumStatus();

// Cache for duvvs data
let cachedDuvvs = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds cache
let fetchingRants = false; // Prevent concurrent fetches

// Rants Data Management
async function getRants(forceRefresh = false) {
    // Return cached data if available and fresh
    if (!forceRefresh && cachedDuvvs && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        return cachedDuvvs;
    }
    
    // Prevent concurrent fetches of the same data
    if (fetchingRants && !forceRefresh) {
        return cachedDuvvs || [];
    }
    
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        fetchingRants = true;
        try {
            const token = getApiToken();
            if (!token) {
                fetchingRants = false;
                return [];
            }
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/duvvs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            console.log('Duvvs fetch response:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Duvvs data received:', data);
                
                if (data.duvvs && Array.isArray(data.duvvs)) {
                    cachedDuvvs = data.duvvs.map(d => ({
                        id: d.duvvId || d.id,
                        question: d.question,
                        theme: d.theme,
                        responseTypes: d.responseTypes,
                        isPremium: d.isPremium,
                        createdAt: d.createdAt,
                        responses: [],
                        responseCount: d.responseCount || 0,
                        views: d.views || 0,
                        deactivated: d.deactivated || false
                    }));
                    cacheTimestamp = Date.now();
                    fetchingRants = false;
                    console.log('Cached duvvs:', cachedDuvvs.length);
                    return cachedDuvvs;
                } else {
                    console.error('Invalid data structure:', data);
                }
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch duvvs:', response.status, errorText);
            }
            fetchingRants = false;
            return cachedDuvvs || [];
        } catch (error) {
            console.error('Error fetching duvvs:', error);
            fetchingRants = false;
            return cachedDuvvs || [];
        }
    }
    return [];
}

function saveRants(rants) {
    // No-op: LocalStorage disabled
}

// Helper to get API token
function getApiToken() {
    return getCookie(API_CONFIG.TOKEN_KEY);
}

// Generate Random ID - Shorter, unique (timestamp-based)
function generateId() {
    // Base36 timestamp (8 chars) + 2 char random = ~10 chars total
    const timestamp = Date.now().toString(36);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let random = '';
    for (let i = 0; i < 2; i++) {
        random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return timestamp + random;
}

// Update Stats (uses cached data from getRants)
async function updateStats(rants = null) {
    if (!rants) {
        rants = await getRants();
    }
    const totalResponses = rants.reduce((sum, rant) => sum + (rant.responseCount || rant.responses?.length || 0), 0);
    
    document.getElementById('rantCount').textContent = rants.length;
    document.getElementById('responseCount').textContent = totalResponses;
}

// Render Rants
async function renderRants() {
    const container = document.getElementById('rantsContainer');
    
    // Show loading state
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon" style="animation: spin 2s linear infinite;">⏳</div>
            <h3>Loading your duvvs...</h3>
            <p>hold tight, fr fr 💫</p>
        </div>
    `;
    
    const rants = await getRants();
    console.log('Rendering rants:', rants);
    await updateStats(rants); // Pass rants to avoid double fetch
    const activeRants = rants.filter(r => !r.deactivated);
    const deactivatedRants = rants.filter(r => r.deactivated);
    
    console.log('Active rants:', activeRants.length, 'Deactivated:', deactivatedRants.length);
    
    // Cache all duvvs for share buttons
    rants.forEach(r => duvvDetailsCache.set(r.id, r));

    if (rants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🦗</div>
                <h3>it's giving quiet...</h3>
                <p>start duvingg and let the tea spill ☕</p>
            </div>
        `;
        return;
    }

    function rantCard(rant, isDeactivated = false) {
        const responseCount = rant.responseCount || 0;
        const timeAgo = getTimeAgo(new Date(rant.createdAt));
        const theme = rant.theme || { text: '#ffffff', bg: '#ff006e', outline: '#7209b7' };
        return `
            <div class="rant-card${isDeactivated ? ' rant-deactivated' : ''}" data-rant-id="${rant.id}" 
                 style="background: ${theme.bg}; border-color: ${theme.outline}; color: ${theme.text}; opacity: ${isDeactivated ? '0.6' : '1'};">
                <div class="rant-card-header" style="display: flex; justify-content: space-between; align-items: center;">
                    <div class="rant-status${isDeactivated ? ' status-deactivated' : ' status-active'}" style="background: ${theme.outline}20; color: ${theme.outline};">
                        ${isDeactivated ? '🛑 Deactivated' : '🔥 Active'}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        ${!isDeactivated && isPremium ? `<button class="card-copy-btn change-theme-btn" data-rant-id="${rant.id}" style="color:${theme.text};border:1px solid ${theme.outline};background:${theme.outline}20;">🎨</button>` : ''}
                        ${!isDeactivated ? `<button class="card-copy-btn copy-link-btn" data-rant-id="${rant.id}" 
                                style="color: ${theme.text}; border: 1px solid ${theme.outline}; background: ${theme.outline}20;">
                            🔗
                        </button>
                        <button class="card-copy-btn delete-rant-btn" data-rant-id="${rant.id}" 
                                style="color: ${theme.text}; border: 1px solid ${theme.outline}; background: ${theme.outline}20;">
                            🗑️
                        </button>` : ''}
                    </div>
                </div>
                <div class="rant-question">${escapeHtml(rant.question)}</div>
                <div class="rant-footer" style="color: ${theme.text}90; border-top: 1px solid ${theme.outline}40;">
                    <div class="rant-stats">
                        <span>💬 ${responseCount} responses</span>
                    </div>
                    <span>⏰ ${timeAgo}</span>
                </div>
            </div>
        `;
    }

    container.innerHTML =
        activeRants.map(r => rantCard(r, false)).join('') +
        deactivatedRants.map(r => rantCard(r, true)).join('');

    document.querySelectorAll('.rant-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent opening detail if clicking the copy, theme, or delete button
            if (e.target.closest('.copy-link-btn') || e.target.closest('.change-theme-btn') || e.target.closest('.delete-rant-btn')) return;
            const rantId = card.getAttribute('data-rant-id');
            openRantDetail(rantId);
        });
    });
    // Add event listeners for change theme buttons (only for active)
    if (isPremium) {
        document.querySelectorAll('.change-theme-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const rantId = btn.getAttribute('data-rant-id');
                openThemeChangeModal(rantId);
            };
        });
    }
    // Add event listeners for delete rant buttons (only for active)
    document.querySelectorAll('.delete-rant-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const rantId = btn.getAttribute('data-rant-id');
            const confirmed = await showConfirm(
                'This cannot be undone! All responses will be lost.',
                'Deactivate this duvv? 🗑️',
                'Deactivate',
                'Cancel',
                '⚠️',
                true
            );
            if (confirmed) {
                deactivateRant(rantId);
            }
        };
    });
}

// Time Ago Helper
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create Rant Modal
const createRantModal = document.getElementById('createRantModal');
const createRantBtn = document.getElementById('createRantBtn');
const closeModal = document.getElementById('closeModal');
const modalBackdrop = document.getElementById('modalBackdrop');


// Steps
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const step4 = document.getElementById('step4');

// Step 1: Question Selection
let selectedQuestion = '';
const presetButtons = document.querySelectorAll('.preset-btn');
const customQuestion = document.getElementById('customQuestion');
const questionCharCount = document.getElementById('questionCharCount');
const nextToThemes = document.getElementById('nextToThemes');

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        presetButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedQuestion = btn.getAttribute('data-question');
        customQuestion.value = '';
    });
});

customQuestion.addEventListener('input', (e) => {
    questionCharCount.textContent = e.target.value.length;
    if (e.target.value.trim().length > 0) {
        selectedQuestion = e.target.value.trim();
        presetButtons.forEach(b => b.classList.remove('selected'));
    }
});

nextToThemes.addEventListener('click', async () => {
    if (!selectedQuestion || selectedQuestion.trim().length < 5) {
        await showAlert(
            'Your question needs to be at least 5 characters long!',
            'Pick a question! 📝',
            '⚠️'
        );
        return;
    }
    showStep(2);
});

// Step 2: Theme Selection
let selectedTheme = null;
const themePacks = document.querySelectorAll('.theme-pack');
const nextToResponseType = document.getElementById('nextToResponseType');
const backToQuestion = document.getElementById('backToQuestion');

themePacks.forEach(pack => {
    pack.addEventListener('click', () => {
        // Check for lock
        if (pack.hasAttribute('data-locked') && pack.getAttribute('data-locked') === 'true') {
            openPremiumModal();
            return;
        }

        themePacks.forEach(p => p.classList.remove('selected'));
        pack.classList.add('selected');
        selectedTheme = {
            name: pack.getAttribute('data-theme'),
            text: pack.getAttribute('data-text'),
            bg: pack.getAttribute('data-bg'),
            outline: pack.getAttribute('data-outline')
        };
        nextToResponseType.disabled = false;
    });
});

nextToResponseType.addEventListener('click', async () => {
    if (!selectedTheme) {
        await showAlert(
            'Pick a vibe for your duvv! Choose a theme to continue.',
            'Choose a theme! 🎨',
            '⚠️'
        );
        return;
    }
    showStep(3);
});

backToQuestion.addEventListener('click', () => showStep(1));

// Step 3: Response Type Selection
const responseTypeCheckboxes = document.querySelectorAll('input[name="responseType"]');
const createRantFinal = document.getElementById('createRantFinal');
const backToThemes = document.getElementById('backToThemes');

createRantFinal.addEventListener('click', async () => {
    const selectedTypes = Array.from(responseTypeCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedTypes.length === 0) {
        await showAlert(
            'Choose at least one way people can respond!',
            'Select response type! 💬',
            '⚠️'
        );
        return;
    }
    
    createNewRant(selectedQuestion, selectedTheme, selectedTypes);
});

backToThemes.addEventListener('click', () => showStep(2));

// Step 4: Success & Share
const copyFinalLink = document.getElementById('copyFinalLink');
const doneCreateRant = document.getElementById('doneCreateRant');

// Unified Copy Function
async function handleCopy(inputElement, buttonElement) {
    const textToCopy = inputElement.value;
    
    // Visual feedback immediately
    const originalText = buttonElement.innerHTML; // Save HTML to preserve icons
    const originalBg = buttonElement.style.background;
    const originalColor = buttonElement.style.color;
    const originalBorder = buttonElement.style.borderColor;
    
    // Check if Clipboard API is available
    let success = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(textToCopy);
            success = true;
        } catch (err) {

        }
    }
    
    if (!success) {
        try {
            inputElement.select();
            inputElement.setSelectionRange(0, 99999);
            document.execCommand('copy');
            success = true;
        } catch (e) {

        }
    }

    if (success) {
        showCopyNotification(); // Bottom toast
        
        // Button feedback - Clean text, no emojis
        buttonElement.textContent = 'Copied';
        buttonElement.style.background = 'var(--lime-green)';
        buttonElement.style.borderColor = 'var(--lime-green)';
        buttonElement.style.color = '#000'; // Ensure readability on green
        
        // Reset button after 2 seconds
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.style.background = originalBg;
            buttonElement.style.color = originalColor;
            buttonElement.style.borderColor = originalBorder;
        }, 2000);
    } else {
        buttonElement.textContent = 'Failed';
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
        }, 2000);
    }
}

copyFinalLink.addEventListener('click', async () => {
    const shareLink = document.getElementById('finalShareLink');
    if (shareLink && shareLink.value && lastCreatedRant) {
        await shareRant(lastCreatedRant, shareLink.value);
    }
});

doneCreateRant.addEventListener('click', () => {
    createRantModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    resetCreateRantModal();
    renderRants();
    updateStats();
});

// Helper Functions
function showStep(stepNumber) {
    [step1, step2, step3, step4].forEach(step => step.classList.add('hidden'));
    document.getElementById(`step${stepNumber}`).classList.remove('hidden');
}

function resetCreateRantModal() {
    showStep(1);
    selectedQuestion = '';
    selectedTheme = null;
    presetButtons.forEach(b => b.classList.remove('selected'));
    themePacks.forEach(p => p.classList.remove('selected'));
    customQuestion.value = '';
    questionCharCount.textContent = '0';
    responseTypeCheckboxes.forEach(cb => {
        cb.checked = cb.value === 'text';
    });
    nextToResponseType.disabled = true;
    
    // Reset create button
    const createBtn = document.getElementById('createRantFinal');
    if (createBtn) {
        createBtn.disabled = false;
        createBtn.innerHTML = '<span>Create my duvv! 🚀</span>';
    }
}

// Add Test Responses (for testing purposes)
function addTestResponses() {
    const rants = getRants();
    if (rats.length === 0) return; // Fixed typo: rats -> rants
    
    // Add test responses to the first rant
    const firstRant = rants[0];
    if (!firstRant.responses) {
        firstRant.responses = [];
    }
    
    // Add different types of responses
    const testResponses = [
        {
            type: 'text',
            text: 'Honestly, you\'re one of the realest people I know! Always keeping it 100 fr fr 💯',
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
            type: 'text',
            text: 'Ngl you have the best music taste and your fits are always on point! Keep slaying bestie ✨',
            anonymous: false,
            author: 'Sarah_M',
            createdAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        },
        {
            type: 'audio',
            duration: '0:27',
            audioUrl: 'mock-audio-url',
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date(Date.now() - 10800000).toISOString() // 3 hours ago
        },
        {
            type: 'drawing',
            drawingUrl: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect fill=\'%2338ef7d\' width=\'400\' height=\'300\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'30\' fill=\'white\' text-anchor=\'middle\' dy=\'.3em\'%3E💚 You\'re amazing!%3C/text%3E%3C/svg%3E',
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date(Date.now() - 14400000).toISOString() // 4 hours ago
        },
        {
            type: 'text',
            text: 'Your energy is unmatched! Every time we hang out it\'s such good vibes. Don\'t ever change 🌟',
            anonymous: false,
            author: 'Mike_Codes',
            createdAt: new Date(Date.now() - 18000000).toISOString() // 5 hours ago
        },
        {
            type: 'text',
            text: 'Low-key you inspire me to be better every day. Thanks for being you! 🙏',
            anonymous: true,
            author: 'Anonymous',
            createdAt: new Date(Date.now() - 21600000).toISOString() // 6 hours ago
        }
    ];
    
    // Only add if responses are empty
    if (firstRant.responses.length === 0) {
        firstRant.responses = testResponses;
        saveRants(rants);
    }
}

// Call this function on page load for testing
window.addEventListener('load', () => {
    // Uncomment the line below to add test responses
    // addTestResponses();
});

async function createNewRant(question, theme, responseTypes) {
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        // Show loading state
        const createBtn = document.getElementById('createRantFinal');
        if (!createBtn) {

            return;
        }
        const originalText = createBtn.textContent;
        createBtn.disabled = true;
        createBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> Creating...';
        
        try {
            const token = getApiToken();
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/duvvs/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: question,
                    theme: theme,
                    responseTypes: responseTypes
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                const newRant = {
                    id: data.duvv.id || data.duvv.duvvId,
                    question: data.duvv.question,
                    theme: data.duvv.theme,
                    responseTypes: data.duvv.responseTypes,
                    isPremium: data.duvv.isPremium,
                    createdAt: data.duvv.createdAt,
                    responses: []
                };
                
                // Store for final share button
                lastCreatedRant = newRant;
                
                // Show success step - ALWAYS use production URL, ignore backend shareUrl
                const productionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168') ? 'https://duvv-me.vercel.app' : window.location.origin;
                const shareUrl = `${productionUrl}/${username}/${newRant.id}`;
                const finalShareLink = document.getElementById('finalShareLink');
                if (finalShareLink) finalShareLink.value = shareUrl;
                const previewQuestion = document.querySelector('.preview-question');
                if (previewQuestion) previewQuestion.textContent = question;
                
                // Apply theme to preview
                const previewCard = document.querySelector('.rant-preview');
                if (previewCard) {
                    previewCard.style.background = theme.bg;
                    previewCard.style.borderColor = theme.outline;
                    previewCard.style.color = theme.text;
                }
                
                showStep(4);
                
                // Invalidate cache and refresh
                cachedDuvvs = null;
                await renderRants();
            } else {
                const errorData = await response.json();
                if (createBtn) {
                    createBtn.disabled = false;
                    createBtn.innerHTML = originalText;
                }
                await showAlert(
                    errorData.error || 'Unknown error occurred while creating your duvv.',
                    'Error creating duvv! 😔',
                    '❌'
                );
            }
        } catch (error) {

            if (createBtn) {
                createBtn.disabled = false;
                createBtn.innerHTML = originalText;
            }
            await showAlert(
                'Could not connect to server. Please try again later.',
                'Connection error! 😵',
                '🔌'
            );
        }
        return;
    }
    
    // LocalStorage mode removed (API only)
}

// Rant Detail Modal
const rantDetailModal = document.getElementById('rantDetailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const detailBackdrop = document.getElementById('detailBackdrop');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// Response Detail Modal
const responseDetailModal = document.getElementById('responseDetailModal');
const closeResponseModal = document.getElementById('closeResponseModal');
const responseBackdrop = document.getElementById('responseBackdrop');
const shareToStoryBtn = document.getElementById('shareToStoryBtn');
const downloadResponseBtn = document.getElementById('downloadResponseBtn');
const getHintsBtn = document.getElementById('getHintsBtn'); // New Button
const deleteResponseBtn = document.getElementById('deleteResponseBtn'); // Delete Button

// Hints Modal
const hintsModal = document.getElementById('hintsModal');
const closeHintsModal = document.getElementById('closeHintsModal');
const hintsBackdrop = document.getElementById('hintsBackdrop');
const hintsGrid = document.getElementById('hintsGrid');

// Hints Logic
getHintsBtn.addEventListener('click', async () => {
    if (!isPremium) {
        openPremiumModal();
        return;
    }
    
    if (!currentResponse || !currentResponse.meta) {
        await showAlert(
            'This response doesn\'t have any hint data available.',
            'No hints available! 😕',
            '🤷'
        );
        return;
    }
    
    const meta = currentResponse.meta;
    
    // Parse User Agent for simpler display
    let os = "Unknown OS";
    if (meta.userAgent.includes("iPhone")) os = "iPhone (iOS)";
    else if (meta.userAgent.includes("Android")) os = "Android";
    else if (meta.userAgent.includes("Windows")) os = "Windows PC";
    else if (meta.userAgent.includes("Mac")) os = "Mac";
    
    let browser = "Unknown Browser";
    if (meta.userAgent.includes("Chrome")) browser = "Chrome";
    else if (meta.userAgent.includes("Safari")) browser = "Safari";
    else if (meta.userAgent.includes("Firefox")) browser = "Firefox";

    // Format Location: Use City/Region if available, fallback to Timezone
    let locationDisplay = meta.timezone.split('/')[1] || meta.timezone;
    if (meta.city && meta.region) {
        locationDisplay = `${meta.city}, ${meta.region}`; // e.g. New Delhi, Delhi
    }

    hintsGrid.innerHTML = `
        <div class="hint-card">
            <span class="hint-label">Device OS</span>
            <span class="hint-value">${os}</span>
        </div>
        <div class="hint-card">
            <span class="hint-label">Browser</span>
            <span class="hint-value">${browser}</span>
        </div>
        <div class="hint-card">
            <span class="hint-label">Location</span>
            <span class="hint-value">${locationDisplay}</span>
        </div>
        <div class="hint-card">
            <span class="hint-label">Network Provider</span>
            <span class="hint-value">${meta.provider || 'Unknown'}</span>
        </div>
        <div class="hint-card">
            <span class="hint-label">Screen</span>
            <span class="hint-value">${meta.screenRes}</span>
        </div>
        <div class="hint-card">
            <span class="hint-label">Touch Screen</span>
            <span class="hint-value">${meta.touch}</span>
        </div>
    `;
    
    hintsModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Attach close listeners
    attachModalCloseListeners(hintsModal, 'closeHintsModal', 'hintsBackdrop', () => {
        hintsModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    });
});

closeHintsModal.addEventListener('click', () => hintsModal.classList.add('hidden'));
hintsBackdrop.addEventListener('click', () => hintsModal.classList.add('hidden'));

let currentRant = null;
let currentResponse = null;
let lastCreatedRant = null;

// Cache for duvv details when rendering list
const duvvDetailsCache = new Map();

// Pagination State
let currentResponsePage = 1;
const responsesPerPage = 12;
let loadedResponses = [];

// Open Rant Detail
async function openRantDetail(rantId) {
    // Show modal immediately with loading state
    rantDetailModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Show loading in responses container
    const container = document.getElementById('responsesContainer');
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;padding:80px;grid-column:1/-1;"><span style="font-size:3rem;animation:spin 1s linear infinite;">⏳</span></div>';
    
    const rants = await getRants();
    const rant = rants.find(r => r.id === rantId);

    if (!rant) {
        rantDetailModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        return;
    }
    
    // Load responses from API if in API mode
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        try {
            const token = getApiToken();
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/responses/${rantId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                rant.responses = data.responses.map(r => ({
                    type: r.type,
                    text: r.text,
                    audioUrl: r.audioUrl,
                    audioDuration: r.audioDuration,
                    voiceFilter: r.voiceFilter,
                    imageUrl: r.drawingUrl,
                    drawingMode: r.drawingMode,
                    brushColor: r.drawingBrushColor,
                    backgroundColor: r.drawingBackgroundColor,
                    createdAt: r.createdAt,
                    id: r.id
                }));
            }
        } catch (error) {
            rant.responses = [];
        }
    }

    currentRant = rant;
    const theme = rant.theme || { text: '#ffffff', bg: '#ff006e', outline: '#7209b7' };

    // Apply theme to header
    const header = document.getElementById('rantDetailHeader');
    header.style.background = theme.bg;
    header.style.color = theme.text;
    header.style.borderColor = theme.outline;

    document.getElementById('detailQuestion').textContent = rant.question;
    document.getElementById('detailMeta').textContent = `Posted ${getTimeAgo(new Date(rant.createdAt))} • ${rant.responseTypes.join(', ')} responses allowed`;
    document.getElementById('responseCountDetail').textContent = rant.responses?.length || 0;

    // Remove share section for deactivated duvvs
    const shareSection = document.querySelector('.share-section');
    if (rant.deactivated) {
        if (shareSection) shareSection.parentNode.removeChild(shareSection);
        document.getElementById('detailMeta').textContent += ' • This duvv is deactivated';
    } else {
        // If not deactivated, ensure share section is visible and update link
        if (shareSection) shareSection.style.display = '';
        const productionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168') ? 'https://duvv-me.vercel.app' : window.location.origin;
        const shareUrl = `${productionUrl}/${username}/${rantId}`;
        document.getElementById('shareLink').value = shareUrl;
    }

    // Reset and Render responses
    loadedResponses = [...(rant.responses || [])].reverse();
    renderResponses(true);

    rantDetailModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Attach close listeners
    attachModalCloseListeners(rantDetailModal, 'closeDetailModal', 'detailBackdrop', () => {
        rantDetailModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    });
    
    // Add scroll listener for infinite loading
    const modalContent = rantDetailModal.querySelector('.modal-content');
    modalContent.onscroll = () => {
        if (modalContent.scrollTop + modalContent.clientHeight >= modalContent.scrollHeight - 100) {
            renderResponses(false);
        }
    };

    // Add tip text at the bottom of the rant detail modal
    const rantDetailModalContent = rantDetailModal.querySelector('.modal-content');
    if (rantDetailModalContent) {
        let tip = rantDetailModalContent.querySelector('.duvv-delete-tip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'duvv-delete-tip';
            tip.style.cssText = 'font-size:11px;color:var(--text-tertiary,#666);margin-top:18px;text-align:center;opacity:0.7;';
            tip.textContent = '💡 tip: long-press any response to delete it';
            rantDetailModalContent.appendChild(tip);
        }
    }
}

// Render Responses (Grid + Infinite Scroll) - WITH THROTTLING
let scrollTimeout;
function renderResponses(reset = false) {
    const container = document.getElementById('responsesContainer');
    
    if (reset) {
        container.innerHTML = '';
        currentResponsePage = 1;
    }
    
    // Sort responses by latest first
    loadedResponses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (loadedResponses.length === 0) {
        if (reset) {
            container.innerHTML = `
                <div class="empty-responses" style="grid-column: 1 / -1;">
                    <p>No responses yet... be patient 🌟</p>
                </div>
            `;
        }
        return;
    }
    
    const start = (currentResponsePage - 1) * responsesPerPage;
    const end = start + responsesPerPage;
    const chunk = loadedResponses.slice(start, end);
    
    if (chunk.length === 0) return;
    
    const html = chunk.map((response, index) => {
        const globalIndex = start + index;
        const timeAgo = getTimeAgo(new Date(response.createdAt));
        
        let contentHtml = '';
        let badgeHtml = '';
        
        if (response.type === 'text') {
            badgeHtml = '<span class="response-type-badge badge-text">✍️ Text</span>';
            contentHtml = `<p class="response-text">${escapeHtml(response.text)}</p>`;
        } else if (response.type === 'audio') {
            badgeHtml = '<span class="response-type-badge badge-audio">🎙️ Audio</span>';
            contentHtml = `<p class="response-text" style="text-align: center; opacity: 0.8; font-style: italic;">🎧 Audio Response<br><span style="font-size: 13px;">Tap to listen</span></p>`;
        } else if (response.type === 'drawing') {
            badgeHtml = '<span class="response-type-badge badge-drawing">🎨 Drawing</span>';
            const drawingUrl = response.imageUrl || response.drawingUrl;
            if (drawingUrl) {
                contentHtml = `<img src="${drawingUrl}" alt="Drawing" class="response-drawing-preview" loading="lazy">`;
            } else {
                contentHtml = `<p class="response-text" style="text-align: center; opacity: 0.8; font-style: italic;">🎨 Drawing<br><span style="font-size: 13px;">Tap to view</span></p>`;
            }
        }
        
        return `
            <div class="response-card" data-response-index="${globalIndex}" style="will-change: transform; transform: translateZ(0);">
                <div class="response-card-header">
                    ${badgeHtml}
                </div>
                <div class="response-card-content">
                    ${contentHtml}
                </div>
                <div class="response-card-footer">
                    <span>${response.anonymous || !response.author ? '🎭 Anon' : '👤 ' + response.author}</span>
                    <span>${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.insertAdjacentHTML('beforeend', html);
    currentResponsePage++;
    
    // Add long-press delete functionality to newly added cards
    attachLongPressToResponses();
}

// Global audio instance for modal playback
let currentModalAudio = null;

// Long-press delete functionality
let longPressTimer;
let longPressTarget;

function attachLongPressToResponses() {
    document.querySelectorAll('.response-card').forEach(card => {
        // Skip if already has listeners
        if (card.dataset.longPressAttached) return;
        card.dataset.longPressAttached = 'true';

        // Disable default context menu (prevents Chrome image dialog)
        card.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        const startLongPress = (e) => {
            longPressTarget = card;
            longPressTimer = setTimeout(() => {
                const responseIndex = parseInt(card.getAttribute('data-response-index'));
                showDeleteConfirmation(responseIndex, card);
            }, 800); // 800ms long press
        };

        const cancelLongPress = () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            longPressTarget = null;
        };

        // Touch events
        card.addEventListener('touchstart', startLongPress, { passive: true });
        card.addEventListener('touchend', cancelLongPress);
        card.addEventListener('touchmove', cancelLongPress);

        // Mouse events (for desktop)
        card.addEventListener('mousedown', startLongPress);
        card.addEventListener('mouseup', cancelLongPress);
        card.addEventListener('mouseleave', cancelLongPress);
    });
}

function showDeleteConfirmation(responseIndex, cardElement) {
    if (!currentRant || !loadedResponses[responseIndex]) return;
    
    const response = loadedResponses[responseIndex];
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'delete-response-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: var(--dark-card);
        padding: 32px;
        border-radius: 20px;
        max-width: 90%;
        width: 380px;
        text-align: center;
        border: 2px solid #ff4444;
        animation: scaleIn 0.3s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    // Bright mode support
    if (document.body.classList.contains('bright-mode')) {
        dialog.style.background = 'var(--bright-card)';
        dialog.style.color = 'var(--bright-text)';
    }
    
    dialog.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px;">🗑️</div>
        <h3 style="margin: 0 0 12px 0; color: inherit; font-size: 24px; font-weight: 700;">Delete This Response?</h3>
        <p style="margin: 0 0 28px 0; color: var(--dark-text-secondary); font-size: 15px; line-height: 1.5;">
            This action cannot be undone. The response will be permanently deleted.
        </p>
        <div style="display: flex; gap: 12px;">
            <button id="cancelDeleteResponse" class="dialog-btn dialog-btn-secondary" style="flex: 1;">
                Cancel
            </button>
            <button id="confirmDeleteResponse" class="dialog-btn dialog-btn-danger" style="flex: 1;">
                Delete
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Add styles if not exists
    if (!document.getElementById('deleteResponseStyles')) {
        const style = document.createElement('style');
        style.id = 'deleteResponseStyles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            #confirmDeleteResponse:hover {
                background: #ff2222 !important;
                transform: translateY(-2px);
            }
            #cancelDeleteResponse:hover {
                border-color: var(--cyber-pink);
                color: var(--cyber-pink);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Event listeners
    const closeOverlay = () => overlay.remove();
    
    overlay.querySelector('#cancelDeleteResponse').onclick = closeOverlay;
    overlay.onclick = (e) => { if (e.target === overlay) closeOverlay(); };
    
    overlay.querySelector('#confirmDeleteResponse').onclick = () => {
        deleteResponse(responseIndex);
        closeOverlay();
        
        // Stop any playing audio
        if (currentModalAudio) {
            currentModalAudio.pause();
            currentModalAudio.currentTime = 0;
            currentModalAudio = null;
        }
        
        // Close response detail modal if open
        if (!responseDetailModal.classList.contains('hidden')) {
            responseDetailModal.classList.add('hidden');
            document.body.classList.remove('modal-open');
        }
        
        // Add vibration feedback if supported
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    };
}

async function deleteResponse(responseIndex) {
    if (!currentRant || !loadedResponses[responseIndex]) return;
    
    // Remove from loadedResponses
    loadedResponses.splice(responseIndex, 1);
    
    // Update original rant data
    // API-based app: client-only UI update
    currentRant.responses = [...loadedResponses].reverse();
    
    // Update UI
    document.getElementById('responseCountDetail').textContent = loadedResponses.length;
    renderResponses(true);
    updateStats();
    
    showNotification('🗑️ Response deleted');
}

// Event Delegation for Response Clicks (More efficient for grid)
document.getElementById('responsesContainer').addEventListener('click', (e) => {
    const card = e.target.closest('.response-card');
    if (card) {
        const index = parseInt(card.getAttribute('data-response-index'));
        openResponseDetail(index);
    }
});

// Open Response Detail
function openResponseDetail(responseIndex) {
    if (!currentRant || !loadedResponses[responseIndex]) return;
    
    currentResponse = loadedResponses[responseIndex];
    const theme = currentRant.theme || { text: '#ffffff', bg: '#ff006e', outline: '#7209b7' };
    const responseContent = document.getElementById('responseDetailContent');
    
    if (currentResponse.type === 'text') {
        responseContent.innerHTML = `
            <div class="detail-question" style="color: ${theme.text}; background: ${theme.bg}; border-color: ${theme.outline}; padding: 16px; border-radius: 12px; border: 2px solid;">
                ${escapeHtml(currentRant.question)}
            </div>
            <div class="detail-answer">
                ${escapeHtml(currentResponse.text)}
            </div>
        `;
    } else if (currentResponse.type === 'audio') {
        responseContent.innerHTML = `
            <div class="detail-question" style="color: ${theme.text}; background: ${theme.bg}; border-color: ${theme.outline}; padding: 16px; border-radius: 12px; border: 2px solid;">
                ${escapeHtml(currentRant.question)}
            </div>
            <div class="detail-audio-player">
                <button class="audio-player-btn" id="playAudioBtn">▶</button>
                <div style="flex: 1; text-align: center;">
                    <div style="font-size: 18px; font-weight: 600; color: ${theme.text}; margin-bottom: 8px;">🎧 Audio Response</div>
                    <div id="audioDetailTime" style="color: ${theme.outline}; font-size: 14px;">0:00</div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const playBtn = document.getElementById('playAudioBtn');
            const timeDisplay = document.getElementById('audioDetailTime');
            
            if (!currentResponse.audioUrl) {
                timeDisplay.textContent = 'Audio unavailable';
                playBtn.disabled = true;
                return;
            }
            
            const audio = new Audio(currentResponse.audioUrl);
            
            // Store audio globally to stop on modal close
            currentModalAudio = audio;

            audio.addEventListener('loadedmetadata', () => {
                const duration = Math.floor(audio.duration);
                const mins = Math.floor(duration / 60);
                const secs = duration % 60;
                timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            });
            
            audio.addEventListener('error', (e) => {

                timeDisplay.textContent = 'Failed to load';
                playBtn.disabled = true;
            });

            audio.addEventListener('timeupdate', () => {
                const remaining = Math.floor(audio.duration - audio.currentTime);
                const mins = Math.floor(remaining / 60);
                const secs = remaining % 60;
                timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
            });

            playBtn.onclick = () => {
                if (audio.paused) {
                    audio.play().catch(err => {

                        timeDisplay.textContent = 'Playback failed';
                    });
                    playBtn.textContent = '⏸';
                } else {
                    audio.pause();
                    playBtn.textContent = '▶';
                }
            };

            audio.onended = () => {
                playBtn.textContent = '▶';
            };
        }, 0);

    } else if (currentResponse.type === 'drawing') {
        responseContent.innerHTML = `
            <div class="detail-question" style="color: ${theme.text}; background: ${theme.bg}; border-color: ${theme.outline}; padding: 16px; border-radius: 12px; border: 2px solid;">
                ${escapeHtml(currentRant.question)}
            </div>
            <img src="${currentResponse.imageUrl || currentResponse.drawingUrl}" alt="Drawing response" class="detail-drawing">
        `;
    }

    responseDetailModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    
    // Attach close listeners
    attachModalCloseListeners(responseDetailModal, 'closeResponseModal', 'responseBackdrop', () => {
        // Stop any playing audio
        if (currentModalAudio) {
            currentModalAudio.pause();
            currentModalAudio.currentTime = 0;
            currentModalAudio = null;
        }
        responseDetailModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    });
    
    // Store current response index for delete button
    deleteResponseBtn.dataset.responseIndex = responseIndex;
}

// Delete Response Button Handler
deleteResponseBtn.addEventListener('click', () => {
    const responseIndex = parseInt(deleteResponseBtn.dataset.responseIndex);
    
    // Use custom dialog instead of browser confirm
    showDeleteConfirmation(responseIndex, null);
});

// Share to Story - Generate Canvas Image or Video with Instagram Story intent
shareToStoryBtn.addEventListener('click', () => {
    if (currentResponse && currentResponse.type === 'audio') {
        generateStoryVideo(false);
    } else {
        generateStoryImage(false);
    }
});

// Download Response
downloadResponseBtn.addEventListener('click', () => {
    if (currentResponse && currentResponse.type === 'audio') {
        generateStoryVideo(true);
    } else {
        generateStoryImage(true);
    }
});

// New High-Quality Story Generator (Image)
async function generateStoryImage(forceDownload = false) {
    if (!currentRant || !currentResponse) return;

    const canvas = document.getElementById('storyCanvas');
    const ctx = canvas.getContext('2d');
    const theme = currentRant.theme;
    
    // Set canvas size for Instagram story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Draw Base (Background, Card, Text)
    await drawStoryBase(ctx, canvas.width, canvas.height, theme);

    // Convert to Blob using Promise to keep async chain clean
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    const file = new File([blob], `duvv-story-${Date.now()}.jpg`, { type: 'image/jpeg' });

    if (forceDownload) {
        downloadFile(blob, `duvv-story-${Date.now()}.jpg`);
        showNotification('📸 Story image downloaded!');
        return;
    }

    // Try Sharing with specific Instagram Story intent
    // Use JPG format and specific naming to hint at story intent
    const shareData = {
        files: [file],
        title: 'Story',
        text: ''
    };

    // Check if the browser supports sharing this specific data
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
            await navigator.share(shareData);
            showNotification('🚀 Shared successfully!');
        } catch (err) {

            if (err.name !== 'AbortError') {
                // Fallback if share fails (but not if user cancelled)
                downloadFile(blob, `duvv-story-${Date.now()}.jpg`);
                showNotification('📸 Image downloaded (Share failed)');
            }
        }
    } else {
        // Fallback if sharing not supported

        downloadFile(blob, `duvv-story-${Date.now()}.jpg`);
        // Inform user why it downloaded instead of opening share sheet
        if (!navigator.share) {
            showNotification('📸 Image downloaded (Browser doesn\'t support sharing)');
        } else {
            showNotification('📸 Image downloaded (Cannot share this file type)');
        }
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// New High-Quality Story Generator (Video for Audio)
async function generateStoryVideo(forceDownload = false) {
    if (!currentRant || !currentResponse || !currentResponse.audioUrl) return;
    
    // Show loading overlay
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;';
    loadingOverlay.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 60px; margin-bottom: 20px;">🎥</div>
            <div style="font-size: 24px; color: white; font-weight: 600; margin-bottom: 10px;">Generating Video...</div>
            <div style="font-size: 16px; color: rgba(255,255,255,0.7);">Please wait, this may take a moment</div>
            <div style="margin-top: 30px; width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; overflow: hidden;">
                <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #ff006e, #7209b7); animation: loading 1.5s ease-in-out infinite;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    const canvas = document.getElementById('storyCanvas');
    const ctx = canvas.getContext('2d');
    const theme = currentRant.theme;
    
    // High resolution story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Setup Audio
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioEl = new Audio(currentResponse.audioUrl);
    audioEl.crossOrigin = 'anonymous';
    // Keep audio unmuted for recording - we'll control volume later
    audioEl.volume = 0.01; // Very low during setup
    // Pause any currently playing modal audio
    if (typeof currentModalAudio !== 'undefined' && currentModalAudio && !currentModalAudio.paused) {
        try { currentModalAudio.pause(); } catch {}
    }
    await new Promise(r => audioEl.addEventListener('canplaythrough', r, { once: true }));
    
    const source = audioCtx.createMediaElementSource(audioEl);
    const analyser = audioCtx.createAnalyser();
    const dest = audioCtx.createMediaStreamDestination();
    
    // Improved Visualizer Settings
    analyser.fftSize = 512; // Higher resolution for better animation
    analyser.smoothingTimeConstant = 0.8; // Smoother decay
    
    source.connect(analyser);
    source.connect(dest); // Connect to stream destination for recording
    // Do NOT connect to destination; keep audio silent during generation
    
    // Pre-render static base to an offscreen canvas (matches image canvas)
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;
    const baseCtx = baseCanvas.getContext('2d');
    await drawStoryBase(baseCtx, baseCanvas.width, baseCanvas.height, theme);

    // Setup Recorder
    const canvasStream = canvas.captureStream(30); // 30 FPS
    let audioTrack = dest.stream.getAudioTracks()[0];

    // Fallback: some browsers do not populate MediaStreamDestination until playback starts
    if (!audioTrack) {
        try {
            const elStream = (audioEl.captureStream ? audioEl.captureStream() : (audioEl.mozCaptureStream ? audioEl.mozCaptureStream() : null));
            if (elStream) {
                audioTrack = elStream.getAudioTracks()[0] || audioTrack;
            }
        } catch {}
    }
    if (audioTrack) {
        canvasStream.addTrack(audioTrack);
    }
    
    const recorder = new MediaRecorder(canvasStream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: 8000000, // 8 Mbps for crisp 1080p
        audioBitsPerSecond: 192000
    });
    
    const chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `duvv-story-${Date.now()}.webm`, { type: 'video/webm' });
        
        // Remove loading overlay
        if (loadingOverlay && loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
        
        const shareData = {
            files: [file],
            title: 'Story',
            text: ''
        };

        if (!forceDownload && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                showNotification('🚀 Video shared!');
            } catch (err) {

                if (err.name === 'AbortError') return;
                downloadFile(blob, `duvv-story-${Date.now()}.webm`);
                showNotification('🎥 Video downloaded (Share failed)');
            }
        } else {
            downloadFile(blob, `duvv-story-${Date.now()}.webm`);
            showNotification('🎥 Video downloaded!');
        }
        
        audioCtx.close();
    };
    
    // Animation Loop
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // State for smooth animation (Linear Interpolation)
    const barCount = 10; // More bars
    const currentHeights = new Float32Array(barCount).fill(80); // Start at base height
    
    let animationId;
    let lastFrameTime = 0;
    const fps = 30; // Match capture FPS
    const frameDelay = 1000 / fps;
    
    function renderFrame(currentTime) {
        animationId = requestAnimationFrame(renderFrame);
        
        // Throttle to target FPS
        if (currentTime - lastFrameTime < frameDelay) {
            return;
        }
        lastFrameTime = currentTime;
        
        // 1. Draw Static Base from offscreen buffer (no awaits in rAF)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Determine card geometry (matching drawStoryBase)
        const margin = 80;
        const cardY = 350;
        const cardWidth = canvas.width - (margin * 2);
        const cardHeight = 1100;
        let textY = cardY + 180;
        wrapText(ctx, currentRant.question, cardWidth - 120).forEach(() => { textY += 70; });
        textY += 140; // spacing after divider and "Anonymous replied" text
        
        // 2. Draw Visualizer
        analyser.getByteFrequencyData(dataArray);
        
        const barCount = 10; // More bars for fuller look
        const totalBarWidth = 600; // Fixed total width for consistency
        const barWidth = totalBarWidth / barCount;
        const barGap = 8;
        const barActualWidth = barWidth - barGap;
        const cardX = margin;
        const centerX = cardX + (cardWidth / 2);
        const startX = centerX - (totalBarWidth / 2);
        const centerY = cardY + cardHeight / 2 + 80; // Lower position
        
        // Calculate frequency step to pick representative bins
        const binStep = Math.floor(bufferLength / (barCount * 1.5)); 
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = 2 + (i * binStep);
            const value = dataArray[dataIndex] || 0;
            
            // More dramatic height scaling
            const percent = value / 255;
            const minHeight = 80;
            const maxHeight = 400;
            const targetHeight = minHeight + (percent * maxHeight);
            
            // Smooth interpolation with faster response
            currentHeights[i] = currentHeights[i] + (targetHeight - currentHeights[i]) * 0.4;
            
            const height = currentHeights[i];
            const x = startX + i * barWidth + barGap / 2;
            
            // Vibrant gradient bars
            const grad = ctx.createLinearGradient(x, centerY - height/2, x, centerY + height/2);
            grad.addColorStop(0, theme.outline);
            grad.addColorStop(0.5, theme.text);
            grad.addColorStop(1, theme.outline);
            ctx.fillStyle = grad;
            ctx.save();
            ctx.shadowColor = theme.outline;
            ctx.shadowBlur = 30;
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.roundRect(x, centerY - (height / 2), barActualWidth, height, 8);
            ctx.fill();
            ctx.restore();
        }
        // Footer handled by drawStoryBase for consistency
    }
    
    // Start
    recorder.start();
    
    // Resume audio context (required for Chrome)
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    
    // Unmute and play
    audioEl.muted = false;
    audioEl.volume = 1.0;
    try {
        await audioEl.play();
    } catch (err) {

    }
    renderFrame();
    
    audioEl.onended = () => {
        cancelAnimationFrame(animationId);
        recorder.stop();
    };
}

// Helper to draw the static parts of the story
async function drawStoryBase(ctx, width, height, theme) {
    // 1. Background & Premium Effects
    if (theme.name === 'batman') {
        // Batman Theme: Dark night with subtle bat signal glow
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, width, height);
        
        // Bat Signal Glow
        const signalGradient = ctx.createRadialGradient(width/2, height/3, 50, width/2, height/3, 800);
        signalGradient.addColorStop(0, 'rgba(255, 230, 0, 0.15)');
        signalGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = signalGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Abstract Bats
        ctx.fillStyle = '#000000';
        for(let i=0; i<15; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 10 + Math.random() * 30;
            
            ctx.beginPath();
            // Simple bat shape (two arcs)
            ctx.moveTo(x, y);

            ctx.quadraticCurveTo(x + size, y - size, x + size * 2, y);
            ctx.quadraticCurveTo(x + size, y + size/2, x, y);
            ctx.fill();
        }
    } else if (theme.name === 'vampire') {
        // Vampire Theme: Blood red gradient with drips
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#4a0000');
        gradient.addColorStop(0.4, '#000000');
        gradient.addColorStop(1, '#2a0000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Blood Drips at top
        ctx.fillStyle = 'rgba(139, 0, 0, 0.9)';
        const dripWidth = 80;
        const numDrips = Math.ceil(width / dripWidth);
        
        for (let i = 0; i < numDrips; i++) {
            const dripHeight = 150 + Math.random() * 250;
            ctx.beginPath();
            ctx.moveTo(i * dripWidth, 0);
            ctx.lineTo((i + 1) * dripWidth, 0);
            // Curve down to point
            ctx.quadraticCurveTo((i + 1) * dripWidth, dripHeight/2, (i + 0.5) * dripWidth, dripHeight);
            ctx.quadraticCurveTo(i * dripWidth, dripHeight/2, i * dripWidth, 0);
            ctx.fill();
        }
    } else if (theme.name === 'matrix') {
        // Matrix Theme: Digital rain
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        
        ctx.font = '24px monospace';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * width;
            let y = Math.random() * height;
            const len = 5 + Math.random() * 15;
            
            for (let j = 0; j < len; j++) {
                // Random katakana-ish characters
                const char = String.fromCharCode(0x30A0 + Math.random() * 96);
                ctx.fillText(char, x, y + j * 24);
            }
        }
    } else if (theme.name === 'midnight-gold') {
        // Midnight Gold: Luxury dark with gold sparkles
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Gold Sparkles
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 3;
            const opacity = Math.random() * 0.8;
            
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add cross flare to some
            if (Math.random() > 0.9) {
                ctx.fillRect(x - size*4, y - size/2, size*8, size);
                ctx.fillRect(x - size/2, y - size*4, size, size*8);
            }
        }
        ctx.globalAlpha = 1.0;
    } else {
        // Standard Gradient (Existing logic)
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, theme.bg);
        gradient.addColorStop(1, theme.outline);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Ambient Glow
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        const grad1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 800);
        grad1.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }

    // 3. Glass Card
    const margin = 80;
    const cardY = 350;
    const cardWidth = width - (margin * 2);
    const cardHeight = 1100; 
    const radius = 50;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 30;
    
    // Premium Card Styles
    if (theme.name === 'batman') {
        ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
        ctx.strokeStyle = '#ffe600';
    } else if (theme.name === 'vampire') {
        ctx.fillStyle = 'rgba(30, 0, 0, 0.9)';
        ctx.strokeStyle = '#ff0000';
    } else if (theme.name === 'matrix') {
        ctx.fillStyle = 'rgba(0, 20, 0, 0.9)';
        ctx.strokeStyle = '#00ff00';
    } else if (theme.name === 'midnight-gold') {
        ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
        ctx.strokeStyle = '#ffd700';
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
        ctx.strokeStyle = theme.outline; 
    }
    
    ctx.beginPath();
    ctx.roundRect(margin, cardY, cardWidth, cardHeight, radius);
    ctx.fill();
    
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // 4. Content
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.text; 
    
    // UPDATED: Use @username instead of "Someone asked"
    ctx.font = '600 30px "Outfit", sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText(`@${username} asked:`, width / 2, cardY + 100);
    ctx.globalAlpha = 1.0;

    // Question
    ctx.font = 'bold 52px "Outfit", sans-serif';
    const questionLines = wrapText(ctx, currentRant.question, cardWidth - 120);
    let textY = cardY + 180;
    questionLines.forEach(line => {
        ctx.fillText(line, width / 2, textY);
        textY += 70;
    });

    // Divider
    textY += 50;
    ctx.beginPath();
    ctx.moveTo(margin + 100, textY);
    ctx.lineTo(width - margin - 100, textY);
    
    // Premium Divider Colors
    if (theme.name === 'batman') ctx.strokeStyle = '#ffe600';
    else if (theme.name === 'vampire') ctx.strokeStyle = '#ff0000';
    else if (theme.name === 'matrix') ctx.strokeStyle = '#00ff00';
    else if (theme.name === 'midnight-gold') ctx.strokeStyle = '#ffd700';
    else ctx.strokeStyle = theme.outline;
    
    ctx.lineWidth = 2;
    ctx.stroke();
    textY += 100;

    // "Anonymous replied"
    ctx.font = '600 30px "Outfit", sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = theme.text;
    ctx.fillText('ANONYMOUS REPLIED:', width / 2, textY);
    ctx.globalAlpha = 1.0;
    textY += 80;

    // Response Content
    if (currentResponse.type === 'text') {
        ctx.font = '500 48px "Outfit", sans-serif';
        const answerLines = wrapText(ctx, currentResponse.text, cardWidth - 120);
        answerLines.forEach(line => {
            ctx.fillText(line, width / 2, textY);
            ctx.fillText(' ', width / 2, textY + 10); // Extra space
            textY += 65;
        });
    } else if (currentResponse.type === 'drawing') {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Enable CORS
        img.src = currentResponse.imageUrl;
        await new Promise(r => img.onload = r);
        
        const maxImgHeight = cardY + cardHeight - textY - 80;
        const maxImgWidth = cardWidth - 100;
        const scale = Math.min(maxImgWidth / img.width, maxImgHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.2)';
        ctx.shadowBlur = 20;
        ctx.drawImage(img, (width - w) / 2, textY, w, h);
        ctx.restore();
    }

    // Footer
    const footerY = height - 200;
    const isDarkText = theme.text.toLowerCase().startsWith('#0') || theme.text.toLowerCase().startsWith('#1');
    
    ctx.save();
    ctx.font = '700 80px "Caveat", cursive';
    ctx.textAlign = 'center';
    
    // Create gradient for text
    const textGradient = ctx.createLinearGradient(width/2 - 100, footerY - 40, width/2 + 100, footerY + 40);
    textGradient.addColorStop(0, '#ffffff');
    textGradient.addColorStop(1, '#00d9ff');
    
    ctx.fillStyle = textGradient;
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 2;
    
    ctx.strokeText('Duvv.me', width / 2, footerY);
    ctx.fillText('Duvv.me', width / 2, footerY);
    ctx.restore();
    
    ctx.font = '600 32px "Outfit", sans-serif';
    ctx.fillStyle = isDarkText ? theme.text : '#ffffff';
    ctx.fillText('Duvingg anonymously 🤫', width / 2, footerY + 70);
}

// Helper function to wrap text
function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    const confirmed = await showConfirm(
        'Make sure you saved your recovery code! You\'ll need it to log back in.',
        'Logout? 🚪',
        'Logout',
        'Cancel',
        '🔑',
        true
    );
    if (confirmed) {
        clearAllCookies();
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/';
    }
});

// Notification System - Modern UI
function showNotification(message) {
    // Remove existing notifications to prevent stacking
    const existing = document.querySelector('.app-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'app-notification';
    
    // Clean message of emojis if passed (optional, based on preference)
    // For now, we assume message passed is clean or we style it
    notification.innerHTML = `
        <span style="color: var(--cyber-pink);">●</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// Copy link functionality (Card Buttons)
// Copy link via card button (uses cache, no API call needed)
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-link-btn');
    if (btn) {
        const rantId = btn.getAttribute('data-rant-id');
        const rant = duvvDetailsCache.get(rantId);
        if (!rant || rant.deactivated) return;
        const productionUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168') ? 'https://duvv-me.vercel.app' : window.location.origin;
        const link = `${productionUrl}/${username}/${rantId}`;
        
        await shareRant(rant, link);
    }
});

// Header Copy Button Logic
const headerCopyBtn = document.getElementById('headerCopyBtn');
if (headerCopyBtn) {
    headerCopyBtn.addEventListener('click', async () => {
        // Only allow copy if not deactivated
        if (currentRant && currentRant.deactivated) return;
        const shareLink = document.getElementById('shareLink');
        if (shareLink && shareLink.value) {
            await shareRant(currentRant, shareLink.value);
        }
    });
}

// Replace copyLinkBtn with shareBtn
const shareBtn = document.getElementById('shareBtn');

if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
        if (currentRant && currentRant.deactivated) return;
        
        // Show share options dialog with custom styling
        const responseTypes = currentRant?.responseTypes || [];
        const typesList = responseTypes.map(t => {
            const icons = { text: '✍️ Type', audio: '🎙️ Record', drawing: '🎨 Draw' };
            return icons[t] || t;
        }).join(', ');
        
        const result = await showConfirm(
            `Allow anonymous responses via: ${typesList}\n\nChoose how to share:`,
            'Share Your Duvv',
            'Canvas Sharing',
            'Copy Link'
        );
        
        if (result === true) {
            // Canvas sharing selected
            await generateQuestionCanvas();
        } else if (result === false) {
            // Copy link selected
            const shareLink = document.getElementById('shareLink');
            shareLink.select();
            shareLink.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            await showAlert('Link copied successfully!', 'Ready to share');
        }
        // If result is undefined (closed), do nothing
    });
}

// Reusable share function for any rant
async function shareRant(rant, linkUrl) {
    if (!rant) return;
    
    // Show share options dialog with custom styling
    const responseTypes = rant.responseTypes || [];
    const typesList = responseTypes.map(t => {
        const icons = { text: '✍️ Type', audio: '🎙️ Record', drawing: '🎨 Draw' };
        return icons[t] || t;
    }).join(', ');
    
    const result = await showConfirm(
        `Allow anonymous responses via: ${typesList}\n\nChoose how to share:`,
        'Share Your Duvv',
        'Canvas Sharing',
        'Copy Link'
    );
    
    if (result === true) {
        // Canvas sharing selected - set current rant temporarily
        const prevRant = currentRant;
        currentRant = rant;
        await generateQuestionCanvas();
        currentRant = prevRant;
    } else if (result === false) {
        // Copy link selected
        try {
            await navigator.clipboard.writeText(linkUrl);
        } catch (err) {
            // Fallback
            const input = document.createElement('input');
            input.value = linkUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        
        await showAlert('Link copied successfully!', 'Ready to share');
    }
    // If result is undefined (closed), do nothing
}

// Generate Beautiful Question Canvas
async function generateQuestionCanvas() {
    try {
        if (!currentRant) {

            return;
        }
        
        const canvas = document.getElementById('questionShareCanvas');
        if (!canvas) {

            await showAlert('Error generating canvas', 'Please try again');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const theme = currentRant.theme;
    
    // Set canvas size for Instagram story (1080x1920)
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (theme.name === 'dark-mode') {
        bgGradient.addColorStop(0, '#0a0a0f');
        bgGradient.addColorStop(1, '#1a1a2e');
    } else if (theme.name === 'cyber-pink') {
        bgGradient.addColorStop(0, '#2d1b3d');
        bgGradient.addColorStop(1, '#1a0a1f');
    } else if (theme.name === 'sunset') {
        bgGradient.addColorStop(0, '#4a1942');
        bgGradient.addColorStop(1, '#2d0a26');
    } else if (theme.name === 'ocean-breeze') {
        bgGradient.addColorStop(0, '#001d3d');
        bgGradient.addColorStop(1, '#003554');
    } else if (theme.name === 'forest') {
        bgGradient.addColorStop(0, '#1b4332');
        bgGradient.addColorStop(1, '#0d2818');
    } else if (theme.name === 'lavender') {
        bgGradient.addColorStop(0, '#2d1b3d');
        bgGradient.addColorStop(1, '#1a0a2e');
    } else if (theme.name === 'midnight') {
        bgGradient.addColorStop(0, '#1a1a2e');
        bgGradient.addColorStop(1, '#0f0f1e');
    } else if (theme.name === 'neon') {
        bgGradient.addColorStop(0, '#0a0a0f');
        bgGradient.addColorStop(1, '#1a0f2e');
    } else {
        bgGradient.addColorStop(0, theme.bg);
        bgGradient.addColorStop(1, darkenColor(theme.bg, 30));
    }
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add subtle pattern overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 100 + 50;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }
    ctx.globalAlpha = 1.0;
    
    // Card
    const cardWidth = 900;
    const cardHeight = 1100;
    const cardX = (canvas.width - cardWidth) / 2;
    const cardY = 280;
    
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 30;
    
    ctx.fillStyle = theme.bg;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 40);
    ctx.fill();
    
    // Card outline
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.restore();
    
    // Header - Dove emoji with glow
    ctx.font = '120px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = theme.outline;
    ctx.shadowBlur = 30;
    ctx.fillText('🕊️', canvas.width / 2, cardY + 140);
    ctx.shadowBlur = 0;
    
    // Username
    ctx.fillStyle = theme.text;
    ctx.font = '600 36px "Outfit", sans-serif';
    ctx.globalAlpha = 0.8;
    ctx.fillText(`@${username} asked:`, canvas.width / 2, cardY + 240);
    ctx.globalAlpha = 1.0;
    
    // Question
    ctx.font = 'bold 56px "Outfit", sans-serif';
    ctx.fillStyle = theme.text;
    const questionLines = wrapText(ctx, currentRant.question, cardWidth - 120);
    let textY = cardY + 350;
    questionLines.forEach(line => {
        ctx.fillText(line, canvas.width / 2, textY);
        textY += 75;
    });
    
    // Decorative line
    textY += 60;
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.moveTo(cardX + 150, textY);
    ctx.lineTo(cardX + cardWidth - 150, textY);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    // Response types prompt
    textY += 100;
    const responseTypes = currentRant.responseTypes || [];
    const typesText = responseTypes.map(t => {
        const icons = { text: 'typing', audio: 'recording', drawing: 'drawing' };
        return icons[t] || t;
    }).join(', ');
    ctx.font = '500 38px "Outfit", sans-serif';
    ctx.fillStyle = theme.text;
    ctx.globalAlpha = 0.6;
    ctx.fillText(`Give your reply by ${typesText}`, canvas.width / 2, textY);
    ctx.globalAlpha = 1.0;
    
    // Empty reply box visual
    const replyBoxY = textY + 40;
    ctx.strokeStyle = theme.outline;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.roundRect(cardX + 100, replyBoxY, cardWidth - 200, 180, 20);
    ctx.stroke();
    ctx.globalAlpha = 1.0;
    
    // Bottom branding
    const footerY = canvas.height - 280;
    
    // Logo with gradient using Kablammo font
    ctx.font = '700 58px "Kablammo", cursive';
    ctx.textAlign = 'center';
    
    const logoGradient = ctx.createLinearGradient(canvas.width/2 - 100, footerY - 30, canvas.width/2 + 100, footerY + 30);
    logoGradient.addColorStop(0, '#a69cff');
    logoGradient.addColorStop(0.4, '#80b7ff');
    logoGradient.addColorStop(1, '#9bd4ff');
    
    ctx.fillStyle = logoGradient;
    ctx.shadowColor = 'rgba(150, 180, 255, 0.5)';
    ctx.shadowBlur = 20;
    ctx.fillText('Duvv.me', canvas.width / 2, footerY);
    ctx.shadowBlur = 0;
    
    // CTA using Outfit font
    ctx.font = '500 26px "Outfit", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillText('tap to answer anonymously ✨', canvas.width / 2, footerY + 60);
    ctx.globalAlpha = 1.0;
    
    // Convert to blob and show next dialog
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    const url = URL.createObjectURL(blob);
    
    // Store for download
    window.currentCanvasBlob = blob;
    window.currentCanvasUrl = url;
    
    // Show next dialog with canvas preview
    await showCanvasShareDialog();
    } catch (error) {

        await showAlert('Failed to generate canvas', 'Please try again later');
    }
}

// Helper to darken color
function darkenColor(color, percent) {
    // Handle hex colors
    if (!color || typeof color !== 'string') return '#000000';
    
    // If not hex, return darker fallback
    if (!color.startsWith('#')) return color;
    
    const num = parseInt(color.replace('#', ''), 16);
    if (isNaN(num)) return '#000000';
    
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) - amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) - amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) - amt));
    
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Show canvas sharing dialog with Web Share API
async function showCanvasShareDialog() {
    const shareLink = document.getElementById('shareLink').value;
    
    // First show explanation dialog (WITHOUT copying yet)
    const proceed = await showConfirm(
        'When you share the canvas, the link will be copied to your clipboard.\n\nYou can then paste it in your share message.',
        'How to Share',
        'Continue',
        'Cancel'
    );
    
    if (!proceed) {
        URL.revokeObjectURL(window.currentCanvasUrl);
        return;
    }
    
    // NOW copy link to clipboard after user confirms
    try {
        await navigator.clipboard.writeText(shareLink);
    } catch (err) {
        // Fallback
        const input = document.getElementById('shareLink');
        input.select();
        document.execCommand('copy');
    }
    
    // Check if Web Share API is available
    if (navigator.share && navigator.canShare && window.currentCanvasBlob) {
        try {
            const file = new File([window.currentCanvasBlob], `duvv-${currentRant.id}.jpg`, { type: 'image/jpeg' });
            
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Duvv Question'
                });
                
                URL.revokeObjectURL(window.currentCanvasUrl);
                await showAlert('Shared successfully!', 'Thanks for sharing');
                return;
            }
        } catch (err) {
            if (err.name !== 'AbortError') {

            } else {
                // User cancelled, just return
                URL.revokeObjectURL(window.currentCanvasUrl);
                return;
            }
        }
    }
    
    // Fallback: show download option
    const result = await showConfirm(
        'Download the canvas to share it manually:',
        'Canvas Ready',
        'Download Canvas',
        'Done'
    );
    
    if (result) {
        // Download canvas
        const a = document.createElement('a');
        a.href = window.currentCanvasUrl;
        a.download = `duvv-question-${currentRant.id}.jpg`;
        a.click();
        URL.revokeObjectURL(window.currentCanvasUrl);
        
        await showAlert('Canvas downloaded!', 'Share it anywhere');
    } else {
        URL.revokeObjectURL(window.currentCanvasUrl);
    }
}

// Initialize
updateStats();
renderRants();

// Add after premium logic and before renderRants()
let themeChangeModal = null;
let themeChangeRantId = null;

// Helper to open theme change modal
function openThemeChangeModal(rantId) {
    // Only allow theme change if not deactivated
    
}

// Make theme change modal async to safely await rants
async function openThemeChangeModal(rantId) {
    const rants = await getRants();
    if (!Array.isArray(rants)) return;
    const rant = rants.find(r => r.id === rantId);
    if (rant && rant.deactivated) return;
    themeChangeRantId = rantId;
    // Create modal if not exists
    if (!themeChangeModal) {
        themeChangeModal = document.createElement('div');
        themeChangeModal.className = 'modal';
        themeChangeModal.innerHTML = `
            <div class="modal-backdrop" id="themeChangeBackdrop"></div>
            <div class="modal-content modal-large">
                <button class="modal-close" id="closeThemeChangeModal">✕</button>
                <h2>Change Duvv Theme</h2>
                <div class="theme-categories" id="themeChangeCategories">
                    <!-- Theme packs will be injected here -->
                </div>
                <button class="btn btn-gradient" id="saveThemeChangeBtn" disabled>Save Theme</button>
            </div>
        `;
        document.body.appendChild(themeChangeModal);
    }
    
    // Always attach close listeners when opening
    attachModalCloseListeners(themeChangeModal, 'closeThemeChangeModal', 'themeChangeBackdrop', closeThemeChangeModal);
    
    // Populate theme packs (reuse from create modal)
    const themeList = [
        { name: 'cyber-pink', text: '#ffffff', bg: '#ff006e', outline: '#7209b7', label: 'Cyber pink 💗' },
        { name: 'ocean-breeze', text: '#003554', bg: '#caf0f8', outline: '#00b4d8', label: 'Ocean breeze 🌊' },
        { name: 'soft-peach', text: '#4a2c2a', bg: '#ffdac1', outline: '#ff9aa2', label: 'Soft peach 🍑' },
        { name: 'mint-tea', text: '#1b4332', bg: '#d8f3dc', outline: '#74c69d', label: 'Mint tea 🍵' },
        { name: 'lilac-haze', text: '#240046', bg: '#e0c3fc', outline: '#9d4edd', label: 'Lilac haze 💜' },
        { name: 'dark-mode', text: '#ff006e', bg: '#0a0a0f', outline: '#ff006e', label: 'Dark mode 🌑' },
        // Add premium themes if needed
        { name: 'batman', text: '#d4d4d4', bg: '#000000', outline: '#ffe600', label: 'Batman 🦇' },
        { name: 'vampire', text: '#ff0000', bg: '#1a0000', outline: '#800000', label: 'Vampire 🧛' },
        { name: 'matrix', text: '#00ff00', bg: '#000000', outline: '#003300', label: 'Matrix 💻' },
        { name: 'midnight-gold', text: '#ffd700', bg: '#111111', outline: '#ffd700', label: 'Midnight Gold 👑' }
    ];
    const categories = themeChangeModal.querySelector('#themeChangeCategories');
    categories.innerHTML = themeList.map(theme => `
        <div class="theme-pack" data-theme="${theme.name}" data-text="${theme.text}" data-bg="${theme.bg}" data-outline="${theme.outline}">
            <div class="theme-pack-name">${theme.label}</div>
            <div class="theme-colors">
                <div class="color-dot" style="background: ${theme.text}; border-color: ${theme.outline};"></div>
                <div class="color-dot" style="background: ${theme.bg}; border-color: ${theme.outline};"></div>
                <div class="color-dot" style="background: ${theme.outline}; border-color: ${theme.outline};"></div>
            </div>
            <div class="theme-preview-text" style="background: ${theme.bg}; border: 2px solid ${theme.outline}; color: ${theme.text};">
                ${theme.label}
            </div>
        </div>
    `).join('');

    // Select logic
    let selectedTheme = null;
    categories.querySelectorAll('.theme-pack').forEach(pack => {
        pack.onclick = () => {
            categories.querySelectorAll('.theme-pack').forEach(p => p.classList.remove('selected'));
            pack.classList.add('selected');
            selectedTheme = {
                name: pack.getAttribute('data-theme'),
                text: pack.getAttribute('data-text'),
                bg: pack.getAttribute('data-bg'),
                outline: pack.getAttribute('data-outline')
            };
            themeChangeModal.querySelector('#saveThemeChangeBtn').disabled = false;
        };
    });

    // Save logic
    themeChangeModal.querySelector('#saveThemeChangeBtn').onclick = async () => {
        if (!selectedTheme) return;
        const rants = await getRants();
        if (!Array.isArray(rants)) return;
        const rant = rants.find(r => r.id === themeChangeRantId);
        if (rant) {
            rant.theme = selectedTheme;
            
            // Update via API if enabled
            if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
                try {
                    const token = getApiToken();
                    const response = await fetch(`${API_CONFIG.API_BASE_URL}/duvvs/${rant.id}/theme`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ theme: selectedTheme })
                    });
                    if (!response.ok) {

                    }
                } catch (error) {
                    // Theme update failed
                }
            }
            
            closeThemeChangeModal();
            renderRants();
        }
    };

    themeChangeModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function closeThemeChangeModal() {
    if (themeChangeModal) {
        themeChangeModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }
}

async function deactivateRant(rantId) {
    let rants = await getRants();
    if (!Array.isArray(rants)) return;
    
    // Just mark as deactivated (soft delete) - don't remove from array
    rants = rants.map(r => r.id === rantId ? { ...r, deactivated: true } : r);
    
    // Update via API if enabled (still calls DELETE but backend does soft delete)
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        try {
            const token = getApiToken();
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/duvvs/${rantId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {

            }
        } catch (error) {

        }
    }
    
    // No localStorage persistence
    
    // Invalidate cache and force refresh
    cachedDuvvs = null;
    await renderRants();
}

// Ensure this event listener exists:
if (createRantBtn) {
    createRantBtn.addEventListener('click', () => {
        createRantModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        resetCreateRantModal();
    });
}

// Attach close function to all modal close buttons after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    // Map of button IDs to their close functions
    const modalCloseMap = [
        { id: 'closeModal', fn: () => { createRantModal.classList.add('hidden'); document.body.classList.remove('modal-open'); } },
        { id: 'closeDetailModal', fn: () => { rantDetailModal.classList.add('hidden'); document.body.classList.remove('modal-open'); } },
        { id: 'closeResponseModal', fn: () => { responseDetailModal.classList.add('hidden'); document.body.classList.remove('modal-open'); } },
        { id: 'closePremiumModal', fn: closePremium },
        { id: 'closePremiumActiveModal', fn: closePremiumActive },
        { id: 'closeHintsModal', fn: () => { hintsModal.classList.add('hidden'); document.body.classList.remove('modal-open'); } },
        { id: 'closeThemeChangeModal', fn: closeThemeChangeModal }
    ];
    modalCloseMap.forEach(({ id, fn }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = fn;
        }
    });
    
    // Initialize keep-alive keeper only if URL parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('activate_keeper') === 'true') {
        initializeKeeper();
    }
});

// ========================================================================
// KEEP-ALIVE KEEPER SYSTEM
// ========================================================================

let keeperTimerId = null;
const clientId = 'client_' + Math.random().toString(36).substring(2, 15);

async function initializeKeeper() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/api/health?keeper=true&clientId=${clientId}`);
        const data = await response.json();
        
        if (data.isKeeper && data.nextPingIn) {
            startKeeperTimer(data.nextPingIn);
        }
    } catch (error) {
        // Silently fail if health check unavailable
    }
}

function startKeeperTimer(nextPingIn) {
    // Clear any existing timer
    if (keeperTimerId) {
        clearTimeout(keeperTimerId);
    }
    
    // Schedule next ping
    keeperTimerId = setTimeout(async () => {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/health?keeper=true&clientId=${clientId}`);
            const data = await response.json();
            
            if (data.isKeeper && data.nextPingIn) {
                startKeeperTimer(data.nextPingIn);
            }
        } catch (error) {
            // Retry after 5 minutes if failed
            startKeeperTimer(5 * 60 * 1000);
        }
    }, nextPingIn);
}
