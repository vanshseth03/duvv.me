// ==================== THEME MANAGEMENT ====================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

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

function showAlert(message, title = 'Hey! 👋', icon = '💬') {
    return showDialog({ message, title, icon, type: 'alert' });
}

function showConfirm(message, title = 'Are you sure? 🤔', icon = '❓', danger = false) {
    return showDialog({ message, title, icon, type: 'confirm', danger });
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

// ==================== LOAD RANT ====================
// Parse URL Path OR Query Params
const pathParts = window.location.pathname.split('/').filter(p => p);
const urlParams = new URLSearchParams(window.location.search);

let posterUsername = urlParams.get('user');
let rantId = urlParams.get('rant');

// Fallback to path if query params are missing
if (!posterUsername && pathParts.length >= 2) {
    posterUsername = pathParts[0];
    rantId = pathParts[1];
}

let currentRant = null;

async function loadRant() {
    // Strict check: If URL is malformed or missing data, go home
    if (!rantId || !posterUsername) {
        console.error("Missing rant ID or username");
        return;
    }
    
    // Check if using API mode
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        try {
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/duvvs/${rantId}`);
            if (response.ok) {
                const data = await response.json();
                currentRant = {
                    id: data.duvv.duvvId,
                    question: data.duvv.question,
                    theme: data.duvv.theme,
                    responseTypes: data.duvv.responseTypes,
                    isPremium: data.duvv.isPremium
                };
            } else {
                console.error("Duvv not found on server");
                await showAlert(
                    'This duvv might have been deleted or deactivated.',
                    'Duvv not found! 🔍',
                    '❌'
                );
                return;
            }
        } catch (error) {
            console.error("Error loading duvv from API:", error);
            await showAlert(
                'Could not connect to server. Please try again later.',
                'Connection error! 😵',
                '🔌'
            );
            return;
        }
    } else {
        // LocalStorage mode
        const rants = JSON.parse(localStorage.getItem(`duvvs_${posterUsername}`)) || [];
        currentRant = rants.find(r => r.id === rantId);
        
        // Strict check: If rant doesn't exist in storage, go home
        if (!currentRant) {
            window.location.href = '/';
            return;
        }
    }
    
    // Check for Premium Status and Unlock Features
    if (currentRant.isPremium) {
        document.querySelectorAll('.premium-color').forEach(el => {
            el.classList.remove('hidden');
        });
    }

    const questionCard = document.getElementById('questionCard');
    if (currentRant.theme) {
        questionCard.style.background = currentRant.theme.bg;
        questionCard.style.color = currentRant.theme.text;
        questionCard.style.borderColor = currentRant.theme.outline;
    }
    
    document.getElementById('questionText').textContent = currentRant.question;
    
    const typesText = currentRant.responseTypes.map(type => {
        if (type === 'text') return '✍️ Text';
        if (type === 'audio') return '🎙️ Audio';
        if (type === 'drawing') return '🎨 Drawing';
    }).join(' • ');
    
    document.getElementById('responseTypesAllowed').textContent = `You can respond with: ${typesText}`;
    
    if (!currentRant.responseTypes.includes('text')) {
        document.getElementById('textTab').style.opacity = '0.5';
        document.getElementById('textTab').style.pointerEvents = 'none';
    }
    if (!currentRant.responseTypes.includes('audio')) {
        document.getElementById('audioTab').style.opacity = '0.5';
        document.getElementById('audioTab').style.pointerEvents = 'none';
    }
    if (!currentRant.responseTypes.includes('drawing')) {
        document.getElementById('drawingTab').style.opacity = '0.5';
        document.getElementById('drawingTab').style.pointerEvents = 'none';
    }
}

// ==================== TAB SWITCHING ====================
const tabs = document.querySelectorAll('.type-tab');
const sections = document.querySelectorAll('.response-section');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const type = tab.getAttribute('data-type');
        
        tabs.forEach(t => t.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${type}Section`).classList.add('active');
    });
});

// ==================== TEXT RESPONSE ====================
const textInput = document.getElementById('textInput');
const textCharCount = document.getElementById('textCharCount');
const submitTextBtn = document.getElementById('submitTextBtn');

textInput.addEventListener('input', () => {
    textCharCount.textContent = textInput.value.length;
});

submitTextBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    
    if (text.length < 10) {
        textInput.placeholder = '⚠️ Please write at least 10 characters!';
        textInput.style.borderColor = 'var(--sunset-orange)';
        setTimeout(() => {
            textInput.placeholder = 'Type your anonymous response here... 🤫';
            textInput.style.borderColor = '';
        }, 3000);
        return;
    }
    
    // Disable button and show loading
    submitTextBtn.disabled = true;
    submitTextBtn.textContent = 'Sending...';
    
    submitResponse('text', { text });
});

// ==================== AUDIO RESPONSE ====================
const recordBtn = document.getElementById('recordBtn');
const recordStatus = document.getElementById('recordStatus');
const recordTimer = document.getElementById('recordTimer');
const audioVisualizer = document.getElementById('audioVisualizer');
const audioPlayer = document.getElementById('audioPlayer');
const audioFilters = document.getElementById('audioFilters');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const audioTime = document.getElementById('audioTime');
const rerecordBtn = document.getElementById('rerecordBtn');
const submitAudioBtn = document.getElementById('submitAudioBtn');
const audioElement = document.getElementById('audioElement');
const micPermissionModal = document.getElementById('micPermissionModal');
const allowMicBtn = document.getElementById('allowMicBtn');
const denyMicBtn = document.getElementById('denyMicBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let isRecording = false;
let micPermissionGranted = false;
let micPermissionAsked = false;
let selectedFilter = 'none';
let audioBlob = null;
let originalAudioBlob = null; // Store unfiltered original
let mediaRecorder = null;
let audioChunks = [];
let recordingTimer = null;
let recordingSeconds = 0;
let audioContext = null;
let audioSource = null;

function checkAudioSupport() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        recordBtn.disabled = true;
        recordStatus.textContent = '⚠️ Audio requires HTTPS or localhost';
        recordStatus.style.color = 'var(--sunset-orange)';
        return false;
    }
    
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';
    
    if (!isSecure) {
        recordBtn.disabled = true;
        recordStatus.textContent = '⚠️ Replace IP with "localhost" in URL';
        recordStatus.style.color = 'var(--sunset-orange)';
        return false;
    }
    
    recordBtn.disabled = false;
    recordStatus.textContent = 'Tap to start recording';
    recordStatus.style.color = '';
    return true;
}

async function checkMicPermission() {
    try {
        const result = await navigator.permissions.query({ name: 'microphone' });
        
        if (result.state === 'granted') {
            micPermissionGranted = true;
            micPermissionAsked = true;
        } else if (result.state === 'denied') {
            micPermissionAsked = true;
        }
        
        result.addEventListener('change', () => {
            if (result.state === 'granted') {
                micPermissionGranted = true;
            } else if (result.state === 'denied') {
                micPermissionGranted = false;
            }
        });
    } catch (error) {
        // Permission API not supported
    }
}

function showMicPermissionModal() {
    micPermissionModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
}

function hideMicPermissionModal() {
    micPermissionModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            originalAudioBlob = audioBlob; // Save original for filter preview
            const audioUrl = URL.createObjectURL(audioBlob);
            audioElement.src = audioUrl;
            
            audioPlayer.classList.remove('hidden');
            audioFilters.classList.remove('hidden');
            submitAudioBtn.classList.remove('hidden');
        };
        
        mediaRecorder.start();
        isRecording = true;
        recordingSeconds = 0;
        
        recordBtn.classList.add('recording');
        recordStatus.textContent = 'Recording... (tap to stop)';
        audioVisualizer.classList.add('active');
        
        recordingTimer = setInterval(() => {
            recordingSeconds++;
            const minutes = Math.floor(recordingSeconds / 60);
            const seconds = recordingSeconds % 60;
            recordTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (recordingSeconds >= 30) {
                stopRecording();
            }
        }, 1000);
        
    } catch (error) {
        recordStatus.textContent = '⚠️ Could not start recording - check microphone';
        recordStatus.style.color = 'var(--sunset-orange)';
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        recordBtn.classList.remove('recording');
        recordStatus.textContent = 'Recording complete!';
        audioVisualizer.classList.remove('active');
        recordTimer.classList.remove('recording');
        
        clearInterval(recordingTimer);
    }
}

function audioBufferToWav(buffer) {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels = [];
    let offset = 0;
    let pos = 0;
    
    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    
    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
    
    setUint32(0x46464952);
    setUint32(length - 8);
    setUint32(0x45564157);
    setUint32(0x20746d66);
    setUint32(16);
    setUint16(1);
    setUint16(buffer.numberOfChannels);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * buffer.numberOfChannels);
    setUint16(buffer.numberOfChannels * 2);
    setUint16(16);
    setUint32(0x61746164);
    setUint32(length - pos - 4);
    
    for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }
    
    while (pos < length) {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
            const sample = Math.max(-1, Math.min(1, channels[i][offset]));
            view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            pos += 2;
        }
        offset++;
    }
    
    return arrayBuffer;
}

function applyAudioFilter(filter) {
    if (!originalAudioBlob) return;
    
    audioElement.pause();
    audioElement.currentTime = 0;
    
    if (filter === 'none') {
        audioElement.src = URL.createObjectURL(originalAudioBlob);
        return;
    }
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        audioContext.decodeAudioData(e.target.result, (buffer) => {
            const offlineCtx = new OfflineAudioContext(
                buffer.numberOfChannels,
                buffer.length,
                buffer.sampleRate
            );
            
            const source = offlineCtx.createBufferSource();
            source.buffer = buffer;

            // Helper builders
            const makeHighpass = (freq, q = 0.7) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = 'highpass';
                f.frequency.value = freq;
                f.Q.value = q;
                return f;
            };
            const makeLowpass = (freq, q = 0.7) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = 'lowpass';
                f.frequency.value = freq;
                f.Q.value = q;
                return f;
            };
            const makeBandpass = (freq, q = 1.0) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = 'bandpass';
                f.frequency.value = freq;
                f.Q.value = q;
                return f;
            };
            const makeNotch = (freq, q = 1.0) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = 'notch';
                f.frequency.value = freq;
                f.Q.value = q;
                return f;
            };
            const makePeaking = (freq, q, gain) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = 'peaking';
                f.frequency.value = freq;
                f.Q.value = q;
                f.gain.value = gain;
                return f;
            };
            const makeShelf = (type, freq, gain) => {
                const f = offlineCtx.createBiquadFilter();
                f.type = type;
                f.frequency.value = freq;
                f.gain.value = gain;
                return f;
            };
            const makeGain = (g) => {
                const node = offlineCtx.createGain();
                node.gain.value = g;
                return node;
            };

            switch (filter) {
                // 👽 ALIEN
                case 'alien': {
                    source.playbackRate.value = 1.7;
                    const hp = makeHighpass(400, 0.8);
                    const gain = makeGain(1.2);
                    source.connect(hp);
                    hp.connect(gain);
                    gain.connect(offlineCtx.destination);
                    break;
                }

                // 🐿️ CHIPMUNK
                case 'chipmunk': {
                    source.playbackRate.value = 2.25;
                    const hs = makeShelf('highshelf', 2500, 5);
                    source.connect(hs);
                    hs.connect(offlineCtx.destination);
                    break;
                }

                // 🔥 Deep Mask
                case 'deepmask': {
                    source.playbackRate.value = 0.8;
                    const lp = makeLowpass(600, 1.0);
                    source.connect(lp);
                    lp.connect(offlineCtx.destination);
                    break;
                }

                // 🌫️ Ghost Drift
                case 'ghostdrift': {
                    source.playbackRate.value = 0.9;
                    const delay = offlineCtx.createDelay();
                    delay.delayTime.value = 0.1;
                    const feedback = makeGain(0.4);
                    source.connect(delay);
                    delay.connect(feedback);
                    feedback.connect(delay);
                    delay.connect(offlineCtx.destination);
                    source.connect(offlineCtx.destination);
                    break;
                }

                // 🕊️ Dove Chirp
                case 'dove': {
                    source.playbackRate.value = 1.4;
                    const hp = makeHighpass(300, 0.7);
                    source.connect(hp);
                    hp.connect(offlineCtx.destination);
                    break;
                }

                // 🐱 MEOW
                case 'meow': {
                    source.playbackRate.value = 1.8;
                    const bp = makeBandpass(1000, 1.0);
                    source.connect(bp);
                    bp.connect(offlineCtx.destination);
                    break;
                }

                // 🤡 CLOWN (ENHANCED)
                case 'clown': {
                    // Pitch shift up for cartoonish effect
                    source.playbackRate.value = 1.6;
                    
                    // Bandpass filter for nasal/honking tone
                    const bp = makeBandpass(1400, 2.5);
                    
                    // High shelf boost for brightness
                    const hs = makeShelf('highshelf', 2200, 6);
                    
                    // Peaking for nasal emphasis
                    const peak = makePeaking(1800, 3.0, 8);
                    
                    // Master gain
                    const masterGain = makeGain(1.4);
                    
                    // Chain everything
                    source.connect(bp);
                    bp.connect(peak);
                    peak.connect(hs);
                    hs.connect(masterGain);
                    masterGain.connect(offlineCtx.destination);
                    break;
                }

                default: {
                    source.connect(offlineCtx.destination);
                    break;
                }
            }

            source.start();
            
            offlineCtx.startRendering().then((renderedBuffer) => {
                // Trim buffer if playback rate > 1 (fast-forward filters)
                let finalBuffer = renderedBuffer;
                if (source.playbackRate.value > 1) {
                    const playbackRate = source.playbackRate.value;
                    const originalDuration = buffer.duration;
                    const newDuration = originalDuration / playbackRate;
                    const targetLength = Math.floor(newDuration * renderedBuffer.sampleRate);
                    
                    // Create trimmed buffer
                    const trimmedBuffer = offlineCtx.createBuffer(
                        renderedBuffer.numberOfChannels,
                        Math.min(targetLength, renderedBuffer.length),
                        renderedBuffer.sampleRate
                    );
                    
                    for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
                        const channelData = renderedBuffer.getChannelData(ch);
                        trimmedBuffer.copyToChannel(channelData.subarray(0, trimmedBuffer.length), ch);
                    }
                    finalBuffer = trimmedBuffer;
                }
                
                const wavBuffer = audioBufferToWav(finalBuffer);
                const filteredBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                // Only update preview, don't change audioBlob yet
                audioElement.src = URL.createObjectURL(filteredBlob);
            });
        });
    };
    reader.readAsArrayBuffer(originalAudioBlob);
}

// Apply filter permanently for submission
function applyFilterForSubmission(filter) {
    return new Promise((resolve) => {
        if (!originalAudioBlob || filter === 'none') {
            audioBlob = originalAudioBlob;
            resolve();
            return;
        }
        
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            audioContext.decodeAudioData(e.target.result, (buffer) => {
                const offlineCtx = new OfflineAudioContext(
                    buffer.numberOfChannels,
                    buffer.length,
                    buffer.sampleRate
                );
                
                const source = offlineCtx.createBufferSource();
                source.buffer = buffer;
                
                // Apply the same filter logic as preview
                const makeHighpass = (freq, q = 0.7) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'highpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makeLowpass = (freq, q = 0.7) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'lowpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makeBandpass = (freq, q = 1.0) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'bandpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makePeaking = (freq, q, gain) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'peaking';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    f.gain.value = gain;
                    return f;
                };
                const makeShelf = (type, freq, gain) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = type;
                    f.frequency.value = freq;
                    f.gain.value = gain;
                    return f;
                };
                const makeGain = (g) => {
                    const node = offlineCtx.createGain();
                    node.gain.value = g;
                    return node;
                };
                
                switch (filter) {
                    case 'alien': {
                        source.playbackRate.value = 1.7;
                        const hp = makeHighpass(400, 0.8);
                        const gain = makeGain(1.2);
                        source.connect(hp);
                        hp.connect(gain);
                        gain.connect(offlineCtx.destination);
                        break;
                    }
                    case 'chipmunk': {
                        source.playbackRate.value = 2.25;
                        const hs = makeShelf('highshelf', 2500, 5);
                        source.connect(hs);
                        hs.connect(offlineCtx.destination);
                        break;
                    }
                    case 'deepmask': {
                        source.playbackRate.value = 0.8;
                        const lp = makeLowpass(600, 1.0);
                        source.connect(lp);
                        lp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'ghostdrift': {
                        source.playbackRate.value = 0.9;
                        const delay = offlineCtx.createDelay();
                        delay.delayTime.value = 0.1;
                        const feedback = makeGain(0.4);
                        source.connect(delay);
                        delay.connect(feedback);
                        feedback.connect(delay);
                        delay.connect(offlineCtx.destination);
                        source.connect(offlineCtx.destination);
                        break;
                    }
                    case 'dove': {
                        source.playbackRate.value = 1.4;
                        const hp = makeHighpass(300, 0.7);
                        source.connect(hp);
                        hp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'meow': {
                        source.playbackRate.value = 1.8;
                        const bp = makeBandpass(1000, 1.0);
                        source.connect(bp);
                        bp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'clown': {
                        source.playbackRate.value = 1.5;
                        const lfo = offlineCtx.createOscillator();
                        lfo.type = 'sine';
                        lfo.frequency.value = 7;
                        const lfoGain = offlineCtx.createGain();
                        lfoGain.gain.value = 150;
                        lfo.connect(lfoGain);
                        const bp = makeBandpass(1200, 2.0);
                        lfoGain.connect(bp.frequency);
                        const distortion = offlineCtx.createWaveShaper();
                        distortion.curve = makeDistortionCurve(15);
                        distortion.oversample = '4x';
                        const hs = makeShelf('highshelf', 2000, 4);
                        const masterGain = makeGain(1.3);
                        source.connect(bp);
                        bp.connect(distortion);
                        distortion.connect(hs);
                        hs.connect(masterGain);
                        masterGain.connect(offlineCtx.destination);
                        lfo.start();
                        break;
                    }
                    default: {
                        source.connect(offlineCtx.destination);
                        break;
                    }
                }
                
                source.start();
                
                offlineCtx.startRendering().then((renderedBuffer) => {
                    const wavBuffer = audioBufferToWav(renderedBuffer);
                    audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                    resolve();
                });
            });
        };
        reader.readAsArrayBuffer(originalAudioBlob);
    });
}

// Apply filter permanently for submission
function applyFilterForSubmission(filter) {
    return new Promise((resolve) => {
        if (!originalAudioBlob || filter === 'none') {
            audioBlob = originalAudioBlob;
            resolve();
            return;
        }
        
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            audioContext.decodeAudioData(e.target.result, (buffer) => {
                const offlineCtx = new OfflineAudioContext(
                    buffer.numberOfChannels,
                    buffer.length,
                    buffer.sampleRate
                );
                
                const source = offlineCtx.createBufferSource();
                source.buffer = buffer;
                
                // Apply the same filter logic as preview
                const makeHighpass = (freq, q = 0.7) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'highpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makeLowpass = (freq, q = 0.7) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'lowpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makeBandpass = (freq, q = 1.0) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'bandpass';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    return f;
                };
                const makePeaking = (freq, q, gain) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = 'peaking';
                    f.frequency.value = freq;
                    f.Q.value = q;
                    f.gain.value = gain;
                    return f;
                };
                const makeShelf = (type, freq, gain) => {
                    const f = offlineCtx.createBiquadFilter();
                    f.type = type;
                    f.frequency.value = freq;
                    f.gain.value = gain;
                    return f;
                };
                const makeGain = (g) => {
                    const node = offlineCtx.createGain();
                    node.gain.value = g;
                    return node;
                };
                
                switch (filter) {
                    case 'alien': {
                        source.playbackRate.value = 1.7;
                        const hp = makeHighpass(400, 0.8);
                        const gain = makeGain(1.2);
                        source.connect(hp);
                        hp.connect(gain);
                        gain.connect(offlineCtx.destination);
                        break;
                    }
                    case 'chipmunk': {
                        source.playbackRate.value = 2.25;
                        const hs = makeShelf('highshelf', 2500, 5);
                        source.connect(hs);
                        hs.connect(offlineCtx.destination);
                        break;
                    }
                    case 'deepmask': {
                        source.playbackRate.value = 0.8;
                        const lp = makeLowpass(600, 1.0);
                        source.connect(lp);
                        lp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'ghostdrift': {
                        source.playbackRate.value = 0.9;
                        const delay = offlineCtx.createDelay();
                        delay.delayTime.value = 0.1;
                        const feedback = makeGain(0.4);
                        source.connect(delay);
                        delay.connect(feedback);
                        feedback.connect(delay);
                        delay.connect(offlineCtx.destination);
                        source.connect(offlineCtx.destination);
                        break;
                    }
                    case 'dove': {
                        source.playbackRate.value = 1.4;
                        const hp = makeHighpass(300, 0.7);
                        source.connect(hp);
                        hp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'meow': {
                        source.playbackRate.value = 1.8;
                        const bp = makeBandpass(1000, 1.0);
                        source.connect(bp);
                        bp.connect(offlineCtx.destination);
                        break;
                    }
                    case 'clown': {
                        source.playbackRate.value = 1.6;
                        const bp = makeBandpass(1400, 2.5);
                        const hs = makeShelf('highshelf', 2200, 6);
                        const peak = makePeaking(1800, 3.0, 8);
                        const masterGain = makeGain(1.4);
                        source.connect(bp);
                        bp.connect(peak);
                        peak.connect(hs);
                        hs.connect(masterGain);
                        masterGain.connect(offlineCtx.destination);
                        break;
                    }
                    default: {
                        source.connect(offlineCtx.destination);
                        break;
                    }
                }
                
                source.start();
                
                offlineCtx.startRendering().then((renderedBuffer) => {
                    // Trim buffer if playback rate > 1 (fast-forward filters)
                    let finalBuffer = renderedBuffer;
                    if (source.playbackRate.value > 1) {
                        const playbackRate = source.playbackRate.value;
                        const originalDuration = buffer.duration;
                        const newDuration = originalDuration / playbackRate;
                        const targetLength = Math.floor(newDuration * renderedBuffer.sampleRate);
                        
                        // Create trimmed buffer
                        const trimmedBuffer = offlineCtx.createBuffer(
                            renderedBuffer.numberOfChannels,
                            Math.min(targetLength, renderedBuffer.length),
                            renderedBuffer.sampleRate
                        );
                        
                        for (let ch = 0; ch < renderedBuffer.numberOfChannels; ch++) {
                            const channelData = renderedBuffer.getChannelData(ch);
                            trimmedBuffer.copyToChannel(channelData.subarray(0, trimmedBuffer.length), ch);
                        }
                        finalBuffer = trimmedBuffer;
                    }
                    
                    const wavBuffer = audioBufferToWav(finalBuffer);
                    audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
                    resolve();
                });
            });
        };
        reader.readAsArrayBuffer(originalAudioBlob);
    });
}

// Create smoother distortion curve for voice effects
function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

// Audio event listeners
recordBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return;
    }
    
    if (!isRecording) {
        // Check if we've asked for permission before (stored in localStorage)
        const hasAskedBefore = localStorage.getItem('duvv_mic_asked') === 'true';
        
        if (!hasAskedBefore && !micPermissionAsked) {
            showMicPermissionModal();
        } else if (hasAskedBefore) {
            // If asked before, assume granted and try recording
            micPermissionGranted = true;
            micPermissionAsked = true;
            await startRecording();
        } else if (!micPermissionGranted) {
            recordStatus.textContent = '⚠️ Microphone access denied';
            recordStatus.style.color = 'var(--sunset-orange)';
        } else {
            await startRecording();
        }
    } else {
        stopRecording();
    }
});

allowMicBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        
        stream.getTracks().forEach(track => track.stop());
        
        micPermissionGranted = true;
        micPermissionAsked = true;
        localStorage.setItem('duvv_mic_asked', 'true'); // Remember permission was asked
        hideMicPermissionModal();
        
        setTimeout(async () => {
            await startRecording();
        }, 300);
        
    } catch (error) {
        micPermissionGranted = false;
        micPermissionAsked = true;
        localStorage.setItem('duvv_mic_asked', 'true'); // Remember permission was asked
        hideMicPermissionModal();
        
        recordStatus.textContent = '⚠️ Microphone access denied - check browser settings';
        recordStatus.style.color = 'var(--sunset-orange)';
    }
});

denyMicBtn.addEventListener('click', () => {
    micPermissionAsked = true;
    localStorage.setItem('duvv_mic_asked', 'true'); // Remember permission was asked
    hideMicPermissionModal();
    recordStatus.textContent = 'Microphone access needed to record';
});

playBtn.addEventListener('click', () => {
    if (audioElement.paused) {
        audioElement.play();
        playBtn.textContent = '⏸';
    } else {
        audioElement.pause();
        playBtn.textContent = '▶';
    }
});

audioElement.addEventListener('timeupdate', () => {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.style.width = `${progress}%`;
    
    const minutes = Math.floor(audioElement.currentTime / 60);
    const seconds = Math.floor(audioElement.currentTime % 60);
    audioTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

audioElement.addEventListener('ended', () => {
    playBtn.textContent = '▶';
    progressBar.style.width = '0%';
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFilter = btn.getAttribute('data-filter');
        applyAudioFilter(selectedFilter);
    });
});

rerecordBtn.addEventListener('click', () => {
    audioElement.pause();
    audioElement.src = '';
    audioBlob = null;
    recordingSeconds = 0;
    recordTimer.textContent = '0:00';
    recordStatus.textContent = 'Tap to start recording';
    audioPlayer.classList.add('hidden');
    audioFilters.classList.add('hidden');
    submitAudioBtn.classList.add('hidden');
    playBtn.textContent = '▶';
    progressBar.style.width = '0%';
    selectedFilter = 'none';
    filterButtons.forEach(b => b.classList.remove('active'));
    filterButtons[0].classList.add('active');
    
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
});

submitAudioBtn.addEventListener('click', async () => {
    if (!originalAudioBlob) {
        return;
    }
    
    // Apply selected filter permanently before submission
    if (selectedFilter !== 'none') {
        await applyFilterForSubmission(selectedFilter);
    } else {
        audioBlob = originalAudioBlob;
    }
    
    // Disable button and show loading
    submitAudioBtn.disabled = true;
    submitAudioBtn.textContent = 'Sending...';
    
    submitResponse('audio', {
        audioBlob: audioBlob,
        duration: `0:${recordingSeconds.toString().padStart(2, '0')}`,
        filter: selectedFilter
    });
});

// ==================== DRAWING RESPONSE ====================
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const brushSize = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');
const colorButtons = document.querySelectorAll('.color-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const eraserBtn = document.getElementById('eraserBtn');
const undoBtn = document.getElementById('undoBtn');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const submitDrawingBtn = document.getElementById('submitDrawingBtn');
const bgColorPalette = document.getElementById('bgColorPalette');

let isDrawing = false;
let currentColor = '#000000';
let currentBgColor = '#ffffff';
let currentBrushSize = 5;
let currentMode = 'normal';
let isEraser = false;
let drawingHistory = [];
let historyStep = -1;
let lastHeartX = null;
let lastHeartY = null;

// Set canvas background via CSS instead of filling
canvas.style.backgroundColor = currentBgColor;

function saveState() {
    historyStep++;
    if (historyStep < drawingHistory.length) {
        drawingHistory.length = historyStep;
    }
    // Save only the drawing, not the background
    drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    if (drawingHistory.length > 20) {
        drawingHistory.shift();
        historyStep--;
    }
}

saveState();

function drawNormal(x, y, color) {
    ctx.lineWidth = currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawNeon(x, y, color) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = currentBrushSize * 1.15;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    ctx.shadowBlur = 5;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = currentBrushSize * 1.05;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    ctx.shadowBlur = 3;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = currentBrushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = currentBrushSize * 0.2;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();
    
    ctx.moveTo(x, y);
}

function drawHeart(x, y, color) {
    ctx.save();
    
    const heartSize = currentBrushSize * 1.8;
    ctx.translate(x, y);
    
    const gradient = ctx.createLinearGradient(-heartSize/2, 0, heartSize/2, heartSize);
    
    let r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
    } else {
        r = 255; g = 0; b = 110;
    }
    
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(1, color);
    
    ctx.beginPath();
    ctx.moveTo(0, heartSize * 0.3);
    
    ctx.bezierCurveTo(0, 0, -heartSize * 0.5, 0, -heartSize * 0.5, heartSize * 0.3);
    ctx.bezierCurveTo(-heartSize * 0.5, heartSize * 0.7, 0, heartSize * 0.9, 0, heartSize);
    ctx.bezierCurveTo(0, heartSize * 0.9, heartSize * 0.5, heartSize * 0.7, heartSize * 0.5, heartSize * 0.3);
    ctx.bezierCurveTo(heartSize * 0.5, 0, 0, 0, 0, heartSize * 0.3);
    
    ctx.closePath();
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(2, currentBrushSize * 0.3);
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.stroke();
    
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
    ctx.lineWidth = Math.max(1, currentBrushSize * 0.15);
    ctx.shadowBlur = 4;
    ctx.stroke();
    
    const sparkleCount = 3;
    for (let i = 0; i < sparkleCount; i++) {
        const angle = (Math.PI * 2 * i) / sparkleCount + Math.random() * 0.5;
        const distance = heartSize * 0.6 + Math.random() * 10;
        const sparkX = Math.cos(angle) * distance;
        const sparkY = Math.sin(angle) * distance;
        const sparkSize = Math.random() * 2 + 1;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        
        for (let j = 0; j < 4; j++) {
            const starAngle = (Math.PI / 2 * j);
            const outerX = sparkX + Math.cos(starAngle) * sparkSize;
            const outerY = sparkY + Math.sin(starAngle) * sparkSize;
            
            if (j === 0) {
                ctx.moveTo(outerX, outerY);
            } else {
                ctx.lineTo(outerX, outerY);
            }
            
            const innerAngle = starAngle + Math.PI / 4;
            const innerX = sparkX + Math.cos(innerAngle) * (sparkSize * 0.4);
            const innerY = sparkY + Math.sin(innerAngle) * (sparkSize * 0.4);
            ctx.lineTo(innerX, innerY);
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.restore();
}

function drawSpray(x, y, color) {
    ctx.shadowBlur = 0;
    
    const density = currentBrushSize * 2;
    const radius = currentBrushSize * 1.5;
    
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const sprayX = x + Math.cos(angle) * distance;
        const sprayY = y + Math.sin(angle) * distance;
        
        ctx.fillStyle = color;
        ctx.fillRect(sprayX, sprayY, 1, 1);
    }
}

function startDrawing(e) {
    isDrawing = true;
    lastHeartX = null;
    lastHeartY = null;
    draw(e);
}

function stopDrawing() {
    if (isDrawing) {
        isDrawing = false;
        ctx.beginPath();
        saveState();
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    
    const canvasX = x * (canvas.width / rect.width);
    const canvasY = y * (canvas.height / rect.height);
    
    if (isEraser) {
        drawNormal(canvasX, canvasY, currentBgColor);
    } else {
        switch(currentMode) {
            case 'normal':
                drawNormal(canvasX, canvasY, currentColor);
                break;
            case 'neon':
                drawNeon(canvasX, canvasY, currentColor);
                break;
            case 'heart':
                const heartSize = currentBrushSize * 1.8;
                if (!lastHeartX || !lastHeartY || 
                    Math.sqrt(Math.pow(canvasX - lastHeartX, 2) + Math.pow(canvasY - lastHeartY, 2)) > heartSize * 1.2) {
                    drawHeart(canvasX, canvasY, currentColor);
                    lastHeartX = canvasX;
                    lastHeartY = canvasY;
                }
                break;
            case 'spray':
                drawSpray(canvasX, canvasY, currentColor);
                break;
        }
    }
}

// Drawing event listeners
brushSize.addEventListener('input', (e) => {
    currentBrushSize = e.target.value;
    brushSizeValue.textContent = currentBrushSize;
});

modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.getAttribute('data-mode');
        isEraser = false;
        eraserBtn.classList.remove('active');
    });
});

colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Check if premium color is locked
        if (btn.classList.contains('premium-color') && btn.classList.contains('hidden')) {
            return; // Silently ignore if locked
        }
        
        colorButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
        isEraser = false;
        eraserBtn.classList.remove('active');
    });
});

if (bgColorPalette) {
    bgColorPalette.addEventListener('click', function(e) {
        const clickedBtn = e.target.closest('.bg-color-btn');
        
        if (!clickedBtn) return;
        
        // Check if premium background is locked
        if (clickedBtn.classList.contains('premium-color') && clickedBtn.classList.contains('hidden')) {
            return; // Silently ignore if locked
        }
        
        const newBgColor = clickedBtn.getAttribute('data-bgcolor');
        if (!newBgColor) return;
        
        const allBgBtns = bgColorPalette.querySelectorAll('.bg-color-btn');
        allBgBtns.forEach(b => b.classList.remove('active'));
        clickedBtn.classList.add('active');
        
        // TRANSPARENT CANVAS APPROACH: Just change CSS background
        // No need to modify pixels - drawing stays intact
        canvas.style.backgroundColor = newBgColor;
        currentBgColor = newBgColor;
        
        // Visual feedback
        clickedBtn.style.transform = 'scale(1.3)';
        clickedBtn.style.boxShadow = '0 0 15px ' + newBgColor;
        
        setTimeout(() => {
            clickedBtn.style.transform = '';
            clickedBtn.style.boxShadow = '';
        }, 300);
        
        // Save state for undo
        saveState();
    });
}

eraserBtn.addEventListener('click', () => {
    isEraser = !isEraser;
    if (isEraser) {
        eraserBtn.classList.add('active');
        colorButtons.forEach(b => b.classList.remove('active'));
        modeButtons.forEach(b => b.classList.remove('active'));
        currentMode = 'normal';
    } else {
        eraserBtn.classList.remove('active');
    }
});

undoBtn.addEventListener('click', () => {
    if (historyStep > 0) {
        historyStep--;
        const imageData = drawingHistory[historyStep];
        ctx.putImageData(imageData, 0, 0);
    }
});

clearCanvasBtn.addEventListener('click', () => {
    // Clear only the drawing, not the background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
});
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
});

submitDrawingBtn.addEventListener('click', () => {
    // Disable button and show loading
    submitDrawingBtn.disabled = true;
    submitDrawingBtn.textContent = 'Sending...';
    
    // Create a temporary canvas to merge drawing + background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill background
    tempCtx.fillStyle = currentBgColor;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the transparent canvas on top
    tempCtx.drawImage(canvas, 0, 0);
    
    // Export as PNG
    const drawingData = tempCanvas.toDataURL('image/png');
    submitResponse('drawing', { drawingData: drawingData, drawingMode: 'freehand' });
});

// ==================== SUBMIT RESPONSE ====================
async function submitResponse(type, data) {
    if (!currentRant) {
        return;
    }
    
    // Check if using API mode
    if (typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API) {
        try {
            let response;
            
            if (type === 'text') {
                // Submit text response
                response = await fetch(`${API_CONFIG.API_BASE_URL}/responses/text`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        duvvId: rantId,
                        text: data.text,
                        senderIP: await getUserIP()
                    })
                });
            } else if (type === 'audio') {
                // Submit audio response
                const formData = new FormData();
                formData.append('duvvId', rantId);
                formData.append('audio', data.audioBlob, 'recording.webm');
                formData.append('voiceFilter', data.filter || 'none');
                formData.append('senderIP', await getUserIP());
                
                response = await fetch(`${API_CONFIG.API_BASE_URL}/responses/audio`, {
                    method: 'POST',
                    body: formData
                });
            } else if (type === 'drawing') {
                // Submit drawing response
                response = await fetch(`${API_CONFIG.API_BASE_URL}/responses/drawing`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        duvvId: rantId,
                        drawingData: data.drawingData,
                        drawingMode: data.drawingMode || 'freehand',
                        senderIP: await getUserIP()
                    })
                });
            }
            
            if (response && response.ok) {
                // Show Success UI
                document.getElementById('responseForm').classList.add('hidden');
                document.getElementById('questionCard').classList.add('hidden');
                document.getElementById('successMessage').classList.remove('hidden');
            } else {
                const errorData = await response.json();
                await showAlert(
                    errorData.error || 'Could not submit your response. Please try again.',
                    'Error! 😔',
                    '❌'
                );
                // Re-enable buttons on error
                document.querySelectorAll('button').forEach(btn => {
                    btn.disabled = false;
                    if (btn.textContent === 'Sending...') {
                        btn.textContent = btn.id.includes('Audio') ? 'Send Audio' : 
                                         btn.id.includes('Drawing') ? 'Send Drawing' : 'Send';
                    }
                });
            }
        } catch (error) {
            console.error("Error submitting response:", error);
            await showAlert(
                'Could not connect to server. Please try again later.',
                'Connection error! 😵',
                '🔌'
            );
            // Re-enable buttons on error
            document.querySelectorAll('button').forEach(btn => {
                btn.disabled = false;
                if (btn.textContent === 'Sending...') {
                    btn.textContent = btn.id.includes('Audio') ? 'Send Audio' : 
                                     btn.id.includes('Drawing') ? 'Send Drawing' : 'Send';
                }
            });
        }
        return;
    }
    
    // LocalStorage mode (fallback)
    // Fetch IP Data for better hints (Location & Provider)
    let ipData = {};
    try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
            ipData = await res.json();
        }
    } catch (e) {
        console.warn("Could not fetch IP data for hints", e);
    }
    
    // Gather "Hidden" Hints Data
    const metaData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB` : 'Unknown',
        cores: navigator.hardwareConcurrency || 'Unknown',
        touch: ('ontouchstart' in window) ? 'Yes' : 'No',
        battery: 'Unknown', // Placeholder
        // Enhanced Location & Provider
        city: ipData.city || null,
        region: ipData.region || null,
        country: ipData.country_name || null,
        provider: ipData.org || ipData.asn || 'Unknown'
    };

    const response = {
        type: type,
        anonymous: true,
        author: 'Anonymous',
        createdAt: new Date().toISOString(),
        meta: metaData, // Attach hints
        ...data
    };
    
    const rants = JSON.parse(localStorage.getItem(`duvvs_${posterUsername}`)) || [];
    const rantIndex = rants.findIndex(r => r.id === rantId);
    
    if (rantIndex !== -1) {
        rants[rantIndex].responses.push(response);
        localStorage.setItem(`duvvs_${posterUsername}`, JSON.stringify(rants));
        
        // Show Success UI
        document.getElementById('responseForm').classList.add('hidden');
        document.getElementById('questionCard').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
    } else {
        console.error("Rant not found in localStorage");
        await showAlert(
            'The duvv might have been deleted. Sorry!',
            'Something went wrong! 😕',
            '❌'
        );
    }
}

// Helper function to get user IP
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (response.ok) {
            const data = await response.json();
            return data.ip;
        }
    } catch (e) {
        console.warn("Could not fetch IP", e);
    }
    return 'unknown';
}

// Success Screen Actions
const sendAnotherBtn = document.getElementById('sendAnotherBtn');
if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => {
        // Refresh the page to reset everything
        window.location.reload();
    });
}

const createOwnBtn = document.getElementById('createOwnBtn');
if (createOwnBtn) {
    createOwnBtn.addEventListener('click', () => {
        window.location.href = '/';
    });
}

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    loadRant();
});
