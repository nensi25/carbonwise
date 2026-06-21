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
        darkMode: false,
        level: 1,
        earthHealth: 85,
        achievements: []
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

    // Trigger Level and Health Calculations
    updateLevelSystem();
    updateEarthHealth();
    checkAchievements();

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

    // Dynamic UI Binding for Wow Features
    const earthScore = document.getElementById("earth-health-score");
    if(earthScore){
       earthScore.textContent = AppState.earthHealth + "%";
    }

    const levelEl = document.getElementById("eco-level");
    if(levelEl){
       levelEl.textContent = `Level ${AppState.level}`;
    }

    const achList = document.getElementById("achievement-list");
    if(achList){
       if(AppState.achievements.length === 0){
          achList.innerHTML = "No achievements yet";
       } else {
          achList.innerHTML = AppState.achievements.map(a => `<p>🏆 ${a}</p>`).join("");
       }
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
   Gamification Engine Core Functions
   ============================================= */
function updateLevelSystem() {
    const newLevel = Math.floor(AppState.points / 1000) + 1;

    if (newLevel > AppState.level) {
        AppState.level = newLevel;
        showToast(`🎉 Level Up! You reached Eco Level ${newLevel}`);
        AppState.achievements.push(`Reached Eco Level ${newLevel}`);
    }
    saveState();
}

function updateEarthHealth() {
    let score = 50;
    score += AppState.carbonSaved * 1.2;

    if(score > 100) score = 100;

    AppState.earthHealth = Math.round(score);
    saveState();
}

function checkAchievements() {
    if(
        AppState.carbonSaved >= 50 &&
        !AppState.achievements.includes("Carbon Saver")
    ){
        AppState.achievements.push("Carbon Saver");
        showToast("🏆 Achievement Unlocked: Carbon Saver");
    }

    if(
        AppState.points >= 5000 &&
        !AppState.achievements.includes("Eco Champion")
    ){
        AppState.achievements.push("Eco Champion");
        showToast("🏆 Achievement Unlocked: Eco Champion");
    }

    saveState();
}
