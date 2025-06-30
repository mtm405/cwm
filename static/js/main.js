// Google OAuth Integration (using Google Identity Services)
function handleCredentialResponse(response) {
    console.log('Google Sign-In successful');
    const idToken = response.credential;
    
    // Debug: Log token details (safely)
    console.log('Token length:', idToken.length);
    console.log('Token starts with:', idToken.substring(0, 20) + '...');
    console.log('Token ends with:', '...' + idToken.substring(idToken.length - 20));
    
    // Try to parse the JWT payload for debugging (without verification)
    try {
        const parts = idToken.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload preview:', {
                iss: payload.iss,
                aud: payload.aud,
                email: payload.email,
                exp: payload.exp,
                iat: payload.iat
            });
        }
    } catch (e) {
        console.error('Error parsing token payload:', e);
    }
    
    // Show loading state
    const authSection = document.querySelector('.auth-section');
    if (authSection) {
        authSection.style.opacity = '0.6';
        authSection.style.pointerEvents = 'none';
    }
    
    // Send token to backend
    fetch('/auth/sessionLogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken: idToken })
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Backend response:', data);
        if (data.success) {
            console.log('Session login successful');
            // Redirect to dashboard after successful login
            window.location.href = '/dashboard';
        } else {
            console.error('Session login failed:', data.error);
            alert('Login failed: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    })
    .finally(() => {
        // Reset button state
        if (authSection) {
            authSection.style.opacity = '1';
            authSection.style.pointerEvents = 'auto';
        }
    });
}

function signOut() {
    // Clear session from backend
    fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Logout successful');
            window.location.href = '/';
        } else {
            console.error('Logout failed:', data.error);
            // Force redirect anyway
            window.location.href = '/';
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Force redirect anyway
        window.location.href = '/';
    });
}

// Initialize Google Identity Services
function initGoogleIdentity() {
    if (typeof google !== 'undefined' && google.accounts) {
        console.log('Google Identity Services loaded');
    }
}

// Theme Management
function setTheme(theme) {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('theme', theme);
    
    // Update theme in backend
    fetch('/api/update-theme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: theme })
    });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize header functionality first
    initHeaderFunctionality();
    initDashboardFunctionality();
    
    // Initialize navigation
    window.navigationManager = new NavigationManager();
    
    // Initialize theme management
    window.themeManager = new ThemeManager();
    
    // Initialize animations
    window.animationManager = new AnimationManager();
    
    // Initialize Google Identity Services if available
    if (typeof google !== 'undefined') {
        initGoogleIdentity();
    }
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    // Initialize dropdown menus
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', function() {
            this.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
    }
    
    // Initialize page-specific components
    const page = document.body.dataset.page;
    if (page === 'dashboard' && typeof ModernDashboardManager !== 'undefined') {
        window.dashboardManager = new ModernDashboardManager();
        window.dashboardManager.init();
    }
    
    console.log('🚀 Modern UI initialized successfully');
});

// Code Editor Management
let editor = null;

function initializeEditor(elementId, options = {}) {
    if (typeof ace !== 'undefined') {
        editor = ace.edit(elementId);
        editor.setTheme("ace/theme/monokai");
        editor.session.setMode("ace/mode/python");
        editor.setOptions({
            fontSize: "14px",
            showPrintMargin: false,
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            ...options
        });
        return editor;
    }
}

// Code Submission
async function submitCode(lessonId, challengeId) {
    if (!editor) return;
    
    const code = editor.getValue();
    const submitBtn = document.getElementById('submit-code');
    const outputDiv = document.getElementById('code-output');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Running...';
    outputDiv.innerHTML = '<div class="spinner"></div>';
    
    try {
        const response = await fetch('/api/submit-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                lesson_id: lessonId,
                challenge_id: challengeId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            outputDiv.innerHTML = `
                <div class="output-success">
                    <h4>Output:</h4>
                    <pre>${result.output}</pre>
                    ${result.passed_tests ? 
                        `<div class="rewards">
                            <p>🎉 Challenge Completed!</p>
                            <p>+${result.xp_earned} XP | +${result.coins_earned} PyCoins</p>
                        </div>` : 
                        '<p class="error">Tests failed. Try again!</p>'
                    }
                </div>
            `;
            
            if (result.passed_tests) {
                updateUserStats(result.xp_earned, result.coins_earned);
            }
        } else {
            outputDiv.innerHTML = `<div class="error">Error: ${result.error}</div>`;
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Run Code';
    }
}

// Quiz Management
let currentQuiz = null;
let currentQuestion = 0;
let userAnswers = {};

async function startQuiz(quizId) {
    try {
        const response = await fetch(`/api/quiz/${quizId}/start`, {
            method: 'POST'
        });
        
        const data = await response.json();
        if (data.success) {
            currentQuiz = data.quiz;
            currentQuestion = 0;
            userAnswers = {};
            displayQuizQuestion();
        }
    } catch (error) {
        console.error('Error starting quiz:', error);
    }
}

function displayQuizQuestion() {
    if (!currentQuiz || currentQuestion >= currentQuiz.questions.length) {
        submitQuiz();
        return;
    }
    
    const question = currentQuiz.questions[currentQuestion];
    const container = document.getElementById('quiz-container');
    
    let questionHTML = `
        <div class="quiz-progress">
            <span>Question ${currentQuestion + 1} of ${currentQuiz.questions.length}</span>
            <span>Score: ${calculateCurrentScore()}%</span>
        </div>
        <div class="question-card">
            <h3 class="question-text">${question.question}</h3>
    `;
    
    if (question.type === 'multiple_choice') {
        questionHTML += '<div class="answer-options">';
        question.options.forEach((option, index) => {
            questionHTML += `
                <div class="answer-option" onclick="selectAnswer('${option}')">
                    ${option}
                </div>
            `;
        });
        questionHTML += '</div>';
    } else if (question.type === 'true_false') {
        questionHTML += `
            <div class="answer-options">
                <div class="answer-option" onclick="selectAnswer('True')">True</div>
                <div class="answer-option" onclick="selectAnswer('False')">False</div>
            </div>
        `;
    } else if (question.type === 'fill_blank') {
        questionHTML += `
            <input type="text" class="form-control" id="fill-answer" placeholder="Type your answer">
            <button class="btn btn-primary mt-3" onclick="selectAnswer(document.getElementById('fill-answer').value)">
                Submit Answer
            </button>
        `;
    }
    
    questionHTML += `
        </div>
        <div class="quiz-navigation">
            ${currentQuestion > 0 ? 
                '<button class="btn btn-secondary" onclick="previousQuestion()">Previous</button>' : 
                ''
            }
            <button class="btn btn-primary" onclick="nextQuestion()">
                ${currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next'}
            </button>
        </div>
    `;
    
    container.innerHTML = questionHTML;
}

function selectAnswer(answer) {
    userAnswers[currentQuestion] = answer;
    
    // Visual feedback
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => {
        option.classList.remove('selected');
        if (option.textContent.trim() === answer) {
            option.classList.add('selected');
        }
    });
}

function nextQuestion() {
    if (currentQuestion < currentQuiz.questions.length - 1) {
        currentQuestion++;
        displayQuizQuestion();
    } else {
        submitQuiz();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuizQuestion();
    }
}

function calculateCurrentScore() {
    let correct = 0;
    let answered = 0;
    
    for (let i = 0; i < currentQuestion; i++) {
        if (userAnswers[i] !== undefined) {
            answered++;
            if (userAnswers[i] === currentQuiz.questions[i].correct_answer) {
                correct++;
            }
        }
    }
    
    return answered > 0 ? Math.round((correct / answered) * 100) : 0;
}

async function submitQuiz() {
    const quizId = currentQuiz.id;
    
    try {
        const response = await fetch(`/api/quiz/${quizId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers: userAnswers })
        });
        
        const result = await response.json();
        displayQuizResults(result);
    } catch (error) {
        console.error('Error submitting quiz:', error);
    }
}

function displayQuizResults(result) {
    const container = document.getElementById('quiz-container');
    
    let resultsHTML = `
        <div class="quiz-results">
            <h2>${result.passed ? '🎉 Quiz Passed!' : '😔 Try Again'}</h2>
            <div class="score-display">
                <div class="score-circle ${result.passed ? 'passed' : 'failed'}">
                    ${result.score}%
                </div>
            </div>
            <div class="results-stats">
                <p>Correct Answers: ${result.correct} / ${result.total}</p>
                ${result.passed ? 
                    `<p class="rewards">+${result.xp_earned} XP | +${result.coins_earned} PyCoins</p>` : 
                    ''
                }
            </div>
            <div class="results-breakdown">
                <h3>Review Your Answers</h3>
    `;
    
    result.results.forEach((q, index) => {
        resultsHTML += `
            <div class="result-item ${q.is_correct ? 'correct' : 'incorrect'}">
                <p><strong>Q${index + 1}:</strong> ${q.question}</p>
                <p>Your Answer: ${q.user_answer || 'Not answered'}</p>
                ${!q.is_correct ? `<p>Correct Answer: ${q.correct_answer}</p>` : ''}
            </div>
        `;
    });
    
    resultsHTML += `
            </div>
            <div class="quiz-actions">
                ${!result.passed ? 
                    '<button class="btn btn-primary" onclick="retakeQuiz()">Retake Quiz (10 PyCoins)</button>' : 
                    ''
                }
                <a href="/lessons" class="btn btn-secondary">Back to Lessons</a>
            </div>
        </div>
    `;
    
    container.innerHTML = resultsHTML;
    
    if (result.passed) {
        updateUserStats(result.xp_earned, result.coins_earned);
    }
}

async function retakeQuiz() {
    // Check if user has enough PyCoins
    const response = await fetch('/api/spend-coins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            amount: 10,
            item: 'quiz_retake'
        })
    });
    
    const result = await response.json();
    
    if (result.success) {
        startQuiz(currentQuiz.id);
    } else {
        alert('Insufficient PyCoins!');
    }
}

// Update user stats in UI
function updateUserStats(xp, coins) {
    const xpElement = document.getElementById('user-xp');
    const coinsElement = document.getElementById('user-coins');
    
    if (xpElement) {
        const currentXP = parseInt(xpElement.textContent);
        xpElement.textContent = currentXP + xp;
    }
    
    if (coinsElement) {
        const currentCoins = parseInt(coinsElement.textContent);
        coinsElement.textContent = currentCoins + coins;
    }
}

// Daily Challenge Timer
function updateDailyChallengeTimer() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeLeft = tomorrow - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    const timerElement = document.getElementById('daily-timer');
    if (timerElement) {
        timerElement.textContent = `${hours}h ${minutes}m`;
    }
}

// Initialize daily challenge timer
setInterval(updateDailyChallengeTimer, 60000); // Update every minute
updateDailyChallengeTimer(); // Initial update

// Sidebar Toggle for Mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Activity Feed Real-time Updates (WebSocket simulation)
function addActivityItem(activity) {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    
    const activityHTML = `
        <div class="activity-item fade-in">
            <div class="activity-icon">
                <i class="fas fa-${getActivityIcon(activity.type)}"></i>
            </div>
            <div class="activity-content">
                <p class="activity-message">${activity.message}</p>
                <span class="activity-time">Just now</span>
            </div>
        </div>
    `;
    
    feed.insertAdjacentHTML('afterbegin', activityHTML);
    
    // Remove old activities if too many
    const activities = feed.querySelectorAll('.activity-item');
    if (activities.length > 10) {
        activities[activities.length - 1].remove();
    }
}

function getActivityIcon(type) {
    const icons = {
        'lesson': 'book',
        'achievement': 'trophy',
        'quiz': 'clipboard-check',
        'challenge': 'code',
        'level': 'level-up-alt'
    };
    return icons[type] || 'star';
}

// Lesson Tab Navigation
function switchLessonTab(tabId) {
    // Update active tab
    document.querySelectorAll('.lesson-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.lesson-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabId).style.display = 'block';
}

// Notification System
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && editor) {
        const submitBtn = document.getElementById('submit-code');
        if (submitBtn) submitBtn.click();
    }
    
    // Escape to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => modal.classList.remove('active'));
    }
});

// Header Functionality Initialization
function initHeaderFunctionality() {
    // Initialize live clock
    initLiveClock();
    
    // Initialize search functionality
    initSearchKeyHandler();
    initSearchOutsideClick();
    
    console.log('📋 Header functionality initialized');
}

// Modern Navigation Manager
class NavigationManager {
    constructor() {
        this.mobileMenuOpen = false;
        this.dropdownsOpen = new Set();
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupKeyboardNavigation();
        this.setupScrollEffects();
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu when clicking on a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (navLinks) {
            navLinks.classList.toggle('mobile-active', this.mobileMenuOpen);
        }
        
        if (mobileToggle) {
            const icon = mobileToggle.querySelector('i');
            icon.className = this.mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        }
        
        // Prevent body scroll when mobile menu is open
        document.body.classList.toggle('mobile-menu-open', this.mobileMenuOpen);
    }

    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.user-dropdown, .dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger, .user-avatar, .user-name');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
        
        // Close dropdowns on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = this.dropdownsOpen.has(dropdown);
        
        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.closeAllDropdowns(); // Close other dropdowns first
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        dropdown.classList.add('active');
        this.dropdownsOpen.add(dropdown);
        
        // Animate dropdown appearance
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
                menu.style.transition = 'all 0.3s ease';
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
            });
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        this.dropdownsOpen.delete(dropdown);
        
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
        }
    }

    closeAllDropdowns() {
        this.dropdownsOpen.forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }

    setupKeyboardNavigation() {
        // Add keyboard navigation for accessibility
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % navLinks.length;
                    navLinks[nextIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                    navLinks[prevIndex].focus();
                }
            });
        });
    }

    setupScrollEffects() {
        let lastScrollY = window.scrollY;
        const navbar = document.querySelector('.navbar');
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (navbar) {
                // Hide/show navbar on scroll
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                
                // Add backdrop blur effect when scrolled
                if (currentScrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            lastScrollY = currentScrollY;
        });
    }
}

// Enhanced Theme Manager
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeControls();
        this.setupSystemThemeDetection();
    }

    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        
        // Update theme selector
        const themeSelector = document.querySelector('.theme-switcher select');
        if (themeSelector) {
            themeSelector.value = theme;
        }
        
        // Notify other components of theme change
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        
        // Update backend
        this.updateThemeBackend(theme);
    }

    setupThemeControls() {
        const themeSelector = document.querySelector('.theme-switcher select');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    setupSystemThemeDetection() {
        // Detect system theme preference
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    async updateThemeBackend(theme) {
        try {
            await fetch('/api/update-theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme })
            });
        } catch (error) {
            console.warn('Failed to update theme on backend:', error);
        }
    }
}

// Enhanced Animation Manager
class AnimationManager {
    constructor() {
        this.observedElements = new Set();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupPageTransitions();
        this.setupLoadingAnimations();
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);

        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in, .scale-in');
        animatedElements.forEach(el => {
            this.observer.observe(el);
        });
    }

    setupPageTransitions() {
        // Add smooth page transitions
        const links = document.querySelectorAll('a[href^="/"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.target !== '_blank' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.navigateWithTransition(link.href);
                }
            });
        });
    }

    navigateWithTransition(url) {
        // Add page exit animation
        document.body.classList.add('page-transition');
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    setupLoadingAnimations() {
        // Add loading states for dynamic content
        const buttons = document.querySelectorAll('.btn[data-loading]');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.addLoadingState(button);
            });
        });
    }

    addLoadingState(element) {
        element.classList.add('loading');
        element.disabled = true;
        
        const originalText = element.textContent;
        element.textContent = 'Loading...';
        
        // Remove loading state after a reasonable time or when operation completes
        setTimeout(() => {
            this.removeLoadingState(element, originalText);
        }, 3000);
    }

    removeLoadingState(element, originalText) {
        element.classList.remove('loading');
        element.disabled = false;
        element.textContent = originalText;
    }
}

// Live Clock Functionality
function initLiveClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;
    
    const timeDisplay = clockElement.querySelector('.time-display');
    const periodDisplay = clockElement.querySelector('.period-display');
    
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const period = hours >= 12 ? 'PM' : 'AM';
        
        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        // Format time with leading zeros
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeDisplay) timeDisplay.textContent = timeString;
        if (periodDisplay) periodDisplay.textContent = period;
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

// Search Bar Toggle Functionality
function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    if (searchBar) {
        const isActive = searchBar.classList.contains('active');
        
        if (isActive) {
            searchBar.classList.remove('active');
        } else {
            searchBar.classList.add('active');
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 200);
        }
    }
}

// Search Functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    // Show loading state
    const searchSubmit = document.querySelector('.search-submit');
    if (searchSubmit) {
        const originalHTML = searchSubmit.innerHTML;
        searchSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        // Simulate search (replace with actual search implementation)
        setTimeout(() => {
            searchSubmit.innerHTML = originalHTML;
            // For now, redirect to lessons page with search query
            window.location.href = `/lessons?search=${encodeURIComponent(query)}`;
        }, 1000);
    }
}

// Handle Enter key in search input
function initSearchKeyHandler() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

// Close search bar when clicking outside
function initSearchOutsideClick() {
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.search-container');
        const searchBar = document.getElementById('search-bar');
        
        if (searchContainer && !searchContainer.contains(e.target)) {
            if (searchBar && searchBar.classList.contains('active')) {
                searchBar.classList.remove('active');
            }
        }
    });
}

// Leaderboard Modal Functionality
function openLeaderboardModal() {
    // Create modal if it doesn't exist
    let modal = document.getElementById('leaderboard-modal');
    if (!modal) {
        modal = createLeaderboardModal();
        document.body.appendChild(modal);
    }
    
    // Show modal
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Load leaderboard data
    loadLeaderboardData();
}

function createLeaderboardModal() {
    const modal = document.createElement('div');
    modal.id = 'leaderboard-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content leaderboard-modal">
            <div class="modal-header">
                <h2><i class="fas fa-trophy"></i> Leaderboard</h2>
                <button class="modal-close" onclick="closeLeaderboardModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="leaderboard-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading leaderboard...</p>
                </div>
                <div class="leaderboard-content" style="display: none;">
                    <div class="leaderboard-list">
                        <!-- Leaderboard items will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `;
    return modal;
}

function closeLeaderboardModal() {
    const modal = document.getElementById('leaderboard-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

function loadLeaderboardData() {
    fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderLeaderboard(data.leaderboard);
            } else {
                showLeaderboardError('Failed to load leaderboard data');
            }
        })
        .catch(error => {
            console.error('Error loading leaderboard:', error);
            showLeaderboardError('Network error while loading leaderboard');
        });
}

function renderLeaderboard(leaderboard) {
    const loadingElement = document.querySelector('.leaderboard-loading');
    const contentElement = document.querySelector('.leaderboard-content');
    const listElement = document.querySelector('.leaderboard-list');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (contentElement) contentElement.style.display = 'block';
    
    if (listElement && leaderboard) {
        listElement.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}" data-rank="${index + 1}">
                <div class="rank-badge">
                    ${index < 3 ? 
                        `<i class="fas fa-medal ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}"></i>` : 
                        `<span class="rank-number">${index + 1}</span>`
                    }
                </div>
                <div class="user-info">
                    <img src="${user.profile_picture || '/static/img/default-avatar.png'}" alt="Avatar" class="user-avatar">
                    <div class="user-details">
                        <span class="user-name">${user.display_name || user.username}</span>
                        <span class="user-level">Level ${user.level || 1}</span>
                    </div>
                </div>
                <div class="user-stats">
                    <div class="stat">
                        <i class="fas fa-star"></i>
                        <span>${user.xp || 0}</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-coins"></i>
                        <span>${user.pycoins || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function showLeaderboardError(message) {
    const loadingElement = document.querySelector('.leaderboard-loading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        `;
    }
}

// Dashboard Refresh Functionality
function refreshDashboard() {
    // Check if dashboard manager exists (from dashboard.js)
    if (window.dashboardManager && typeof window.dashboardManager.refreshDashboard === 'function') {
        window.dashboardManager.refreshDashboard();
        return;
    }
    
    const refreshBtn = document.querySelector('.btn-refresh, .refresh-dashboard');
    const refreshIcon = refreshBtn?.querySelector('i');
    
    if (refreshBtn && refreshIcon) {
        // Add refreshing state
        refreshBtn.classList.add('refreshing');
        refreshBtn.disabled = true;
        
        // Show loading indicator
        refreshIcon.classList.add('fa-spin');
        
        // Fetch fresh dashboard data
        fetch('/api/dashboard/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update dashboard elements with fresh data
                updateDashboardData(data.data);
                // Note: refresh success notification is handled by dashboard.js component
            } else {
                showRefreshError('Failed to refresh dashboard data');
            }
        })
        .catch(error => {
            console.error('Error refreshing dashboard:', error);
            showRefreshError('Network error while refreshing');
        })
        .finally(() => {
            // Remove refreshing state
            setTimeout(() => {
                refreshBtn.classList.remove('refreshing');
                refreshBtn.disabled = false;
                refreshIcon.classList.remove('fa-spin');
            }, 1000);
        });
    }
}

function updateDashboardData(data) {
    // Update XP
    const xpElement = document.getElementById('user-xp');
    if (xpElement && data.user) {
        xpElement.textContent = data.user.xp || 0;
    }
    
    // Update PyCoins
    const coinsElement = document.getElementById('user-coins');
    if (coinsElement && data.user) {
        coinsElement.textContent = data.user.pycoins || 0;
    }
    
    // Update level
    const levelElements = document.querySelectorAll('[data-stat="level"] .stat-value-large');
    levelElements.forEach(element => {
        if (data.user) {
            element.textContent = data.user.level || 1;
        }
    });
    
    // Update stats cards
    const xpCard = document.querySelector('[data-stat="xp"] .stat-value-large');
    if (xpCard && data.user) {
        xpCard.textContent = data.user.xp || 0;
    }
    
    const coinsCard = document.querySelector('[data-stat="pycoins"] .stat-value-large');
    if (coinsCard && data.user) {
        coinsCard.textContent = data.user.pycoins || 0;
    }
    
    // Update welcome message if available
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage && data.user && data.user.display_name) {
        welcomeMessage.textContent = `Welcome back, ${data.user.display_name}! 🚀`;
    }
}

// Note: showRefreshSuccess function removed - now handled by dashboard.js component

function showRefreshError(message) {
    // Create temporary error indicator
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'refresh-error';
    errorIndicator.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
    errorIndicator.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorIndicator);
    
    setTimeout(() => {
        errorIndicator.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (errorIndicator.parentNode) {
                errorIndicator.parentNode.removeChild(errorIndicator);
            }
        }, 300);
    }, 3000);
}

// Dashboard Tab Switching
function initDashboardTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            tab.classList.add('active');
            const targetPane = document.getElementById(`${tabId}-tab`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Enhanced initialization
function initDashboardFunctionality() {
    initDashboardTabs();
}
