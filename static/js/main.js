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
            // Reload page to update UI with user data
            window.location.reload();
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
