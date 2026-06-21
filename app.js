/* =============================================
   CarbonWise Rewards - SPA Core Logic
   ============================================= */

// Local Database Variables
let users = [];
let currentEmail = null;
let AppState = {};

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initAuthHandlers();
    initNavigation();
    initBannerCarousel();
    initDynamicCounters();
    initAnimations();
    initInteractions();
    initTrackPage();
    initInsightsPage();
    initChallengesPage();
    initMarketplacePage();
    initRewardsPage();
    initCommunityPage();
    initImpactPage();
    initSettingsPage();
    initDeveloperPage();
    initModals();
    generateSVGAssets();
    if (currentEmail) {
        updateUI();
    }
});

/* =============================================
   State Persistence & Multi-User Database
   ============================================= */
function loadState() {
    // 1. Load users list database
    const savedUsers = localStorage.getItem('carbonwise_users');
    if (savedUsers) {
        try {
            users = JSON.parse(savedUsers);
        } catch (e) {
            console.error('Failed to parse user directory:', e);
        }
    } else {
        // Seed initial accounts
        users = [
            { email: 'dev@carbonwise.com', password: 'developer', name: 'Developer', role: 'Developer', goal: 50 },
            { email: 'ananya@carbonwise.com', password: 'password', name: 'Ananya', role: 'Green Explorer', goal: 50 }
        ];
        localStorage.setItem('carbonwise_users', JSON.stringify(users));
    }

    // 2. Verify current active login session
    currentEmail = localStorage.getItem('carbonwise_current_session');
    if (currentEmail) {
        const u = users.find(x => x.email === currentEmail);
        if (u) {
            // Load isolated data for current user
            const savedData = localStorage.getItem(`carbonwise_data_${currentEmail}`);
            if (savedData) {
                try {
                    AppState = JSON.parse(savedData);
                } catch(e) {}
            } else {
                initUserStateForEmail(currentEmail, u.name, u.role, u.goal);
            }

            // Hide auth screen and display layout
            document.getElementById('page-auth').style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';

            // Show/Hide Developer panel sidebar tab
            const devLink = document.getElementById('nav-developer');
            if (devLink) {
                devLink.style.display = (u.role === 'Developer') ? 'flex' : 'none';
            }
        } else {
            // Session corrupted
            currentEmail = null;
            localStorage.removeItem('carbonwise_current_session');
            showAuthOverlay();
        }
    } else {
        showAuthOverlay();
    }
}

function showAuthOverlay() {
    document.getElementById('page-auth').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
}

function saveState() {
    if (currentEmail) {
        localStorage.setItem(`carbonwise_data_${currentEmail}`, JSON.stringify(AppState));
    }
}

function initUserStateForEmail(email, name, role, goal) {
    const defaultState = {
        user: { name: name, role: role, goal: goal },
        points: (role === 'Developer') ? 9999 : 2450,
        carbonSaved: (role === 'Developer') ? 120.0 : 37.6,
        moneySaved: (role === 'Developer') ? 5000 : 1850,
        badgesCount: (role === 'Developer') ? 12 : 8,
        activities: [
            { id: 1, type: 'upload', text: 'You joined CarbonWise Rewards! Welcome! 🎉', points: 100, time: 'Just now', isPositive: true }
        ],
        challenges: [
            { id: 'plastic', name: '7 Day Plastic Free Challenge', desc: 'Avoid single-use plastics and carry bags', points: 300, current: 0, target: 7, joined: false, icon: 'fa-ban', iconClass: 'plastic' },
            { id: 'cycling', name: 'Cycle for a Better Tomorrow', desc: 'Cycle 20 km this week for commute', points: 250, current: 0, target: 20, joined: false, icon: 'fa-bicycle', iconClass: 'cycling', unit: 'km' },
            { id: 'gifting', name: 'Green Gifting Challenge', desc: 'Gift sustainable products to friends', points: 200, current: 0, target: 5, joined: false, icon: 'fa-gift', iconClass: 'gifting' },
            { id: 'energy', name: 'Energy Saver Challenge', desc: 'Reduce idle appliance energy consumption', points: 150, current: 0, target: 3, joined: false, icon: 'fa-bolt', iconClass: 'plastic' },
            { id: 'compost', name: 'Compost Hero', desc: 'Start composting organic home waste', points: 350, current: 0, target: 5, joined: false, icon: 'fa-recycle', iconClass: 'cycling' }
        ],
        marketplaceProducts: [
            { id: 'brush', name: 'Organic Bamboo Toothbrush Set', desc: 'Pack of 4 biodegradable soft-bristle bamboo brushes.', cost: 400, icon: 'fa-brush' },
            { id: 'tote', name: 'Recycled Canvas Tote Bag', desc: 'Durable, stylish, and perfect for zero-waste grocery shopping.', cost: 600, icon: 'fa-bag-shopping' },
            { id: 'flask', name: 'Stainless Steel Water Bottle', desc: 'Double-walled vacuum insulated bottle, 750ml capacity.', cost: 800, icon: 'fa-bottle-water' },
            { id: 'solar', name: 'Portable Solar Phone Charger', desc: 'Waterproof solar power bank, 10000mAh solar charging.', cost: 1500, icon: 'fa-solar-panel' },
            { id: 'wraps', name: 'Beeswax Food Wraps (Pack of 3)', desc: 'Organic cotton wraps coated with beeswax to replace plastic cling film.', cost: 500, icon: 'fa-box-open' },
            { id: 'starter', name: 'Zero Waste Starter Kit', desc: 'Contains a reusable coffee cup, straw, cutlery, and produce bags.', cost: 1800, icon: 'fa-box' }
        ],
        brandVouchers: [
            { id: 'derma-10', brand: 'Derma Co', desc: '10% Off on Skincare Products', points: 500, code: 'DERMA-ECO-10', bg: '#f0f0f0', color: '#1a5276' },
            { id: 'evolve-15', brand: 'Evolve Together', desc: '15% Off on Organic Clothing', points: 750, code: 'EVOLVE-CLOTH-15', bg: '#e8f5e9', color: '#2e7d32' },
            { id: 'mama-20', brand: 'Mamaearth', desc: '20% Off on Orders', points: 1000, code: 'MAMA-GREEN-20', bg: '#fff3e0', color: '#e65100' },
            { id: 'body-25', brand: 'The Body Shop', desc: '₹250 Voucher on Organic Soaps', points: 600, code: 'BODY-SOAP-250', bg: '#fff5f5', color: '#b91c1c' },
            { id: 'bewakoof-20', brand: 'Bewakoof', desc: '20% Off on Eco clothing lines', points: 900, code: 'BEWAKOOF-ECO-20', bg: '#f3e8ff', color: '#6b21a8' }
        ],
        redeemedVouchers: [],
        communityPosts: [
            { id: 1, author: 'Rohan Verma', role: 'Green Champion', avatar: 'assets/avatar.svg', content: 'Just cycled 12 km today to work instead of driving! Saved around 2.6kg of carbon footprint. 🚲🌿', action: 'Cycling', likes: 14, liked: false, comments: [{ author: 'Priya', text: 'Awesome effort Rohan! Inspiring!' }] },
            { id: 2, author: 'Priya Singh', role: 'Eco Warrior', avatar: 'assets/avatar.svg', content: 'Donated 15 items of old winter wear to H&M recycling drive. Felt great decluttering sustainably! 👗👕', action: 'Clothing Recycling', likes: 9, liked: false, comments: [] }
        ],
        darkMode: false
    };

    // Pre-seed Ananya account with historical data matching original static design
    if (email === 'ananya@carbonwise.com') {
        defaultState.points = 2450;
        defaultState.carbonSaved = 37.6;
        defaultState.moneySaved = 1850;
        defaultState.badgesCount = 8;
        defaultState.activities = [
            { id: 1, type: 'upload', text: 'You uploaded a clothing donation receipt', points: 100, time: '2 hours ago', isPositive: true },
            { id: 2, type: 'purchase', text: 'You purchased eco-friendly product from Derma Co', points: 150, time: 'Yesterday', isPositive: true },
            { id: 3, type: 'challenge', text: 'You completed Cycle Challenge', points: 80, time: '2 days ago', isPositive: true },
            { id: 4, type: 'reward', text: 'You redeemed 10% Derma Co coupon', points: -500, time: '3 days ago', isPositive: false }
        ];
        defaultState.challenges[0].joined = true;
        defaultState.challenges[0].current = 5;
        defaultState.challenges[1].joined = true;
        defaultState.challenges[1].current = 12;
        defaultState.challenges[2].joined = true;
        defaultState.challenges[2].current = 2;
    }

    AppState = defaultState;
    localStorage.setItem(`carbonwise_data_${email}`, JSON.stringify(AppState));
}

/* =============================================
   Authentication Controller Handlers
   ============================================= */
function initAuthHandlers() {
    const tabSignin = document.getElementById('auth-tab-signin');
    const tabSignup = document.getElementById('auth-tab-signup');
    const formLogin = document.getElementById('auth-login-form');
    const formRegister = document.getElementById('auth-register-form');

    if (!tabSignin || !tabSignup || !formLogin || !formRegister) return;

    tabSignin.addEventListener('click', () => {
        tabSignin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabSignin.classList.remove('active');
        formRegister.classList.add('active');
        formLogin.classList.remove('active');
    });

    // Login Form Submit
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const pass = document.getElementById('login-password').value;
        const errMsg = document.getElementById('login-error-msg');

        errMsg.style.display = 'none';

        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            currentEmail = email;
            localStorage.setItem('carbonwise_current_session', email);
            
            loadState();
            updateUI();
            
            // Redirect to dashboard
            switchPage('dashboard');
            showToast(`👋 Welcome back, ${user.name}!`);
        } else {
            errMsg.textContent = '❌ Invalid email or password.';
            errMsg.style.display = 'block';
        }
    });

    // Register Form Submit
    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim().toLowerCase();
        const pass = document.getElementById('register-password').value;
        const goal = parseInt(document.getElementById('register-goal').value) || 50;
        const errMsg = document.getElementById('register-error-msg');

        errMsg.style.display = 'none';

        if (pass.length < 6) {
            errMsg.textContent = '❌ Password must be at least 6 characters.';
            errMsg.style.display = 'block';
            return;
        }

        const exist = users.find(u => u.email === email);
        if (exist) {
            errMsg.textContent = '❌ Email is already registered.';
            errMsg.style.display = 'block';
            return;
        }

        // Add user profile to users directory list
        const newUser = { email, password: pass, name, role: 'Green Explorer', goal };
        users.push(newUser);
        localStorage.setItem('carbonwise_users', JSON.stringify(users));

        // Create initial clean state directory
        initUserStateForEmail(email, name, 'Green Explorer', goal);

        // Auto login
        currentEmail = email;
        localStorage.setItem('carbonwise_current_session', email);
        
        loadState();
        updateUI();

        formRegister.reset();
        tabSignin.click(); // Reset auth form tabs

        switchPage('dashboard');
        showToast(`🎉 Registration successful! Welcome, ${name}!`);
    });
}

function handleLogout() {
    currentEmail = null;
    localStorage.removeItem('carbonwise_current_session');
    
    // Clear credentials fields
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    
    showAuthOverlay();
    showToast('🚪 Logged out successfully.');
}

/* =============================================
   Navigation & Routing
   ============================================= */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            if (pageId === 'logout') {
                handleLogout();
                return;
            }
            if (pageId) {
                switchPage(pageId);
            }
            
            // Add click ripple effect
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(22, 163, 74, 0.15);
                border-radius: 50%;
                width: 100px;
                height: 100px;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: rippleEffect 0.4s ease-out;
                pointer-events: none;
            `;
            item.appendChild(ripple);
            setTimeout(() => ripple.remove(), 400);
        });
    });

    // Delegate generic internal links switching
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-go-to]');
        if (link) {
            const dest = link.getAttribute('data-go-to');
            switchPage(dest);
        }
    });

    // Logo click goes to dashboard
    const logo = document.querySelector('.sidebar-logo');
    if (logo) {
        logo.addEventListener('click', () => switchPage('dashboard'));
    }
}

function switchPage(pageId) {
    const targetSection = document.getElementById(`page-${pageId}`);
    if (!targetSection) return;

    // Toggle active sidebar item
    const navItems = document.querySelectorAll('.nav-menu .nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });

    // Fade and switch page views
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => {
        if (sec.classList.contains('active')) {
            sec.style.opacity = '0';
            sec.style.transform = 'translateY(10px)';
            setTimeout(() => {
                sec.classList.remove('active');
                sec.style.display = 'none';
                
                showAndAnimatePage(targetSection);
            }, 200);
        }
    });

    // Special fallback in case none was active
    const activeSection = document.querySelector('.page-section.active');
    if (!activeSection) {
        showAndAnimatePage(targetSection);
    }

    // Scroll main window to top
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollTop = 0;

    // Trigger page-specific logic refreshes
    if (pageId === 'challenges') renderChallenges();
    if (pageId === 'marketplace') renderMarketplace();
    if (pageId === 'rewards') renderRewards();
    if (pageId === 'community') renderCommunity();
    if (pageId === 'impact') renderImpactPage();
    if (pageId === 'developer') renderDeveloperPanel();
}

function showAndAnimatePage(targetSection) {
    targetSection.style.display = 'block';
    targetSection.offsetHeight; // Reflow
    targetSection.classList.add('active');
    targetSection.style.opacity = '1';
    targetSection.style.transform = 'translateY(0)';
}

/* =============================================
   UI Sync Updates
   ============================================= */
function updateUI() {
    if (!currentEmail || !AppState.user) return;

    // Sync numerical elements
    document.getElementById('green-points-value').textContent = AppState.points.toLocaleString();
    document.getElementById('carbon-value').innerHTML = `${AppState.carbonSaved.toFixed(1)} <small style="font-size:0.8rem;font-weight:600;">kg CO₂</small>`;
    document.getElementById('money-value').textContent = `₹${AppState.moneySaved.toLocaleString()}`;
    document.getElementById('badges-value').textContent = AppState.badgesCount;

    // Marketplace points
    const marketBal = document.getElementById('market-points-balance');
    if (marketBal) marketBal.textContent = AppState.points.toLocaleString();

    // Leaderboard points
    const lbPoints = document.getElementById('lb-user-points');
    if (lbPoints) lbPoints.textContent = `${AppState.points.toLocaleString()} Points`;

    // Leaderboard display name
    const lbName = document.getElementById('lb-user-name');
    if (lbName) lbName.textContent = AppState.user.name;

    // Profile settings inputs
    const settingsNameInput = document.getElementById('settings-name-input');
    if (settingsNameInput) settingsNameInput.value = AppState.user.name;
    const settingsGoalInput = document.getElementById('settings-goal-input');
    if (settingsGoalInput) settingsGoalInput.value = AppState.user.goal;

    // Header Greeting
    const greetingName = document.querySelector('.header-greeting');
    if (greetingName) {
        greetingName.innerHTML = `Good Morning, ${AppState.user.name}! <span class="wave">👋</span>`;
    }
    const sidebarAvatarName = document.querySelector('.user-profile .user-name');
    if (sidebarAvatarName) sidebarAvatarName.textContent = AppState.user.name;
    const sidebarAvatarRole = document.querySelector('.user-profile .user-role');
    if (sidebarAvatarRole) sidebarAvatarRole.textContent = AppState.user.role;

    // Goal Progress calculations
    const percent = Math.min(Math.round((AppState.carbonSaved / AppState.user.goal) * 100), 100);
    const progressPercent = document.getElementById('progress-percent');
    if (progressPercent) progressPercent.textContent = `${percent}%`;

    const goalBarFill = document.getElementById('goal-progress-fill');
    if (goalBarFill) goalBarFill.style.width = `${percent}%`;

    const progressMsg = document.querySelector('.goal-message');
    if (progressMsg) {
        if (percent >= 100) {
            progressMsg.textContent = '🎉 Monthly Carbon Target Achieved! Awesome job!';
        } else if (percent >= 70) {
            progressMsg.textContent = "Almost there! You're doing amazing! 🌟";
        } else {
            progressMsg.textContent = "Keep it up! Small actions add up! 🌱";
        }
    }

    const progressRing = document.getElementById('progress-ring');
    if (progressRing) {
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (percent / 100) * circumference;
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = offset;
    }

    // Settings dark theme class toggle
    const themeCheckbox = document.getElementById('dark-theme-toggle');
    if (themeCheckbox) themeCheckbox.checked = AppState.darkMode;
    if (AppState.darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    renderRecentActivity();
    renderCommunityLeaderboardMini();
}

function renderRecentActivity() {
    const listEl = document.getElementById('activity-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    const limit = 4;
    AppState.activities.slice(0, limit).forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        let iconHtml = '<i class="fa-solid fa-camera"></i>';
        if (act.type === 'purchase') iconHtml = '<i class="fa-solid fa-bag-shopping"></i>';
        if (act.type === 'challenge') iconHtml = '<i class="fa-solid fa-bicycle"></i>';
        if (act.type === 'reward') iconHtml = '<i class="fa-solid fa-ticket"></i>';

        const pointClass = act.isPositive ? 'positive' : 'negative';
        const prefix = act.isPositive ? '+' : '';

        item.innerHTML = `
            <div class="activity-icon ${act.type}">
                ${iconHtml}
            </div>
            <div class="activity-info">
                <span class="activity-text">${act.text}</span>
                <div class="activity-meta">
                    <span class="activity-points ${pointClass}">${prefix}${act.points} Points</span>
                    <span class="activity-time">${act.time}</span>
                </div>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function renderCommunityLeaderboardMini() {
    const listEl = document.getElementById('community-mini-leaderboard');
    if (!listEl) return;
    listEl.innerHTML = '';

    // Create a sorted list of users
    const userEntities = users.map(u => {
        let pts = 2450;
        const saved = localStorage.getItem(`carbonwise_data_${u.email}`);
        if (saved) {
            try { pts = JSON.parse(saved).points; } catch(e) {}
        }
        return { name: u.name, points: pts, role: u.role, isSelf: (u.email === currentEmail) };
    });

    // Re-rank based on points
    userEntities.sort((a, b) => b.points - a.points);
    userEntities.forEach((u, i) => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${u.isSelf ? 'highlight' : ''}`;
        
        let rankClass = '';
        if (i === 0) rankClass = 'style="background:linear-gradient(135deg, #fde68a, #fbbf24);color:#92400e;"';

        item.innerHTML = `
            <span class="rank" ${rankClass}>${i + 1}</span>
            <img src="assets/avatar.svg" alt="${u.name}" class="user-avatar">
            <div class="lb-info">
                <span class="lb-name">${u.name}</span>
                <span class="lb-title">${u.isSelf ? u.role + ' (You)' : u.role}</span>
            </div>
            <span class="lb-points">${u.points.toLocaleString()} Pts</span>
        `;
        listEl.appendChild(item);
    });
}

function initDynamicCounters() {
    setTimeout(() => {
        if (!currentEmail) return;
        const gp = document.getElementById('green-points-value');
        if (gp) gp.textContent = AppState.points.toLocaleString();
        const carb = document.getElementById('carbon-value');
        if (carb) carb.innerHTML = `${AppState.carbonSaved.toFixed(1)} <small style="font-size:0.8rem;font-weight:600;">kg CO₂</small>`;
        const mon = document.getElementById('money-value');
        if (mon) mon.textContent = `₹${AppState.moneySaved.toLocaleString()}`;
    }, 100);
}

/* =============================================
   Module 1: Track & Earn Page
   ============================================= */
function initTrackPage() {
    // Form Tab Switchers
    const tabBtns = document.querySelectorAll('.track-tab-btn');
    const tabPanes = document.querySelectorAll('.track-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`pane-${tabId}`).classList.add('active');
            updateCalculatorPreview(tabId);
        });
    });

    // Clothes uploading trigger
    const clothesArea = document.getElementById('clothes-upload-area');
    const clothesInput = document.getElementById('clothes-file-input');
    const clothesPreview = document.getElementById('clothes-preview-container');
    const clothesFileName = document.getElementById('clothes-file-name');
    const clothesRemoveBtn = document.getElementById('clothes-remove-btn');

    if (clothesArea) {
        clothesArea.addEventListener('click', (e) => {
            if (!e.target.closest('#clothes-remove-btn')) {
                clothesInput.click();
            }
        });
    }

    if (clothesInput) {
        clothesInput.addEventListener('change', () => {
            if (clothesInput.files && clothesInput.files[0]) {
                clothesFileName.textContent = clothesInput.files[0].name;
                clothesPreview.style.display = 'flex';
                clothesArea.querySelector('.upload-icon').style.color = 'var(--green-600)';
                clothesArea.querySelector('.upload-text').textContent = 'Receipt loaded successfully!';
            }
        });
    }

    if (clothesRemoveBtn) {
        clothesRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            clothesInput.value = '';
            clothesPreview.style.display = 'none';
            clothesArea.querySelector('.upload-icon').style.color = 'var(--gray-400)';
            clothesArea.querySelector('.upload-text').textContent = 'Click to upload or drag donation receipt here';
        });
    }

    // Reusable Bottle Upload trigger
    const bottleArea = document.getElementById('bottle-upload-area');
    const bottleInput = document.getElementById('bottle-file-input');
    const bottlePreview = document.getElementById('bottle-preview-container');
    const bottleImg = document.getElementById('bottle-img-preview');
    const bottleRemoveBtn = document.getElementById('bottle-remove-btn');

    if (bottleArea) {
        bottleArea.addEventListener('click', (e) => {
            if (!e.target.closest('#bottle-remove-btn')) {
                bottleInput.click();
            }
        });
    }

    if (bottleInput) {
        bottleInput.addEventListener('change', () => {
            if (bottleInput.files && bottleInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    bottleImg.src = e.target.result;
                    bottlePreview.style.display = 'block';
                    bottleArea.querySelector('.upload-icon').style.display = 'none';
                    bottleArea.querySelector('.upload-text').style.display = 'none';
                };
                reader.readAsDataURL(bottleInput.files[0]);
            }
        });
    }

    if (bottleRemoveBtn) {
        bottleRemoveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bottleInput.value = '';
            bottlePreview.style.display = 'none';
            bottleArea.querySelector('.upload-icon').style.display = 'block';
            bottleArea.querySelector('.upload-text').style.display = 'block';
        });
    }

    // Form Submission Actions
    const recycleSubmit = document.getElementById('submit-recycle-btn');
    if (recycleSubmit) {
        recycleSubmit.addEventListener('click', () => {
            const qty = parseInt(document.getElementById('recycle-clothing-items').value) || 0;
            if (qty <= 0) {
                showToast('❌ Please specify a valid quantity of clothes.');
                return;
            }
            if (!clothesInput.files[0]) {
                showToast('❌ Please upload a donation proof receipt.');
                return;
            }

            mockOcrScanning(recycleSubmit, 100, `Recycled ${qty} clothing items`, () => {
                AppState.points += 100;
                AppState.carbonSaved += qty * 0.8;
                AppState.activities.unshift({
                    id: Date.now(),
                    type: 'upload',
                    text: `Recycled ${qty} clothing items at Eco Center`,
                    points: 100,
                    time: 'Just now',
                    isPositive: true
                });
                saveState();
                updateUI();
                clothesRemoveBtn.click();
            });
        });
    }

    const bottleSubmit = document.getElementById('submit-bottle-btn');
    if (bottleSubmit) {
        bottleSubmit.addEventListener('click', () => {
            if (!bottleInput.files[0]) {
                showToast('❌ Please take or upload a bottle photo.');
                return;
            }
            mockOcrScanning(bottleSubmit, 50, 'Plastic-free bottle check-in', () => {
                AppState.points += 50;
                AppState.carbonSaved += 0.2;
                AppState.activities.unshift({
                    id: Date.now(),
                    type: 'upload',
                    text: 'Used reusable water bottle today',
                    points: 50,
                    time: 'Just now',
                    isPositive: true
                });
                saveState();
                updateUI();
                bottleRemoveBtn.click();
            });
        });
    }

    const ecoshopSubmit = document.getElementById('submit-ecoshop-btn');
    if (ecoshopSubmit) {
        ecoshopSubmit.addEventListener('click', () => {
            const brand = document.getElementById('ecoshop-brand').value;
            const bill = document.getElementById('ecoshop-bill-id').value.trim();
            const amount = parseInt(document.getElementById('ecoshop-amount').value) || 0;

            if (!bill) {
                showToast('❌ Please enter the receipt invoice number.');
                return;
            }
            if (amount <= 0) {
                showToast('❌ Please specify a valid transaction amount.');
                return;
            }

            mockOcrScanning(ecoshopSubmit, 150, `Sustainable brand checkout at ${brand}`, () => {
                AppState.points += 150;
                AppState.carbonSaved += 1.5;
                AppState.activities.unshift({
                    id: Date.now(),
                    type: 'purchase',
                    text: `Log purchase receipt from ${brand}`,
                    points: 150,
                    time: 'Just now',
                    isPositive: true
                });
                saveState();
                updateUI();
                document.getElementById('ecoshop-bill-id').value = '';
            });
        });
    }

    const transportSubmit = document.getElementById('submit-transport-btn');
    if (transportSubmit) {
        transportSubmit.addEventListener('click', () => {
            const mode = document.getElementById('transport-mode').value;
            const dist = parseFloat(document.getElementById('transport-distance').value) || 0;

            if (dist <= 0) {
                showToast('❌ Distance must be greater than zero.');
                return;
            }

            let ptsMultiplier = 10;
            let co2Factor = 0.22;
            if (mode === 'Walking') {
                ptsMultiplier = 12;
                co2Factor = 0.24;
            } else if (mode === 'Public Transit') {
                ptsMultiplier = 6;
                co2Factor = 0.15;
            } else if (mode === 'Electric Vehicle') {
                ptsMultiplier = 4;
                co2Factor = 0.10;
            }

            const calculatedPoints = Math.min(Math.round(dist * ptsMultiplier), 80);
            const co2Saved = dist * co2Factor;

            mockOcrScanning(transportSubmit, calculatedPoints, `Commuted green: ${dist}km ${mode}`, () => {
                AppState.points += calculatedPoints;
                AppState.carbonSaved += co2Saved;
                AppState.moneySaved += Math.round(dist * 6);
                AppState.activities.unshift({
                    id: Date.now(),
                    type: 'challenge',
                    text: `Commuted via ${mode} for ${dist} km`,
                    points: calculatedPoints,
                    time: 'Just now',
                    isPositive: true
                });
                saveState();
                updateUI();
            });
        });
    }

    // Update previews
    const transportDist = document.getElementById('transport-distance');
    if (transportDist) transportDist.addEventListener('input', () => updateCalculatorPreview('transport'));
    const transportMode = document.getElementById('transport-mode');
    if (transportMode) transportMode.addEventListener('change', () => updateCalculatorPreview('transport'));
    const clothesQty = document.getElementById('recycle-clothing-items');
    if (clothesQty) clothesQty.addEventListener('input', () => updateCalculatorPreview('clothes'));
    const ecoshopAmount = document.getElementById('ecoshop-amount');
    if (ecoshopAmount) ecoshopAmount.addEventListener('input', () => updateCalculatorPreview('ecoshop'));
}

function updateCalculatorPreview(tabId) {
    const co2El = document.getElementById('calc-co2-preview');
    const moneyEl = document.getElementById('calc-money-preview');
    const tipEl = document.getElementById('dynamic-eco-tip');

    if (!co2El || !moneyEl) return;

    if (tabId === 'clothes') {
        const qty = parseInt(document.getElementById('recycle-clothing-items').value) || 0;
        co2El.textContent = `${(qty * 0.8).toFixed(1)} kg CO₂`;
        moneyEl.textContent = `₹${qty * 50}`;
        tipEl.textContent = 'Recycling 1kg of cotton fabric saves approx 30kg of water compared to producing a new one from scratch!';
    } else if (tabId === 'bottle') {
        co2El.textContent = '0.2 kg CO₂';
        moneyEl.textContent = '₹20';
        tipEl.textContent = 'Using a single reusable flask for 1 year avoids over 150 single-use plastic water bottles ending in landfills.';
    } else if (tabId === 'ecoshop') {
        const amount = parseInt(document.getElementById('ecoshop-amount').value) || 0;
        co2El.textContent = `${(amount * 0.003).toFixed(1)} kg CO₂`;
        moneyEl.textContent = `₹${Math.round(amount * 0.1)}`;
        tipEl.textContent = 'Investing in green products supports carbon-offsetting initiatives globally and reduces chemical run-offs.';
    } else if (tabId === 'transport') {
        const dist = parseFloat(document.getElementById('transport-distance').value) || 0;
        const mode = document.getElementById('transport-mode').value;
        let factor = 0.22;
        let cost = 6;
        if (mode === 'Walking') { factor = 0.24; cost = 8; }
        else if (mode === 'Public Transit') { factor = 0.15; cost = 4; }
        else if (mode === 'Electric Vehicle') { factor = 0.10; cost = 2; }

        co2El.textContent = `${(dist * factor).toFixed(1)} kg CO₂`;
        moneyEl.textContent = `₹${Math.round(dist * cost)}`;
        tipEl.textContent = `Choosing ${mode} avoids gasoline exhaust emissions, contributing directly to healthier metropolitan air.`;
    }
}

function mockOcrScanning(buttonEl, points, actionDesc, callback) {
    const origHtml = buttonEl.innerHTML;
    buttonEl.disabled = true;
    buttonEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI Scanning Receipt/Photo...';

    setTimeout(() => {
        buttonEl.innerHTML = '<i class="fa-solid fa-microchip"></i> Analyzing Green Impact...';
        setTimeout(() => {
            buttonEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> Action Verified!';
            showToast(`🎉 Verified! ${actionDesc}. +${points} Points credited!`);
            
            triggerConfetti();

            setTimeout(() => {
                buttonEl.disabled = false;
                buttonEl.innerHTML = origHtml;
                callback();
            }, 1000);
        }, 1200);
    }, 1500);
}

function triggerConfetti() {
    const colors = ['#22c55e', '#4ade80', '#fbbf24', '#3b82f6', '#f43f5e'];
    for (let i = 0; i < 60; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: ${Math.random() * 8 + 6}px;
            height: ${Math.random() * 12 + 6}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}vw;
            border-radius: 2px;
            z-index: 99999;
            transform: rotate(${Math.random() * 360}deg);
            opacity: 0.9;
            animation: confettiFall ${Math.random() * 2 + 1.5}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3500);
    }

    if (!document.getElementById('confetti-styles')) {
        const style = document.createElement('style');
        style.id = 'confetti-styles';
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* =============================================
   Module 2: AI Insights Chatbot
   ============================================= */
function initInsightsPage() {
    const sendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-user-input');
    const messagesBox = document.getElementById('chat-messages-box');
    const chips = document.querySelectorAll('.chip-btn');

    if (!sendBtn || !chatInput || !messagesBox) return;

    sendBtn.addEventListener('click', () => handleUserMessage());
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });

    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chatInput.value = chip.textContent;
            handleUserMessage();
        });
    });

    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        chatInput.value = '';

        const typingId = appendTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator(typingId);
            const response = generateAIResponse(text);
            appendMessage(response, 'bot');
        }, 1500);
    }

    function appendMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.className = `message ${sender}`;
        bubble.innerHTML = `<p>${text}</p>`;
        messagesBox.appendChild(bubble);
        messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    function appendTypingIndicator() {
        const div = document.createElement('div');
        const uniqueId = 'typing-' + Date.now();
        div.id = uniqueId;
        div.className = 'message bot typing-indicator-bubble';
        div.innerHTML = `<p style="display:flex;gap:3px;"><span class="dot-blink">.</span><span class="dot-blink" style="animation-delay:0.2s">.</span><span class="dot-blink" style="animation-delay:0.4s">.</span></p>`;
        messagesBox.appendChild(div);
        messagesBox.scrollTop = messagesBox.scrollHeight;
        return uniqueId;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function generateAIResponse(query) {
        const q = query.toLowerCase();
        
        if (q.includes('electricity') || q.includes('bill') || q.includes('energy') || q.includes('power')) {
            return `Based on your recent utilities invoice:
            <br>• Standby power drains account for 18% of your excess electricity. Try unplugging chargers and appliances when not in use.
            <br>• Consider replacing old bulbs with smart LED lamps (saves up to 80% lighting energy).
            <br>• Switch on the **Energy Saver Challenge** in the challenges tab to claim points!`;
        }
        if (q.includes('water') || q.includes('shower') || q.includes('droplet') || q.includes('tap')) {
            return `Looking at your meter usage, your consumption rose by 12%. Here are key conservation metrics:
            <br>• Shortening showers by 2 minutes conserves up to 40 liters of clean water daily.
            <br>• Check and repair leaking faucets. A single dripping faucet can waste 5,000+ liters per year.
            <br>• Installing aerators on taps limits spray volume while keeping utility water pressure high!`;
        }
        if (q.includes('cycle') || q.includes('commute') || q.includes('walk') || q.includes('transport') || q.includes('transit')) {
            return `Commuting green is one of the highest leverage eco actions:
            <br>• You saved 80kg CO₂ last month by walking/cycling! That is a stellar 15% drop in carbon footprint.
            <br>• Replacing solo car rides with metro/transit saves around ₹150 daily and lowers city emission load.
            <br>• Try our **Cycle for Tomorrow Challenge** to push your points checklist further!`;
        }
        
        return `Interesting query! Small adjustments in water usage, local shopping, energy, and transit habits create massive cumulative benefits. 
        <br><br>I recommend logging daily actions inside the **Track & Earn** page or joining one of our curated **Challenges**! Let me know if you want tips on specific categories (e.g. Energy, Water, Transit).`;
    }

    if (!document.getElementById('chat-blink-styles')) {
        const style = document.createElement('style');
        style.id = 'chat-blink-styles';
        style.textContent = `
            .dot-blink {
                animation: chatBlink 1.4s infinite;
                font-weight: 800;
                font-size: 1.2rem;
                line-height: 0.5;
            }
            @keyframes chatBlink {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* =============================================
   Module 3: Challenges Page
   ============================================= */
function initChallengesPage() {
    const tabs = document.querySelectorAll('.challenge-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = tab.getAttribute('data-tab');
            if (tabId === 'active') {
                document.getElementById('challenges-active-pane').style.display = 'block';
                document.getElementById('challenges-available-pane').style.display = 'none';
            } else {
                document.getElementById('challenges-active-pane').style.display = 'none';
                document.getElementById('challenges-available-pane').style.display = 'block';
            }
        });
    });

    renderChallenges();
}

function renderChallenges() {
    const activeGrid = document.getElementById('active-challenges-grid');
    const availableGrid = document.getElementById('available-challenges-grid');
    
    if (!activeGrid || !availableGrid) return;
    
    activeGrid.innerHTML = '';
    availableGrid.innerHTML = '';

    let activeCount = 0;
    let availableCount = 0;

    AppState.challenges.forEach(c => {
        const card = document.createElement('div');
        card.className = 'challenge-card';
        
        const isCompleted = c.current >= c.target;
        const progressPercent = Math.min(Math.round((c.current / c.target) * 100), 100);

        let actionButtonHtml = '';
        if (c.joined) {
            if (isCompleted) {
                actionButtonHtml = `<button class="btn-challenge-action completed" disabled>✓ Completed</button>`;
            } else {
                actionButtonHtml = `<button class="btn-challenge-action checkin" data-id="${c.id}">Daily Check-In (+${Math.round(c.points / c.target)} Pts)</button>`;
            }
        } else {
            actionButtonHtml = `<button class="btn-challenge-action join" data-id="${c.id}">Join Challenge</button>`;
        }

        const unit = c.unit || 'days';
        const progressText = `${c.current}/${c.target} ${unit}`;

        card.innerHTML = `
            <div class="challenge-card-header">
                <div class="challenge-card-icon ${c.iconClass}">
                    <i class="fa-solid ${c.icon}"></i>
                </div>
                <div class="challenge-card-title">
                    <h3>${c.name}</h3>
                    <span>+${c.points} Points Awarded</span>
                </div>
            </div>
            <div class="challenge-card-body">
                <p>${c.desc}</p>
            </div>
            <div class="challenge-card-progress">
                <div class="challenge-progress-meta">
                    <span>Progress</span>
                    <span>${progressText}</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="fill" style="width: ${progressPercent}%;"></div>
                </div>
            </div>
            ${actionButtonHtml}
        `;

        if (c.joined) {
            activeGrid.appendChild(card);
            activeCount++;
        } else {
            availableGrid.appendChild(card);
            availableCount++;
        }
    });

    if (activeCount === 0) {
        activeGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);">No active challenges. Join one from the available tab!</div>';
    }
    if (availableCount === 0) {
        availableGrid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400);">You have joined all available challenges! Check them in the active tab.</div>';
    }

    // Set up check-in / join listeners
    document.querySelectorAll('.challenge-card .checkin').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            challengeCheckIn(id);
        });
    });

    document.querySelectorAll('.challenge-card .join').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            joinChallenge(id);
        });
    });
}

function joinChallenge(id) {
    const c = AppState.challenges.find(item => item.id === id);
    if (!c) return;

    c.joined = true;
    showToast(`🔔 Joined! "${c.name}" challenge is now active.`);
    saveState();
    updateUI();
    renderChallenges();
}

function challengeCheckIn(id) {
    const c = AppState.challenges.find(item => item.id === id);
    if (!c) return;

    const pointsGained = Math.round(c.points / c.target);
    c.current += 1;

    AppState.points += pointsGained;
    AppState.activities.unshift({
        id: Date.now(),
        type: 'challenge',
        text: `Checked in: "${c.name}" (${c.current}/${c.target})`,
        points: pointsGained,
        time: 'Just now',
        isPositive: true
    });

    if (c.current >= c.target) {
        showToast(`🏆 Congratulations! Completed "${c.name}"!`);
        openModal(
            'Challenge Completed! 🏆',
            `<div style="text-align:center;padding:12px;">
                <div style="font-size:3.5rem;color:var(--yellow-500);margin-bottom:12px;"><i class="fa-solid fa-trophy"></i></div>
                <p style="font-weight:600;font-size:1.05rem;color:var(--gray-800);margin-bottom:6px;">You completed: ${c.name}</p>
                <p style="font-size:0.85rem;color:var(--gray-500);margin-bottom:16px;">You have successfully finalized all ${c.target} check-ins, offsetting carbon emissions and proving your green commitment!</p>
                <div style="font-size:1.1rem;font-weight:800;color:var(--green-600);background:var(--green-50);padding:10px;border-radius:8px;display:inline-block;">+${c.points} Total Points Claimed</div>
            </div>`
        );
        triggerConfetti();
    } else {
        showToast(`✓ Check-in successful! +${pointsGained} Points earned.`);
    }

    saveState();
    updateUI();
    renderChallenges();
}

/* =============================================
   Module 4: Sustainable Marketplace
   ============================================= */
function initMarketplacePage() {
    renderMarketplace();
}

function renderMarketplace() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    AppState.marketplaceProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <i class="fa-solid ${p.icon}"></i>
            </div>
            <div class="product-info">
                <h4 class="product-title">${p.name}</h4>
                <p class="product-desc">${p.desc}</p>
                <div class="product-meta">
                    <span class="product-cost"><i class="fa-solid fa-seedling"></i> ${p.cost} pts</span>
                    <button class="btn-buy-product" data-id="${p.id}">Buy Product</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.btn-buy-product').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            purchaseProduct(id);
        });
    });
}

function purchaseProduct(id) {
    const p = AppState.marketplaceProducts.find(item => item.id === id);
    if (!p) return;

    if (AppState.points < p.cost) {
        showToast('❌ Insufficient points balance to purchase this product.');
        return;
    }

    AppState.points -= p.cost;
    AppState.activities.unshift({
        id: Date.now(),
        type: 'reward',
        text: `Purchased item: ${p.name}`,
        points: -p.cost,
        time: 'Just now',
        isPositive: false
    });

    const orderId = `CW-${Math.floor(100000 + Math.random() * 900000)}`;
    openModal(
        'Purchase Receipt 🧾',
        `<div style="padding:4px;">
            <p style="font-weight:700;color:var(--green-600);margin-bottom:8px;"><i class="fa-solid fa-circle-check"></i> Order Confirmed!</p>
            <p style="font-size:0.85rem;color:var(--gray-600);margin-bottom:12px;">Thank you for shopping green. Your order details are below:</p>
            <div style="background:var(--gray-50);padding:14px;border-radius:8px;font-size:0.82rem;display:flex;flex-direction:column;gap:6px;border:1px solid var(--gray-200);margin-bottom:16px;">
                <div><strong>Product:</strong> ${p.name}</div>
                <div><strong>Points Spent:</strong> ${p.cost} Points</div>
                <div><strong>Order Reference:</strong> ${orderId}</div>
                <div><strong>Shipping Address:</strong> Associated with Green Account (${AppState.user.name})</div>
                <div><strong>Estimated Delivery:</strong> 3 Business Days</div>
            </div>
            <p style="font-size:0.75rem;color:var(--gray-400);line-height:1.4;">A shipping confirmation email along with trackers has been dispatched. Track your delivery stages in system messages.</p>
        </div>`
    );

    saveState();
    updateUI();
    renderMarketplace();
}

/* =============================================
   Module 5: Brand Vouchers (Rewards)
   ============================================= */
function initRewardsPage() {
    renderRewards();
}

function renderRewards() {
    const couponList = document.getElementById('rewards-coupons-list');
    const walletList = document.getElementById('vouchers-wallet-list');
    
    if (!couponList || !walletList) return;

    couponList.innerHTML = '';
    AppState.brandVouchers.forEach(v => {
        const item = document.createElement('div');
        item.className = 'coupon-item-row';
        item.innerHTML = `
            <div class="coupon-brand-badge" style="background:${v.bg};color:${v.color};">${v.brand}</div>
            <div class="coupon-details">
                <span class="coupon-title">${v.desc}</span>
                <span class="coupon-points">${v.points} Points</span>
            </div>
            <button class="btn-redeem-reward" data-id="${v.id}">Redeem Coupon</button>
        `;
        couponList.appendChild(item);
    });

    walletList.innerHTML = '';
    if (AppState.redeemedVouchers.length === 0) {
        walletList.innerHTML = '<div class="empty-wallet-message"><i class="fa-solid fa-wallet" style="font-size:2rem;margin-bottom:8px;display:block;"></i>No active vouchers. Redeem brand coupons on the left!</div>';
    } else {
        AppState.redeemedVouchers.forEach((w, index) => {
            const item = document.createElement('div');
            item.className = 'wallet-item-card';
            item.innerHTML = `
                <div class="wallet-info">
                    <h4>${w.brand} - Coupon Code</h4>
                    <p>${w.desc}</p>
                </div>
                <div class="wallet-code-container">
                    <span class="wallet-code-badge">${w.code}</span>
                    <button class="wallet-copy-btn" data-code="${w.code}"><i class="fa-solid fa-copy"></i></button>
                </div>
            `;
            walletList.appendChild(item);
        });
    }

    document.querySelectorAll('.btn-redeem-reward').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            redeemVoucher(id);
        });
    });

    document.querySelectorAll('.wallet-copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const code = btn.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                showToast('📋 Coupon code copied to clipboard!');
                btn.innerHTML = '<i class="fa-solid fa-check" style="color:var(--green-600)"></i>';
                setTimeout(() => btn.innerHTML = '<i class="fa-solid fa-copy"></i>', 2000);
            });
        });
    });
}

function redeemVoucher(id) {
    const v = AppState.brandVouchers.find(item => item.id === id);
    if (!v) return;

    if (AppState.points < v.points) {
        showToast('❌ Insufficient points balance to redeem this voucher.');
        return;
    }

    openModal(
        'Confirm Voucher Redemption',
        `<div style="padding:4px;">
            <p style="font-size:0.88rem;color:var(--gray-700);margin-bottom:12px;">Redeem **${v.desc}** from **${v.brand}**?</p>
            <p style="font-size:0.82rem;color:var(--gray-50);background:var(--green-600);padding:8px;border-radius:6px;display:inline-block;margin-bottom:12px;">-${v.points} Points deducted</p>
            <div class="modal-body-buttons">
                <button class="modal-btn-cancel" id="cancel-redeem-btn">Cancel</button>
                <button class="modal-btn-confirm" id="confirm-redeem-btn">Confirm Redemption</button>
            </div>
        </div>`
    );

    document.getElementById('cancel-redeem-btn').addEventListener('click', () => closeModal());
    document.getElementById('confirm-redeem-btn').addEventListener('click', () => {
        closeModal();
        
        AppState.points -= v.points;
        AppState.activities.unshift({
            id: Date.now(),
            type: 'reward',
            text: `Redeemed coupon code for ${v.brand}`,
            points: -v.points,
            time: 'Just now',
            isPositive: false
        });

        AppState.redeemedVouchers.push({
            brand: v.brand,
            desc: v.desc,
            code: `${v.brand.replace(/\s+/g, '').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
        });

        saveState();
        updateUI();
        renderRewards();

        const latestRedeemed = AppState.redeemedVouchers[AppState.redeemedVouchers.length - 1];
        openModal(
            'Voucher Claimed! 🎉',
            `<div style="text-align:center;padding:10px;">
                <div style="font-size:3rem;color:var(--green-600);margin-bottom:10px;"><i class="fa-solid fa-ticket"></i></div>
                <p style="font-weight:700;font-size:1.05rem;color:var(--gray-800);margin-bottom:4px;">${v.brand} Discount Code</p>
                <p style="font-size:0.82rem;color:var(--gray-500);margin-bottom:16px;">Use code at checkout on the brand's sustainable shop:</p>
                <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:18px;">
                    <span style="font-family:monospace;font-size:1.3rem;font-weight:800;background:var(--green-50);padding:8px 20px;border-radius:6px;color:var(--green-700);border:1px dashed var(--green-300);">${latestRedeemed.code}</span>
                    <button class="action-submit-btn" id="modal-copy-code-btn" style="width:auto;margin:0;padding:10px 14px;"><i class="fa-solid fa-copy"></i> Copy</button>
                </div>
                <p style="font-size:0.75rem;color:var(--gray-400);">This voucher is now saved under "My Redeemed Vouchers" wallet for future access.</p>
            </div>`
        );

        document.getElementById('modal-copy-code-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(latestRedeemed.code).then(() => {
                showToast('📋 Code copied to clipboard!');
                document.getElementById('modal-copy-code-btn').innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            });
        });
    });
}

/* =============================================
   Module 6: Community Page Feed
   ============================================= */
function initCommunityPage() {
    const postPhotoBtn = document.getElementById('post-add-photo');
    const photoStatus = document.getElementById('post-photo-status');
    const postText = document.getElementById('community-post-text');
    const submitPostBtn = document.getElementById('submit-post-btn');

    if (!postPhotoBtn || !postText || !submitPostBtn) return;

    let attachedPhoto = false;

    postPhotoBtn.addEventListener('click', () => {
        attachedPhoto = !attachedPhoto;
        if (attachedPhoto) {
            photoStatus.style.display = 'inline';
            postPhotoBtn.style.borderColor = 'var(--green-500)';
            postPhotoBtn.style.color = 'var(--green-600)';
        } else {
            photoStatus.style.display = 'none';
            postPhotoBtn.style.borderColor = '';
            postPhotoBtn.style.color = '';
        }
    });

    submitPostBtn.addEventListener('click', () => {
        const text = postText.value.trim();
        if (!text) {
            showToast('❌ Post content cannot be empty.');
            return;
        }

        const newPost = {
            id: Date.now(),
            author: AppState.user.name,
            role: AppState.user.role,
            avatar: 'assets/avatar.svg',
            content: text,
            action: attachedPhoto ? 'Eco Action Photo' : 'Green Habit Info',
            likes: 0,
            liked: false,
            comments: []
        };

        AppState.communityPosts.unshift(newPost);
        
        AppState.points += 10;
        AppState.activities.unshift({
            id: Date.now(),
            type: 'upload',
            text: 'Shared green action on Community Feed',
            points: 10,
            time: 'Just now',
            isPositive: true
        });

        postText.value = '';
        attachedPhoto = false;
        photoStatus.style.display = 'none';
        postPhotoBtn.style.borderColor = '';
        postPhotoBtn.style.color = '';

        showToast('📣 Action posted successfully! +10 Points claimed.');
        saveState();
        updateUI();
        renderCommunity();
    });

    renderCommunity();
}

function renderCommunity() {
    const stream = document.getElementById('community-feed-stream');
    if (!stream) return;

    stream.innerHTML = '';
    AppState.communityPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'feed-post-card';
        
        let commentsHtml = '';
        post.comments.forEach(c => {
            commentsHtml += `
                <div class="comment-item">
                    <strong>${c.author}:</strong> ${c.text}
                </div>
            `;
        });

        let mediaHtml = '';
        if (post.id === 1) {
            mediaHtml = `<div class="post-media-box"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(createCyclingPostSVG())}" alt="Cycle drive"></div>`;
        } else if (post.id === 2) {
            mediaHtml = `<div class="post-media-box"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(createClothesPostSVG())}" alt="Clothing drive"></div>`;
        } else if (post.action === 'Eco Action Photo') {
            mediaHtml = `<div class="post-media-box"><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(createGeneralPostSVG())}" alt="Eco habit photo"></div>`;
        }

        card.innerHTML = `
            <div class="post-author-row">
                <div class="author-info">
                    <img src="assets/avatar.svg" alt="${post.author}" class="mini-avatar post-user-avatar">
                    <div class="author-text">
                        <h5>${post.author}</h5>
                        <span>${post.role}</span>
                    </div>
                </div>
                <span class="post-action-badge">${post.action}</span>
            </div>
            <p class="post-content-text">${post.content}</p>
            ${mediaHtml}
            <div class="post-actions-row">
                <button class="post-act-btn ${post.liked ? 'liked' : ''}" data-id="${post.id}">
                    <i class="fa-${post.liked ? 'solid' : 'regular'} fa-heart"></i> Like (${post.likes})
                </button>
                <div style="color:var(--gray-400);font-size:0.82rem;display:flex;align-items:center;gap:6px;">
                    <i class="fa-regular fa-comment"></i> Comments (${post.comments.length})
                </div>
            </div>
            <div class="post-comments-box">
                ${commentsHtml}
                <div class="post-comment-input-row">
                    <input type="text" placeholder="Type a comment..." data-post-id="${post.id}">
                    <button class="comment-submit-btn" data-post-id="${post.id}"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        stream.appendChild(card);
    });

    document.querySelectorAll('.post-act-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            toggleLikePost(id);
        });
    });

    document.querySelectorAll('.comment-submit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-post-id'));
            submitComment(id);
        });
    });

    document.querySelectorAll('.post-comment-input-row input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const id = parseInt(input.getAttribute('data-post-id'));
                submitComment(id);
            }
        });
    });

    const avatars = document.querySelectorAll('.post-user-avatar');
    avatars.forEach(img => {
        img.onerror = function() {
            this.src = createAvatarDataURL();
        };
    });
}

function toggleLikePost(id) {
    const post = AppState.communityPosts.find(item => item.id === id);
    if (!post) return;

    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
    }
    saveState();
    renderCommunity();
}

function submitComment(id) {
    const input = document.querySelector(`.post-comment-input-row input[data-post-id="${id}"]`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    const post = AppState.communityPosts.find(item => item.id === id);
    if (!post) return;

    post.comments.push({
        author: AppState.user.name,
        text: text
    });

    input.value = '';
    saveState();
    renderCommunity();
}

function createCyclingPostSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="500" height="240" style="background:#e0f2fe;border-radius:8px;">
        <rect x="0" y="0" width="500" height="240" fill="#bae6fd" />
        <path d="M0 160 Q 150 120 300 170 T 500 150 L 500 240 L 0 240 Z" fill="#38bdf8" />
        <path d="M0 190 Q 200 160 380 200 T 500 180 L 500 240 L 0 240 Z" fill="#0284c7" />
        <circle cx="180" cy="180" r="28" stroke="#0f172a" stroke-width="4" fill="none" />
        <circle cx="280" cy="180" r="28" stroke="#0f172a" stroke-width="4" fill="none" />
        <path d="M180 180 L 220 120 L 290 120 L 280 180" stroke="#0f172a" stroke-width="4" fill="none" />
        <path d="M220 120 L 250 180 L 180 180" stroke="#0f172a" stroke-width="4" fill="none" />
        <path d="M220 120 L 205 100 L 225 100" stroke="#0f172a" stroke-width="4" fill="none" />
        <path d="M290 120 L 295 105 L 285 105" stroke="#0f172a" stroke-width="4" fill="none" />
        <circle cx="420" cy="60" r="30" fill="#fef08a" />
        <ellipse cx="60" cy="80" rx="14" ry="8" fill="#4ade80" transform="rotate(-30 60 80)" />
        <ellipse cx="78" cy="74" rx="10" ry="6" fill="#22c55e" transform="rotate(20 78 74)" />
    </svg>`;
}

function createClothesPostSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="500" height="240" style="background:#e8f5e9;border-radius:8px;">
        <rect x="0" y="0" width="500" height="240" fill="#c8e6c9" />
        <rect x="190" y="60" width="120" height="130" rx="8" fill="#81c784" />
        <path d="M 190 85 L 140 105 L 155 125 L 190 110 Z" fill="#81c784" />
        <path d="M 310 85 L 360 105 L 345 125 L 310 110 Z" fill="#81c784" />
        <path d="M 230 60 Q 250 80 270 60 Z" fill="#c8e6c9" />
        <circle cx="250" cy="120" r="22" fill="none" stroke="#1b5e20" stroke-width="3" />
        <path d="M 238 108 L 250 98 L 262 108" stroke="#1b5e20" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M 262 132 L 250 142 L 238 132" stroke="#1b5e20" stroke-width="3" fill="none" stroke-linecap="round" />
    </svg>`;
}

function createGeneralPostSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 240" width="500" height="240" style="background:#fef3c7;border-radius:8px;">
        <rect x="0" y="0" width="500" height="240" fill="#fde68a" />
        <rect x="220" y="140" width="60" height="60" rx="4" fill="#d97706" />
        <ellipse cx="250" cy="140" rx="28" ry="8" fill="#78350f" />
        <path d="M 250 140 Q 240 100 250 60" stroke="#059669" stroke-width="5" fill="none" stroke-linecap="round" />
        <ellipse cx="236" cy="100" rx="14" ry="8" fill="#10b981" transform="rotate(-30 236 100)" />
        <ellipse cx="264" cy="85" rx="16" ry="9" fill="#059669" transform="rotate(30 264 85)" />
        <polygon points="120,40 123,48 131,50 123,52 120,60 117,52 109,50 117,48" fill="#fbbf24" />
        <polygon points="380,80 382,86 388,88 382,90 380,96 378,90 372,88 378,86" fill="#fbbf24" />
    </svg>`;
}

/* =============================================
   Module 7: Impact Report & Certificate
   ============================================= */
function initImpactPage() {
    const certBtn = document.getElementById('generate-certificate-btn');
    if (certBtn) {
        certBtn.addEventListener('click', () => renderCertificateModal());
    }
    renderImpactPage();
}

function renderImpactPage() {
    if (!currentEmail) return;
    
    // Dynamic values based on app state
    const treesCountEl = document.getElementById('impact-trees-count');
    if (treesCountEl) treesCountEl.textContent = `${(AppState.points / 1000).toFixed(1)} Trees`;
    const waterCountEl = document.getElementById('impact-water-count');
    if (waterCountEl) waterCountEl.textContent = `${(AppState.carbonSaved * 15).toFixed(0)} L`;
    const co2CountEl = document.getElementById('impact-co2-count');
    if (co2CountEl) co2CountEl.textContent = `${AppState.carbonSaved.toFixed(1)} kg`;

    // Dynamic certificate updates
    const certName = document.getElementById('cert-display-name');
    if (certName) certName.textContent = AppState.user.name;
    const certPoints = document.getElementById('cert-display-points');
    if (certPoints) certPoints.textContent = AppState.points.toLocaleString();
    const certCo2 = document.getElementById('cert-display-co2');
    if (certCo2) certCo2.textContent = `${AppState.carbonSaved.toFixed(1)} kg`;

    const dateSign = document.getElementById('cert-date-sign');
    if (dateSign) {
        const d = new Date();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        dateSign.textContent = `${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    renderForestVisual();
}

function renderForestVisual() {
    let forestBox = document.getElementById('impact-forest-box');
    if (!forestBox) {
        const metricsGrid = document.querySelector('.impact-metrics-grid');
        if (!metricsGrid) return;
        
        forestBox = document.createElement('div');
        forestBox.id = 'impact-forest-box';
        forestBox.style.cssText = `
            grid-column: 1 / -1;
            background: var(--bg-card);
            border: 1px solid var(--gray-200);
            border-radius: var(--radius-lg);
            padding: 20px;
            margin-top: 10px;
            text-align: center;
        `;
        metricsGrid.parentNode.insertBefore(forestBox, metricsGrid.nextSibling);
    }

    const treesCount = Math.max(Math.floor(AppState.points / 500), 1);
    
    let treesSvgHtml = '';
    for (let i = 0; i < treesCount; i++) {
        treesSvgHtml += `
        <svg viewBox="0 0 60 80" width="50" height="60" class="forest-tree" style="animation: growTree 1s ease-out forwards; animation-delay:${i * 0.15}s; transform:scale(0); transform-origin:bottom center; margin:0 4px;">
            <rect x="27" y="50" width="6" height="30" fill="#78350f" rx="2" />
            <circle cx="30" cy="30" r="22" fill="#166534" />
            <circle cx="20" cy="40" r="16" fill="#15803d" />
            <circle cx="40" cy="36" r="14" fill="#166534" />
            <circle cx="30" cy="22" r="18" fill="#16a34a" />
            <circle cx="28" cy="28" r="8" fill="#22c55e" opacity="0.3" />
        </svg>`;
    }

    forestBox.innerHTML = `
        <h3 style="font-size:1.05rem;font-weight:700;color:var(--gray-800);margin-bottom:6px;">My Virtual Forest 🌳</h3>
        <p style="font-size:0.8rem;color:var(--gray-400);margin-bottom:16px;">You grow 1 tree for every 500 Green Points accumulated. Total Grown: <strong>${treesCount} Trees</strong></p>
        <div style="display:flex;align-items:flex-end;justify-content:center;flex-wrap:wrap;min-height:90px;background:var(--gray-50);border-radius:10px;padding:20px;border:1px solid var(--gray-150)">
            ${treesSvgHtml}
        </div>
    `;

    if (!document.getElementById('forest-grow-styles')) {
        const style = document.createElement('style');
        style.id = 'forest-grow-styles';
        style.textContent = `
            @keyframes growTree {
                to { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
}

function renderCertificateModal() {
    const certHtml = document.getElementById('cert-render-area').outerHTML;
    
    openModal(
        'Generate Eco Certificate 🎓',
        `<div style="text-align:center;">
            <div id="print-cert-container" style="margin-bottom:20px;">
                ${certHtml}
            </div>
            <div class="modal-body-buttons" style="justify-content:center;">
                <button class="modal-btn-cancel" id="print-cert-close">Close</button>
                <button class="modal-btn-confirm" id="print-cert-action"><i class="fa-solid fa-print"></i> Print / Download PDF</button>
            </div>
        </div>`
    );

    document.getElementById('print-cert-close').addEventListener('click', () => closeModal());
    document.getElementById('print-cert-action').addEventListener('click', () => {
        const printContent = document.getElementById('print-cert-container').innerHTML;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
                <head>
                    <title>Green Impact Certificate - ${AppState.user.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                        body {
                            font-family: 'Inter', sans-serif;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                            margin: 0;
                            background: #eaeaea;
                        }
                        .cert-preview-card {
                            width: 100%;
                            max-width: 680px;
                            background: #fbfbf7;
                            padding: 20px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                            color: #2c3e2e;
                        }
                        .cert-border {
                            border: 8px double #a1824a;
                            padding: 24px;
                        }
                        .cert-inner-border {
                            border: 1px solid rgba(161, 130, 74, 0.4);
                            padding: 30px 20px;
                            text-align: center;
                            position: relative;
                        }
                        .cert-leaf-icon {
                            font-size: 2.2rem;
                            color: #16a34a;
                            margin-bottom: 12px;
                        }
                        .cert-header h2 {
                            font-family: serif;
                            font-size: 1.6rem;
                            letter-spacing: 1.5px;
                            font-weight: 700;
                            color: #1a3c20;
                            margin: 0;
                        }
                        .cert-sub {
                            font-size: 0.72rem;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            color: #a1824a;
                            margin-top: 4px;
                        }
                        .cert-body {
                            margin: 30px 0;
                        }
                        .cert-text {
                            font-size: 0.82rem;
                            font-style: italic;
                            color: #6b7280;
                        }
                        .cert-user-name {
                            font-family: serif;
                            font-size: 2rem;
                            font-weight: 700;
                            color: #1a3c20;
                            margin: 12px 0;
                            border-bottom: 2px solid rgba(161, 130, 74, 0.3);
                            display: inline-block;
                            padding: 0 40px;
                        }
                        .cert-achievement-desc {
                            font-size: 0.85rem;
                            line-height: 1.5;
                            max-width: 85%;
                            margin: 0 auto;
                            color: #2c3e2e;
                        }
                        .cert-footer {
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                            margin-top: 40px;
                        }
                        .signature-block {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            width: 150px;
                        }
                        .signature-line {
                            border-bottom: 1px solid #2c3e2e;
                            width: 100%;
                            padding-bottom: 4px;
                            font-size: 0.95rem;
                        }
                        .font-signature {
                            font-family: 'Brush Script MT', cursive, serif;
                            font-size: 1.3rem;
                            color: #1a3c20;
                        }
                        .signature-title {
                            font-size: 0.65rem;
                            color: #9ca3af;
                            text-transform: uppercase;
                            margin-top: 4px;
                        }
                        .cert-stamp {
                            width: 64px;
                            height: 64px;
                            border-radius: 50%;
                            border: 2px dashed #a1824a;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            color: #a1824a;
                            transform: rotate(-10deg);
                        }
                        .cert-stamp i {
                            font-size: 1.2rem;
                        }
                        .cert-stamp span {
                            font-size: 0.55rem;
                            font-weight: 700;
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => window.close(), 500);
                        }
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    });
}

/* =============================================
   Module 8: Settings Page
   ============================================= */
function initSettingsPage() {
    const saveBtn = document.getElementById('save-profile-btn');
    const nameInput = document.getElementById('settings-name-input');
    const goalInput = document.getElementById('settings-goal-input');
    const themeCheckbox = document.getElementById('dark-theme-toggle');

    if (!saveBtn || !nameInput || !goalInput || !themeCheckbox) return;

    saveBtn.addEventListener('click', () => {
        const nameVal = nameInput.value.trim();
        const goalVal = parseInt(goalInput.value) || 50;

        if (!nameVal) {
            showToast('❌ Profile display name cannot be blank.');
            return;
        }

        AppState.user.name = nameVal;
        AppState.user.goal = goalVal;

        // Sync with users directory
        const uIndex = users.findIndex(u => u.email === currentEmail);
        if (uIndex !== -1) {
            users[uIndex].name = nameVal;
            users[uIndex].goal = goalVal;
            localStorage.setItem('carbonwise_users', JSON.stringify(users));
        }

        showToast('⚙️ Profile preferences updated successfully!');
        saveState();
        updateUI();
    });

    themeCheckbox.addEventListener('change', () => {
        AppState.darkMode = themeCheckbox.checked;
        saveState();
        updateUI();
        showToast(`🌙 Dark mode ${AppState.darkMode ? 'enabled' : 'disabled'}!`);
    });
}

/* =============================================
   Module 9: Developer Mode Panel
   ============================================= */
function initDeveloperPage() {
    const rawBtn = document.getElementById('dev-inspect-raw-btn');
    const resetBtn = document.getElementById('dev-reset-all-btn');

    if (rawBtn) {
        rawBtn.addEventListener('click', () => {
            const rawDB = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('carbonwise_')) {
                    try {
                        rawDB[key] = JSON.parse(localStorage.getItem(key));
                    } catch(e) {
                        rawDB[key] = localStorage.getItem(key);
                    }
                }
            }

            openModal(
                'Raw LocalStorage Inspector 🔍',
                `<div style="padding:4px;">
                    <p style="font-size:0.8rem;color:var(--gray-500);margin-bottom:8px;">Below is the current raw JSON representation of the CarbonWise LocalStorage namespace:</p>
                    <textarea readonly style="width:100%; height:280px; font-family:monospace; font-size:0.75rem; background:var(--gray-50); color:var(--gray-805); border:1px solid var(--gray-200); padding:10px; border-radius:6px; resize:none;">${JSON.stringify(rawDB, null, 2)}</textarea>
                </div>`
            );
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            openModal(
                'Confirm Factory Reset! ⚠️',
                `<div style="padding:4px;">
                    <p style="font-size:0.88rem;color:var(--red-500);font-weight:700;margin-bottom:8px;"><i class="fa-solid fa-triangle-exclamation"></i> Warning: Deleting Database</p>
                    <p style="font-size:0.82rem;color:var(--gray-600);margin-bottom:16px;">This will completely delete all user accounts, point values, redeemed cards, and local settings. You will be redirected to Auth page.</p>
                    <div class="modal-body-buttons">
                        <button class="modal-btn-cancel" id="cancel-reset-btn">Cancel</button>
                        <button class="modal-btn-confirm" id="confirm-reset-btn" style="background:var(--red-500);">Wipe Database</button>
                    </div>
                </div>`
            );

            document.getElementById('cancel-reset-btn').addEventListener('click', () => closeModal());
            document.getElementById('confirm-reset-btn').addEventListener('click', () => {
                closeModal();
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key.startsWith('carbonwise_')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                
                showToast('💥 Database wiped. Refreshing...');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            });
        });
    }
}

function renderDeveloperPanel() {
    const tableBody = document.getElementById('dev-users-table-body');
    const totalUsersEl = document.getElementById('dev-total-users');
    const totalPointsEl = document.getElementById('dev-total-points');
    const totalCo2El = document.getElementById('dev-total-co2');

    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    let allocatedPoints = 0;
    let allocatedCo2 = 0;

    totalUsersEl.textContent = users.length;

    users.forEach(u => {
        let uData = null;
        const saved = localStorage.getItem(`carbonwise_data_${u.email}`);
        if (saved) {
            try {
                uData = JSON.parse(saved);
            } catch(e) {}
        }
        
        const pts = uData ? uData.points : 0;
        const co2 = uData ? uData.carbonSaved : 0;
        const goal = uData ? uData.user.goal : u.goal;

        allocatedPoints += pts;
        allocatedCo2 += co2;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="padding:10px;"><strong>${u.name}</strong></td>
            <td style="padding:10px; color:var(--gray-500);">${u.email}</td>
            <td style="padding:10px;"><span style="font-size:0.75rem; font-weight:700; background:var(--gray-100); padding:2px 8px; border-radius:4px;">${u.role}</span></td>
            <td style="padding:10px; font-weight:700; color:var(--green-600);">${pts.toLocaleString()} Pts</td>
            <td style="padding:10px; color:var(--gray-600);">${goal} kg</td>
            <td style="padding:10px; text-align:center;">
                <button class="btn-dev-action points" data-email="${u.email}">+500 Pts</button>
                <button class="btn-dev-action role" data-email="${u.email}">Toggle Role</button>
                ${u.email !== 'dev@carbonwise.com' ? `<button class="btn-dev-action delete" data-email="${u.email}">Delete</button>` : ''}
            </td>
        `;
        tableBody.appendChild(row);
    });

    totalPointsEl.textContent = allocatedPoints.toLocaleString();
    totalCo2El.textContent = `${allocatedCo2.toFixed(1)} kg`;

    document.querySelectorAll('.btn-dev-action.points').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            devAddPointsToUser(email, 500);
        });
    });

    document.querySelectorAll('.btn-dev-action.role').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            devToggleUserRole(email);
        });
    });

    document.querySelectorAll('.btn-dev-action.delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            devDeleteUser(email);
        });
    });
}

function devAddPointsToUser(email, pts) {
    const saved = localStorage.getItem(`carbonwise_data_${email}`);
    if (!saved) return;
    
    try {
        const uData = JSON.parse(saved);
        uData.points += pts;
        uData.activities.unshift({
            id: Date.now(),
            type: 'upload',
            text: `Developer credited bonus points`,
            points: pts,
            time: 'Just now',
            isPositive: true
        });
        localStorage.setItem(`carbonwise_data_${email}`, JSON.stringify(uData));
        
        if (email === currentEmail) {
            AppState = uData;
            updateUI();
        }

        showToast(`💪 Credited +${pts} Points to ${email}!`);
        renderDeveloperPanel();
    } catch(e) {
        console.error(e);
    }
}

function devToggleUserRole(email) {
    const uIndex = users.findIndex(u => u.email === email);
    if (uIndex === -1) return;

    const currentRole = users[uIndex].role;
    const newRole = (currentRole === 'Developer') ? 'Green Explorer' : 'Developer';
    
    users[uIndex].role = newRole;
    localStorage.setItem('carbonwise_users', JSON.stringify(users));

    const saved = localStorage.getItem(`carbonwise_data_${email}`);
    if (saved) {
        try {
            const uData = JSON.parse(saved);
            uData.user.role = newRole;
            localStorage.setItem(`carbonwise_data_${email}`, JSON.stringify(uData));
            
            if (email === currentEmail) {
                AppState = uData;
                const devLink = document.getElementById('nav-developer');
                if (devLink) devLink.style.display = (newRole === 'Developer') ? 'flex' : 'none';
                if (newRole !== 'Developer') switchPage('dashboard');
                updateUI();
            }
        } catch(e) {}
    }

    showToast(`⚙️ Toggled role for ${email} to ${newRole}`);
    renderDeveloperPanel();
}

function devDeleteUser(email) {
    if (email === 'dev@carbonwise.com') {
        showToast('❌ Cannot delete default developer account.');
        return;
    }

    openModal(
        'Confirm Account Deletion',
        `<div style="padding:4px;">
            <p style="font-size:0.88rem;color:var(--red-500);font-weight:700;margin-bottom:8px;">Delete Account: ${email}?</p>
            <p style="font-size:0.82rem;color:var(--gray-600);margin-bottom:16px;">This will permanently wipe this user\'s registration, points, and logs from localStorage database.</p>
            <div class="modal-body-buttons">
                <button class="modal-btn-cancel" id="cancel-del-btn">Cancel</button>
                <button class="modal-btn-confirm" id="confirm-del-btn" style="background:var(--red-500);">Delete Permanently</button>
            </div>
        </div>`
    );

    document.getElementById('cancel-del-btn').addEventListener('click', () => closeModal());
    document.getElementById('confirm-del-btn').addEventListener('click', () => {
        closeModal();
        
        users = users.filter(u => u.email !== email);
        localStorage.setItem('carbonwise_users', JSON.stringify(users));

        localStorage.removeItem(`carbonwise_data_${email}`);

        showToast(`🗑️ Account ${email} deleted.`);
        renderDeveloperPanel();
    });
}

/* =============================================
   Global Modals Controller
   ============================================= */
function initModals() {
    const overlay = document.getElementById('app-modal');
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) closeBtn.addEventListener('click', () => closeModal());
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
}

function openModal(title, bodyHtml) {
    const overlay = document.getElementById('app-modal');
    const titleArea = document.getElementById('modal-title-area');
    const bodyArea = document.getElementById('modal-body-area');

    if (!overlay || !titleArea || !bodyArea) return;

    titleArea.innerHTML = `<h3>${title}</h3>`;
    bodyArea.innerHTML = bodyHtml;
    
    overlay.style.display = 'flex';
}

function closeModal() {
    const overlay = document.getElementById('app-modal');
    if (overlay) overlay.style.display = 'none';
}

/* =============================================
   Scroll & Intersection Animations
   ============================================= */
function initAnimations() {
    const cards = document.querySelectorAll('.section-card, .stat-card, .banner-card, .redeem-card, .partner-brands-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        observer.observe(card);
    });
}

/* =============================================
   Banner Carousel Module
   ============================================= */
function initBannerCarousel() {
    const dots = document.querySelectorAll('.banner-dots .dot');
    let currentSlide = 0;
    
    const bannerTexts = [
        {
            title: 'Turn Your Actions<br>Into Rewards',
            desc: 'Track, earn points and redeem exciting rewards from top sustainable brands.',
            points: '+250'
        },
        {
            title: 'Go Green,<br>Earn More!',
            desc: 'Every sustainable choice you make earns you green points and rewards.',
            points: '+180'
        },
        {
            title: 'Sustainable Living<br>Made Rewarding',
            desc: 'Join thousands of eco-warriors making a difference one action at a time.',
            points: '+320'
        },
        {
            title: 'Your Impact<br>Matters!',
            desc: 'Together we\'ve saved 1000+ kg of CO₂. Keep contributing to a greener planet.',
            points: '+500'
        }
    ];

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateBanner();
        });
    });

    function updateBanner() {
        if (dots.length === 0) return;
        dots.forEach(d => d.classList.remove('active'));
        dots[currentSlide].classList.add('active');
        
        const banner = bannerTexts[currentSlide];
        const titleEl = document.querySelector('.banner-content h2');
        const descEl = document.querySelector('.banner-content p');
        const pointsEl = document.querySelector('.banner-points-badge .points-value');
        
        if (!titleEl || !descEl || !pointsEl) return;

        titleEl.style.opacity = '0';
        descEl.style.opacity = '0';
        
        setTimeout(() => {
            titleEl.innerHTML = banner.title;
            descEl.textContent = banner.desc;
            pointsEl.textContent = banner.points;
            
            titleEl.style.transition = 'opacity 0.3s ease';
            descEl.style.transition = 'opacity 0.3s ease';
            titleEl.style.opacity = '1';
            descEl.style.opacity = '1';
        }, 200);
    }

    setInterval(() => {
        currentSlide = (currentSlide + 1) % bannerTexts.length;
        updateBanner();
    }, 5000);
}

/* =============================================
   Static Click Hover Interactions Handlers
   ============================================= */
function initInteractions() {
    const recycleCard = document.getElementById('track-recycle-card');
    if (recycleCard) {
        recycleCard.addEventListener('click', () => {
            switchPage('track');
            setTimeout(() => {
                const btn = document.querySelector('.track-tab-btn[data-tab="clothes"]');
                if (btn) btn.click();
            }, 100);
        });
    }

    const bottleCard = document.getElementById('track-bottle-card');
    if (bottleCard) {
        bottleCard.addEventListener('click', () => {
            switchPage('track');
            setTimeout(() => {
                const btn = document.querySelector('.track-tab-btn[data-tab="bottle"]');
                if (btn) btn.click();
            }, 100);
        });
    }

    const ecoBuyCard = document.getElementById('track-ecobuy-card');
    if (ecoBuyCard) {
        ecoBuyCard.addEventListener('click', () => {
            switchPage('track');
            setTimeout(() => {
                const btn = document.querySelector('.track-tab-btn[data-tab="ecoshop"]');
                if (btn) btn.click();
            }, 100);
        });
    }

    const cycleCard = document.getElementById('track-cycle-card');
    if (cycleCard) {
        cycleCard.addEventListener('click', () => {
            switchPage('track');
            setTimeout(() => {
                const btn = document.querySelector('.track-tab-btn[data-tab="transport"]');
                if (btn) btn.click();
            }, 100);
        });
    }

    const exploreBtn = document.getElementById('explore-rewards-btn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            switchPage('rewards');
            showToast('Welcome to the brand coupons rewards catalog! 🎁');
        });
    }

    const seeImpactBtn = document.getElementById('see-impact-btn');
    if (seeImpactBtn) {
        seeImpactBtn.addEventListener('click', () => {
            switchPage('impact');
            showToast('Opening personal green certificate and impact scorecard! 🌍');
        });
    }

    const notifBtn = document.getElementById('notification-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            notifBtn.style.animation = 'none';
            notifBtn.offsetHeight;
            notifBtn.style.animation = 'pulse 0.3s ease';
            
            showToast(`🔔 Message Center: You have active challenges progress checks due!`);
        });
    }

    const streak = document.getElementById('eco-streak');
    if (streak) {
        streak.addEventListener('click', () => {
            showToast('🔥 12-Day Green Action Streak! Maintain it tomorrow for +50 Pts bonus!');
        });
    }

    document.querySelectorAll('#redeem-list .redeem-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const points = parseInt(btn.getAttribute('data-points'));
            const brand = btn.getAttribute('data-brand');
            const code = btn.getAttribute('data-code');

            if (AppState.points < points) {
                showToast('❌ Insufficient points balance to redeem this coupon.');
                return;
            }

            AppState.points -= points;
            AppState.activities.unshift({
                id: Date.now(),
                type: 'reward',
                text: `Redeemed ${brand} coupon from dashboard`,
                points: -points,
                time: 'Just now',
                isPositive: false
            });
            AppState.redeemedVouchers.push({
                brand: brand,
                desc: `${points === 500 ? '10%' : points === 750 ? '15%' : '20%'} Off Voucher`,
                code: `${code}-${Math.floor(1000 + Math.random() * 9000)}`
            });

            saveState();
            updateUI();

            const latestCode = AppState.redeemedVouchers[AppState.redeemedVouchers.length - 1].code;
            openModal(
                'Coupon Redeemed successfully! 🎉',
                `<div style="text-align:center;padding:10px;">
                    <p style="font-weight:700;font-size:1.05rem;color:var(--gray-800);margin-bottom:6px;">Claimed: ${brand} Voucher</p>
                    <p style="font-size:0.85rem;color:var(--gray-50);background:var(--green-600);padding:8px;border-radius:6px;display:inline-block;margin-bottom:12px;">-${points} Points deducted</p>
                    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:10px;">
                        <span style="font-family:monospace;font-size:1.2rem;font-weight:700;background:var(--gray-50);padding:6px 16px;border-radius:4px;color:var(--gray-800);border:1px solid var(--gray-200);">${latestCode}</span>
                        <button class="action-submit-btn" id="shortcut-copy-btn" style="width:auto;margin:0;padding:8px 12px;"><i class="fa-solid fa-copy"></i> Copy</button>
                    </div>
                </div>`
            );

            document.getElementById('shortcut-copy-btn').addEventListener('click', () => {
                navigator.clipboard.writeText(latestCode).then(() => {
                    showToast('📋 Code copied to clipboard!');
                    document.getElementById('shortcut-copy-btn').innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                });
            });
        });
    });
}

/* =============================================
   Toast Notification Module
   ============================================= */
function showToast(message) {
    const existing = document.querySelector('.cw-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'cw-toast';
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #1f2937;
        color: white;
        padding: 14px 24px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 500;
        font-family: 'Inter', sans-serif;
        z-index: 100000;
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        animation: toastIn 0.4s ease-out;
        max-width: 360px;
    `;
    
    document.body.appendChild(toast);

    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes toastIn {
                from { opacity: 0; transform: translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes toastOut {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to { opacity: 0; transform: translateY(20px) scale(0.95); }
            }
            @keyframes rippleEffect {
                to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* =============================================
   Generate SVG Assets Inline Fallback
   ============================================= */
function generateSVGAssets() {
    const earthMascot = document.getElementById('earth-mascot');
    if (earthMascot) {
        earthMascot.onerror = function() {
            this.style.display = 'none';
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = createEarthSVG();
            svgContainer.style.cssText = 'width:80px;height:80px;margin:0 auto 8px;';
            svgContainer.className = 'mascot-img';
            svgContainer.style.animation = 'float 3s ease-in-out infinite';
            this.parentNode.insertBefore(svgContainer, this);
        };
        earthMascot.src = 'assets/earth-mascot.svg';
    }

    const bannerImg = document.getElementById('banner-img');
    if (bannerImg) {
        bannerImg.onerror = function() {
            this.style.display = 'none';
            const svgContainer = document.createElement('div');
            svgContainer.innerHTML = createBannerSVG();
            svgContainer.style.cssText = 'width:200px;height:160px;';
            svgContainer.style.animation = 'float 4s ease-in-out infinite';
            this.parentNode.insertBefore(svgContainer, this);
        };
        bannerImg.src = 'assets/banner-illustration.svg';
    }

    const avatarImages = document.querySelectorAll('.avatar, .user-avatar, .mini-avatar, .post-user-avatar');
    avatarImages.forEach(img => {
        img.onerror = function() {
            this.src = createAvatarDataURL();
        };
    });
}

function createEarthSVG() {
    return `
    <svg viewBox="0 0 100 100" width="80" height="80">
        <circle cx="50" cy="50" r="45" fill="#4ade80" />
        <circle cx="50" cy="50" r="45" fill="url(#earthGrad)" />
        <defs>
            <radialGradient id="earthGrad" cx="40%" cy="35%">
                <stop offset="0%" stop-color="#86efac" />
                <stop offset="100%" stop-color="#22c55e" />
            </radialGradient>
        </defs>
        <ellipse cx="35" cy="35" rx="12" ry="10" fill="#166534" opacity="0.6" />
        <ellipse cx="60" cy="50" rx="15" ry="12" fill="#166534" opacity="0.5" />
        <ellipse cx="40" cy="65" rx="8" ry="7" fill="#166534" opacity="0.4" />
        <circle cx="38" cy="42" r="5" fill="white" />
        <circle cx="62" cy="42" r="5" fill="white" />
        <circle cx="39" cy="42" r="2.5" fill="#1f2937" />
        <circle cx="63" cy="42" r="2.5" fill="#1f2937" />
        <circle cx="40" cy="41" r="1" fill="white" />
        <circle cx="64" cy="41" r="1" fill="white" />
        <path d="M 40 56 Q 50 65 60 56" stroke="#166534" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M 50 5 Q 55 -2 60 8 Q 55 10 50 5" fill="#15803d" />
        <line x1="50" y1="5" x2="55" y2="2" stroke="#166534" stroke-width="0.5" />
    </svg>`;
}

function createBannerSVG() {
    return `
    <svg viewBox="0 0 200 160" width="200" height="160">
        <rect x="50" y="40" width="100" height="90" rx="8" fill="#a5d6a7" />
        <rect x="55" y="45" width="90" height="80" rx="6" fill="#c8e6c9" />
        <path d="M 75 45 L 75 30 Q 75 20 100 20 Q 125 20 125 30 L 125 45" 
              stroke="#2e7d32" stroke-width="3" fill="none" stroke-linecap="round" />
        <ellipse cx="85" cy="75" rx="12" ry="8" fill="#4caf50" transform="rotate(-30 85 75)" />
        <ellipse cx="115" cy="80" rx="10" ry="6" fill="#66bb6a" transform="rotate(20 115 80)" />
        <circle cx="100" cy="90" r="15" fill="none" stroke="#2e7d32" stroke-width="2" />
        <path d="M 92 82 L 100 75 L 108 82" stroke="#2e7d32" stroke-width="2" fill="none" />
        <path d="M 108 98 L 100 105 L 92 98" stroke="#2e7d32" stroke-width="2" fill="none" />
        <circle cx="40" cy="30" r="3" fill="#fbbf24" opacity="0.8" />
        <circle cx="160" cy="25" r="2" fill="#fbbf24" opacity="0.6" />
        <circle cx="155" cy="60" r="3" fill="#fbbf24" opacity="0.7" />
        <circle cx="45" cy="100" r="2" fill="#fbbf24" opacity="0.5" />
        <ellipse cx="30" cy="60" rx="6" ry="3" fill="#81c784" transform="rotate(-45 30 60)" opacity="0.7" />
        <ellipse cx="170" cy="90" rx="5" ry="3" fill="#81c784" transform="rotate(30 170 90)" opacity="0.6" />
    </svg>`;
}

function createAvatarDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = 72;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(36, 36, 0, 36, 36, 36);
    gradient.addColorStop(0, '#bbf7d0');
    gradient.addColorStop(1, '#4ade80');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(36, 36, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f5d0a9';
    ctx.beginPath();
    ctx.arc(36, 28, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.arc(36, 22, 16, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.beginPath();
    ctx.arc(30, 28, 2, 0, Math.PI * 2);
    ctx.arc(42, 28, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(36, 32, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(36, 58, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
}
