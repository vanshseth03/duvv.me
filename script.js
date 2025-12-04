// Cookie Management
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}

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

// Custom Dialog System
function showDialog(options) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customDialogOverlay');
        const icon = document.getElementById('dialogIcon');
        const title = document.getElementById('dialogTitle');
        const message = document.getElementById('dialogMessage');
        const buttons = document.getElementById('dialogButtons');

        icon.textContent = options.icon || '💬';
        title.textContent = options.title || '';
        message.textContent = options.message || '';
        buttons.innerHTML = '';

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

function showConfirm(message, title = 'Are you sure? 🤔', icon = '❓', danger = false) {
    return showDialog({ message, title, icon, type: 'confirm', danger });
}

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

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

// Initialize Theme
const savedTheme = getCookie('theme');
if (savedTheme === 'bright') {
    setTheme(false);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = !document.body.classList.contains('bright-mode');
        setTheme(!isDark);
    });
}

// Auth Flow Management
const welcomeScreen = document.getElementById('welcomeScreen');
const createAccountScreen = document.getElementById('createAccountScreen');
const recoverScreen = document.getElementById('recoverScreen');
const codeDisplayScreen = document.getElementById('codeDisplayScreen');

// Buttons
const createNewBtn = document.getElementById('createNewBtn');
const recoverBtn = document.getElementById('recoverBtn');
const backFromCreate = document.getElementById('backFromCreate');
const backFromRecover = document.getElementById('backFromRecover');
const createForm = document.getElementById('createForm');
const recoverForm = document.getElementById('recoverForm');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const continueToApp = document.getElementById('continueToApp');

// Check if already logged in (only on index page)
const existingUser = getCookie('duvvUsername');
if (welcomeScreen && existingUser && getCookie('duvvRecoveryCode')) {
    window.location.href = '/' + existingUser;
}

// Navigation
if (createNewBtn) {
    createNewBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        createAccountScreen.classList.remove('hidden');
    });
}

if (recoverBtn) {
    recoverBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        recoverScreen.classList.remove('hidden');
    });
}

if (backFromCreate) {
    backFromCreate.addEventListener('click', () => {
        createAccountScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });
}

if (backFromRecover) {
    backFromRecover.addEventListener('click', () => {
        recoverScreen.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
    });
}

// Create Account Logic
if (createForm) {
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('usernameInput').value.trim().toLowerCase();
        const submitBtn = createForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // Simple validation
        if (username.length < 3) {
            await showAlert('Username must be at least 3 characters bestie! 📏', 'Too short! 😅', '⚠️');
            return;
        }
        
        if (!/^[a-z0-9_]+$/.test(username)) {
            await showAlert('Username can only contain lowercase letters, numbers, and underscores! 🔤', 'Invalid format! 😬', '⚠️');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Creating... ⏳</span>';
        
        // Check if using API mode
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
            try {
                // Register via API
                const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show recovery code from backend
                    document.getElementById('recoveryCode').textContent = data.recoveryCode;
                    
                    // Save token
                    setCookie(API_CONFIG.TOKEN_KEY, data.token);
                    setCookie('duvvUsername', username);
                    
                    // Save temporarily for display
                    sessionStorage.setItem('tempUsername', username);
                    sessionStorage.setItem('tempCode', data.recoveryCode);
                    sessionStorage.setItem('tempToken', data.token);
                    
                    createAccountScreen.classList.add('hidden');
                    codeDisplayScreen.classList.remove('hidden');
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    await showAlert(data.error || 'Registration failed. Username may already exist. 😔', 'Oops! 😬', '❌');
                }
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                await showAlert('Could not connect to server. Please check if backend is running. 🔌', 'Connection error! 😵', '❌');
            }
        } else {
            // LocalStorage mode (fallback)
            // Generate code locally
            const code = generateRecoveryCode();
            document.getElementById('recoveryCode').textContent = code;
            
            // Save temporary (will save to cookie on continue)
            sessionStorage.setItem('tempUsername', username);
            sessionStorage.setItem('tempCode', code);
            
            createAccountScreen.classList.add('hidden');
            codeDisplayScreen.classList.remove('hidden');
        }
    });
}

// Copy Code
if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
        const code = document.getElementById('recoveryCode').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = copyCodeBtn.textContent;
            copyCodeBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                copyCodeBtn.textContent = originalText;
            }, 2000);
        });
    });
}

// Continue to App
if (continueToApp) {
    continueToApp.addEventListener('click', () => {
        const username = sessionStorage.getItem('tempUsername');
        const code = sessionStorage.getItem('tempCode');
        const token = sessionStorage.getItem('tempToken');
        
        if (username && code) {
            setCookie('duvvUsername', username);
            setCookie('duvvRecoveryCode', code);
            if (token) {
                setCookie(API_CONFIG.TOKEN_KEY, token);
            }
            // Mark as new user to show tutorial
            sessionStorage.setItem('showWelcomeTutorial', 'true');
            window.location.href = '/' + username;
        }
    });
}

// Recover Account Logic
if (recoverForm) {
    recoverForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('recoveryInput').value.trim().toLowerCase();
        const submitBtn = recoverForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        if (code.length < 8) {
            await showAlert('Invalid recovery code! Make sure you entered it correctly. 🔑', 'Hmm... 🤔', '⚠️');
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Logging in... ⏳</span>';
        
        // Check if using API mode
        if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
            try {
                // Login via API
                const response = await fetch(`${API_CONFIG.API_BASE_URL}/auth/recover`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ recoveryCode: code })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Save token and username
                    setCookie(API_CONFIG.TOKEN_KEY, data.token);
                    setCookie('duvvUsername', data.user.username);
                    setCookie('duvvRecoveryCode', code);
                    
                    window.location.href = '/' + data.user.username;
                } else {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    await showAlert(data.error || 'Invalid recovery code. Double check it bestie! 🔍', 'Can\'t recover! 😔', '❌');
                }
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                await showAlert('Could not connect to server. Please check if backend is running. 🔌', 'Connection error! 😵', '❌');
            }
        } else {
            // LocalStorage mode (fallback)
            const recoveredUsername = prompt("Enter your username to confirm recovery:");
            if (recoveredUsername) {
                setCookie('duvvUsername', recoveredUsername);
                setCookie('duvvRecoveryCode', code);
                window.location.href = '/' + recoveredUsername;
            }
        }
    });
}

// Helper function for localStorage fallback
function generateRecoveryCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        if (i > 0 && i % 4 === 0) code += '-';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
