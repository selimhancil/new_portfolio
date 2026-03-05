/* ==========================================
   AUTH.JS — Firebase Authentication & Firestore
   ==========================================
   
   This file handles:
   - Firebase initialization
   - Email/Password authentication
   - Google & GitHub OAuth
   - User profile management (Firestore)
   - Auth state management across pages
   
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project
   3. Enable Authentication > Email/Password, Google, GitHub
   4. Create Firestore Database
   5. Replace the firebaseConfig below with your project config
   ========================================== */

// ============================================
// FIREBASE CONFIG — Replace with your own!
// ============================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ============================================
// FIREBASE SDK (loaded from CDN)
// ============================================
let auth, db, googleProvider, githubProvider;
let currentUser = null;

// Load Firebase SDK dynamically
function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.firebase) {
            resolve();
            return;
        }

        const scripts = [
            'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
            'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
            'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
        ];

        let loaded = 0;
        scripts.forEach((src, i) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loaded++;
                if (loaded === scripts.length) resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    });
}

// Initialize Firebase
async function initFirebase() {
    try {
        await loadFirebaseSDK();

        // Check if config is set
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.warn('⚠️ Firebase config not set! Please update firebaseConfig in auth.js');
            return false;
        }

        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        githubProvider = new firebase.auth.GithubAuthProvider();

        // Listen for auth state changes
        auth.onAuthStateChanged(handleAuthStateChange);

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase init error:', error);
        return false;
    }
}

// ============================================
// AUTH STATE MANAGEMENT
// ============================================
function handleAuthStateChange(user) {
    currentUser = user;

    // Update navbar auth button on all pages
    updateNavAuthButton(user);

    // Page-specific logic
    const page = document.body.dataset.page || detectPage();

    if (page === 'profile') {
        if (user) {
            showProfileView(user);
        } else {
            showLoginRequired();
        }
    }

    if (page === 'auth' && user) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        window.location.href = redirect && redirect.startsWith('admin') ? 'admin.html' : 'profile.html';
    }
}

function getRedirectAfterLogin() {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    return (r === 'admin.html' || r === 'admin') ? 'admin.html' : 'profile.html';
}

function detectPage() {
    const path = window.location.pathname;
    if (path.includes('profile')) return 'profile';
    if (path.includes('auth')) return 'auth';
    if (path.includes('admin')) return 'admin';
    return 'other';
}

function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function isSafeAvatarUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return lower.startsWith('https://') && !lower.startsWith('javascript:') && !lower.startsWith('data:');
}

function updateNavAuthButton(user) {
    const btn = document.getElementById('navAuthBtn');
    if (!btn) return;

    if (user) {
        const name = user.displayName || user.email?.split('@')[0] || 'Profil';
        const photoURL = user.photoURL;
        btn.href = 'profile.html';
        btn.style.display = 'inline-flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '6px';
        if (photoURL && isSafeAvatarUrl(photoURL)) {
            const img = document.createElement('img');
            img.src = photoURL;
            img.alt = '';
            img.style.cssText = 'width:24px;height:24px;border-radius:50%;margin-right:4px;';
            btn.textContent = '';
            btn.appendChild(img);
            btn.appendChild(document.createTextNode(name));
        } else {
            btn.textContent = `👤 ${name}`;
        }
    } else {
        btn.href = 'auth.html';
        btn.textContent = 'Giriş Yap';
    }
}

// ============================================
// AUTH PAGE FUNCTIONS
// ============================================

// Tab switching
function switchTab(tab) {
    document.getElementById('loginForm').classList.toggle('active', tab === 'login');
    document.getElementById('registerForm').classList.toggle('active', tab === 'register');
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');

    document.getElementById('authTitle').textContent = tab === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluştur';
    document.getElementById('authSubtitle').textContent = tab === 'login'
        ? 'Hesabınıza giriş yapın veya yeni hesap oluşturun'
        : 'Ücretsiz hesap oluşturun ve topluluğa katılın';

    hideAuthMessage();
}

// Password toggle
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

// Show/hide messages
function showAuthMessage(text, type) {
    const msg = document.getElementById('authMessage');
    if (!msg) return;
    document.getElementById('authMessageIcon').textContent = type === 'error' ? '⚠️' : '✅';
    document.getElementById('authMessageText').textContent = text;
    msg.className = `auth-message ${type} visible`;
}

function hideAuthMessage() {
    const msg = document.getElementById('authMessage');
    if (msg) msg.classList.remove('visible');
}

// Demo admin - sadece localhost/127.0.0.1'de veya Firebase yapılandırılmamışsa çalışır
function isDemoLoginEnabled() {
    const host = (window.location.hostname || '').toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.0' || host === '127.0.0.1' || host === '';
    const firebaseNotConfigured = !window.firebase || firebaseConfig.apiKey === 'YOUR_API_KEY';
    return isLocal || firebaseNotConfigured;
}

function isDemoLogin(email, password) {
    if (!isDemoLoginEnabled()) return false;
    const e = String(email || '').trim().toLowerCase();
    const p = String(password || '').trim();
    return (e === 'admin@demo.com' || e === 'admin') && p === 'admin123';
}

// Email/Password Login
async function handleLogin(e) {
    e.preventDefault();
    const emailEl = document.getElementById('loginEmail');
    const passwordEl = document.getElementById('loginPassword');
    const email = (emailEl && emailEl.value || '').trim().toLowerCase();
    const password = (passwordEl && passwordEl.value || '').trim();
    const btn = document.getElementById('loginSubmit');

    btn.classList.add('loading');
    btn.disabled = true;
    hideAuthMessage();

    // Demo admin - HER ŞEYDEN ÖNCE kontrol et
    if (isDemoLogin(email, password)) {
        const demoUser = { uid: 'demo_admin', email: 'admin@demo.com', displayName: 'Demo Admin', photoURL: null };
        localStorage.setItem('sh_currentUser', JSON.stringify(demoUser));
        showAuthMessage('Demo giriş başarılı! Yönlendiriliyorsunuz...', 'success');
        setTimeout(() => { btn.classList.remove('loading'); btn.disabled = false; window.location.href = getRedirectAfterLogin(); }, 800);
        return;
    }

    try {
        if (!auth) {
            showAuthMessage('Firebase yapılandırılmamış. Giriş için Firebase kurulumu gerekiyor.', 'error');
        } else {
            await auth.signInWithEmailAndPassword(email, password);
            showAuthMessage('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
            setTimeout(() => window.location.href = getRedirectAfterLogin(), 1000);
        }
    } catch (error) {
        const messages = {
            'auth/user-not-found': 'Bu e-posta ile kayıtlı bir hesap bulunamadı.',
            'auth/wrong-password': 'Şifre hatalı.',
            'auth/too-many-requests': 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.'
        };
        showAuthMessage(messages[error.code] || error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Email/Password Register
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const btn = document.getElementById('registerSubmit');

    if (password !== passwordConfirm) {
        showAuthMessage('Şifreler eşleşmiyor.', 'error');
        return;
    }

    btn.classList.add('loading');
    btn.disabled = true;
    hideAuthMessage();

    try {
        if (!auth) {
            showAuthMessage('Firebase yapılandırılmamış. Kayıt için Firebase kurulumu gerekiyor.', 'error');
        } else {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            await cred.user.updateProfile({ displayName: name });

            // Create Firestore profile
            await db.collection('users').doc(cred.user.uid).set({
                name,
                email,
                bio: '',
                location: '',
                phone: '',
                website: '',
                job: '',
                social: {},
                notifications: { projects: true, blog: true, newsletter: false, security: true },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showAuthMessage('Hesap oluşturuldu! Yönlendiriliyorsunuz...', 'success');
            setTimeout(() => window.location.href = getRedirectAfterLogin(), 1000);
        }
    } catch (error) {
        const messages = {
            'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor.',
            'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.'
        };
        showAuthMessage(messages[error.code] || error.message, 'error');
    } finally {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Google Login
async function loginWithGoogle() {
    try {
        if (!auth) {
            showAuthMessage('Firebase yapılandırılmamış. Lütfen e-posta ile kayıt olun.', 'error');
            return;
        }
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;

        // Create/update Firestore profile
        const docRef = db.collection('users').doc(user.uid);
        const doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({
                name: user.displayName || '',
                email: user.email,
                photoURL: user.photoURL,
                bio: '',
                location: '',
                phone: '',
                website: '',
                job: '',
                social: {},
                notifications: { projects: true, blog: true, newsletter: false, security: true },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        window.location.href = getRedirectAfterLogin();
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            showAuthMessage('Google ile giriş başarısız: ' + error.message, 'error');
        }
    }
}

// GitHub Login
async function loginWithGitHub() {
    try {
        if (!auth) {
            showAuthMessage('Firebase yapılandırılmamış. Lütfen e-posta ile kayıt olun.', 'error');
            return;
        }
        const result = await auth.signInWithPopup(githubProvider);
        const user = result.user;

        const docRef = db.collection('users').doc(user.uid);
        const doc = await docRef.get();
        if (!doc.exists) {
            await docRef.set({
                name: user.displayName || '',
                email: user.email,
                photoURL: user.photoURL,
                bio: '',
                location: '',
                phone: '',
                website: '',
                job: '',
                social: { github: result.additionalUserInfo?.username || '' },
                notifications: { projects: true, blog: true, newsletter: false, security: true },
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        window.location.href = getRedirectAfterLogin();
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            showAuthMessage('GitHub ile giriş başarısız: ' + error.message, 'error');
        }
    }
}

// Forgot Password
function showForgotPassword() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        showAuthMessage('Lütfen e-posta adresinizi girin.', 'error');
        return;
    }
    if (auth) {
        auth.sendPasswordResetEmail(email)
            .then(() => showAuthMessage('Şifre sıfırlama e-postası gönderildi!', 'success'))
            .catch(err => showAuthMessage('Hata: ' + err.message, 'error'));
    } else {
        showAuthMessage('Şifre sıfırlama için Firebase gerekli.', 'error');
    }
}

// ============================================
// PROFILE PAGE FUNCTIONS
// ============================================
function showLoginRequired() {
    const loginView = document.getElementById('loginRequiredView');
    const profileView = document.getElementById('profileView');
    if (loginView) loginView.style.display = 'block';
    if (profileView) profileView.style.display = 'none';
}

function showProfileView(user) {
    const loginView = document.getElementById('loginRequiredView');
    const profileView = document.getElementById('profileView');
    if (loginView) loginView.style.display = 'none';
    if (profileView) profileView.style.display = 'block';

    // Set basic info from auth
    const nameEl = document.getElementById('profileDisplayName');
    const emailEl = document.getElementById('profileDisplayEmail');
    const avatarEl = document.getElementById('profileAvatar');

    if (nameEl) nameEl.textContent = user.displayName || user.email?.split('@')[0] || 'Kullanıcı';
    if (emailEl) emailEl.textContent = user.email || '';
    if (avatarEl && user.photoURL && isSafeAvatarUrl(user.photoURL)) {
        const img = document.createElement('img');
        img.src = user.photoURL;
        img.alt = 'Avatar';
        avatarEl.textContent = '';
        avatarEl.appendChild(img);
    }

    // Load profile from Firestore or localStorage
    loadProfile(user);
}

async function loadProfile(user) {
    let profile = null;

    if (db) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) profile = doc.data();
        } catch (e) {
            console.warn('Firestore read error:', e);
        }
    }

    // Fallback to localStorage
    if (!profile) {
        profile = JSON.parse(localStorage.getItem('sh_profile_' + user.uid) || 'null');
    }

    if (!profile) return;

    // Fill form fields
    setVal('pfName', profile.name || user.displayName || '');
    setVal('pfUsername', profile.username || '');
    setVal('pfBio', profile.bio || '');
    setVal('pfLocation', profile.location || '');
    setVal('pfEmail', user.email || profile.email || '');
    setVal('pfPhone', profile.phone || '');
    setVal('pfWebsite', profile.website || '');
    setVal('pfJob', profile.job || '');

    // Social links
    if (profile.social) {
        setVal('socialGithub', profile.social.github || '');
        setVal('socialTwitter', profile.social.twitter || '');
        setVal('socialLinkedin', profile.social.linkedin || '');
        setVal('socialInstagram', profile.social.instagram || '');
        setVal('socialYoutube', profile.social.youtube || '');

        // Update status badges
        ['Github', 'Twitter', 'Linkedin', 'Instagram', 'Youtube'].forEach(name => {
            const input = document.getElementById('social' + name);
            const status = document.getElementById('status' + name);
            if (input && status) {
                if (input.value.trim()) {
                    status.textContent = 'Bağlandı';
                    status.className = 'social-link-status connected';
                } else {
                    status.textContent = 'Bağlanmadı';
                    status.className = 'social-link-status disconnected';
                }
            }
        });
    }

    // Notifications
    if (profile.notifications) {
        setChecked('notifProjects', profile.notifications.projects);
        setChecked('notifBlog', profile.notifications.blog);
        setChecked('notifNewsletter', profile.notifications.newsletter);
        setChecked('notifSecurity', profile.notifications.security);
    }
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function setChecked(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
}

// Save Personal Info
async function savePersonalInfo(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('pfName')?.value || '',
        username: document.getElementById('pfUsername')?.value || '',
        bio: document.getElementById('pfBio')?.value || '',
        location: document.getElementById('pfLocation')?.value || ''
    };

    await saveToStorage(data);

    // Update display name
    const nameEl = document.getElementById('profileDisplayName');
    if (nameEl && data.name) nameEl.textContent = data.name;

    if (currentUser && auth) {
        try { await currentUser.updateProfile({ displayName: data.name }); } catch (e) { }
    }

    showToast('✅', 'Kişisel bilgiler kaydedildi!');
}

// Save Account Settings
async function saveAccountSettings(e) {
    e.preventDefault();
    const data = {
        phone: document.getElementById('pfPhone')?.value || '',
        website: document.getElementById('pfWebsite')?.value || '',
        job: document.getElementById('pfJob')?.value || ''
    };

    await saveToStorage(data);
    showToast('✅', 'Hesap ayarları kaydedildi!');
}

// Save Social Links
async function saveSocialLinks() {
    const social = {
        github: document.getElementById('socialGithub')?.value || '',
        twitter: document.getElementById('socialTwitter')?.value || '',
        linkedin: document.getElementById('socialLinkedin')?.value || '',
        instagram: document.getElementById('socialInstagram')?.value || '',
        youtube: document.getElementById('socialYoutube')?.value || ''
    };

    await saveToStorage({ social });

    // Update status badges
    ['Github', 'Twitter', 'Linkedin', 'Instagram', 'Youtube'].forEach(name => {
        const key = name.toLowerCase();
        const status = document.getElementById('status' + name);
        if (status) {
            if (social[key]) {
                status.textContent = 'Bağlandı';
                status.className = 'social-link-status connected';
            } else {
                status.textContent = 'Bağlanmadı';
                status.className = 'social-link-status disconnected';
            }
        }
    });

    showToast('🔗', 'Sosyal hesaplar kaydedildi!');
}

// Save Notifications
async function saveNotifications() {
    const notifications = {
        projects: document.getElementById('notifProjects')?.checked || false,
        blog: document.getElementById('notifBlog')?.checked || false,
        newsletter: document.getElementById('notifNewsletter')?.checked || false,
        security: document.getElementById('notifSecurity')?.checked || false
    };

    await saveToStorage({ notifications });
    showToast('🔔', 'Bildirim tercihleri kaydedildi!');
}

// Generic save function
async function saveToStorage(data) {
    const user = currentUser || JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
    if (!user) return;

    // Save to Firestore if available
    if (db && currentUser) {
        try {
            await db.collection('users').doc(currentUser.uid).set(data, { merge: true });
        } catch (e) {
            console.warn('Firestore write error:', e);
        }
    }

    // Always save to localStorage as backup
    const uid = user.uid;
    const existing = JSON.parse(localStorage.getItem('sh_profile_' + uid) || '{}');
    const merged = { ...existing, ...data };
    localStorage.setItem('sh_profile_' + uid, JSON.stringify(merged));
}

// Avatar Upload
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const avatarEl = document.getElementById('profileAvatar');
        if (avatarEl) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Avatar';
            avatarEl.textContent = '';
            avatarEl.appendChild(img);
        }

        // Save avatar as base64 to localStorage
        const user = currentUser || JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
        if (user) {
            localStorage.setItem('sh_avatar_' + user.uid, e.target.result);
        }

        showToast('📷', 'Profil fotoğrafı güncellendi!');
    };
    reader.readAsDataURL(file);
}

// Logout
async function logoutUser() {
    if (auth) {
        await auth.signOut();
    }
    localStorage.removeItem('sh_currentUser');
    window.location.href = 'auth.html';
}

// Reset Profile
function resetProfile() {
    if (!confirm('Profil bilgileriniz sıfırlanacak. Emin misiniz?')) return;

    const user = currentUser || JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
    if (user) {
        localStorage.removeItem('sh_profile_' + user.uid);
        localStorage.removeItem('sh_avatar_' + user.uid);
    }

    showToast('🗑️', 'Profil sıfırlandı. Sayfa yenileniyor...');
    setTimeout(() => window.location.reload(), 1500);
}

// Delete Account
async function deleteAccount() {
    if (!confirm('Hesabınız kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?')) return;

    const user = currentUser || JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
    if (user) {
        // Clean localStorage
        localStorage.removeItem('sh_profile_' + user.uid);
        localStorage.removeItem('sh_avatar_' + user.uid);
        localStorage.removeItem('sh_currentUser');

        // Remove from users list
        const users = JSON.parse(localStorage.getItem('sh_users') || '[]');
        const filtered = users.filter(u => u.uid !== user.uid);
        localStorage.setItem('sh_users', JSON.stringify(filtered));

        // Delete from Firestore & Auth
        if (db && currentUser) {
            try {
                await db.collection('users').doc(currentUser.uid).delete();
                await currentUser.delete();
            } catch (e) {
                console.warn('Firebase delete error:', e);
            }
        }
    }

    window.location.href = 'auth.html';
}

// Toast notification
function showToast(icon, text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    document.getElementById('toastIcon').textContent = icon;
    document.getElementById('toastText').textContent = text;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
}

// ============================================
// INIT — Run on page load
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Try to init Firebase
    const firebaseReady = await initFirebase();

    if (!firebaseReady) {
        console.log('📦 Firebase not configured. Demo login available on localhost.');

        const user = JSON.parse(localStorage.getItem('sh_currentUser') || 'null');
        handleAuthStateChange(user);
    }

    // Update social link status indicators on input change
    ['Github', 'Twitter', 'Linkedin', 'Instagram', 'Youtube'].forEach(name => {
        const input = document.getElementById('social' + name);
        if (input) {
            input.addEventListener('input', function () {
                const status = document.getElementById('status' + name);
                if (status) {
                    if (this.value.trim()) {
                        status.textContent = 'Bağlandı';
                        status.className = 'social-link-status connected';
                    } else {
                        status.textContent = 'Bağlanmadı';
                        status.className = 'social-link-status disconnected';
                    }
                }
            });
        }
    });
});
