/**
 * DailyChallenge.js
 * Handles the fetching, rendering, and interaction with daily challenges
 */

export class DailyChallenge {
    constructor() {
        this.challengeData = null;
        this.container = null;
        this.attemptCount = 0;
        this.challengeStartTime = null;
        this.challengeCompleted = false;
        
        // Challenge type renderers and validators
        this.challengeHandlers = {
            'code_challenge': {
                render: this.renderCodeChallenge.bind(this),
                validate: this.validateCodeChallenge.bind(this)
            },
            'quiz': {
                render: this.renderQuiz.bind(this),
                validate: this.validateQuiz.bind(this)
            },
            'question': {
                render: this.renderQuestion.bind(this),
                validate: this.validateQuestion.bind(this)
            }
        };

        // Check auth status
        this.checkAndFixAuthToken();
    }

    /**
     * Check and fix authentication token issues
     * This helps detect and resolve auth problems that may affect API calls
     */
    async checkAndFixAuthToken() {
        console.log('🔐 Checking authentication status...');
        
        // Check for user object but missing token (common issue)
        const hasUserObject = !!window.currentUser;
        const hasAuthToken = !!localStorage.getItem('auth_token');
        
        if (hasUserObject && !hasAuthToken) {
            console.warn('⚠️ Found user object but missing auth token. Attempting to fix...');
            
            // Check for alternate token names
            const alternateTokens = [
                { key: 'cwm_user_token', source: 'localStorage' },
                { key: 'authToken', source: 'localStorage' },
                { key: 'auth_token', source: 'sessionStorage' }
            ];
            
            for (const { key, source } of alternateTokens) {
                const token = source === 'localStorage' 
                    ? localStorage.getItem(key) 
                    : sessionStorage.getItem(key);
                
                if (token) {
                    console.log(`✅ Found token in ${source}.${key}. Fixing...`);
                    localStorage.setItem('auth_token', token);
                    console.log('✅ Auth token restored from alternate source');
                    return true;
                }
            }
            
            // If we have a user but no token anywhere, try to get a new token
            try {
                console.log('🔄 Attempting to refresh authentication token...');
                const response = await fetch('/api/auth/refresh-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: typeof window.currentUser === 'object' ? window.currentUser.id : window.currentUser 
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.token) {
                        localStorage.setItem('auth_token', data.token);
                        console.log('✅ Successfully obtained new auth token');
                        return true;
                    }
                }
                console.warn('⚠️ Could not refresh authentication token');
            } catch (error) {
                console.error('❌ Error refreshing authentication:', error);
            }
        }
        
        return hasAuthToken;
    }

    /**
     * Initialize the daily challenge
     * @param {HTMLElement} container - The container element to render the challenge in
     */
    async init(container) {
        this.container = container;
        
        try {
            await this.fetchDailyChallenge();
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to initialize daily challenge:', error);
            this.renderError();
        }
    }

    /**
     * Fetch the daily challenge from the server
     */
    async fetchDailyChallenge() {
        try {
            // Make sure authentication is properly set before making API call
            await this.checkAndFixAuthToken();
            
            // Add auth token to request if available
            const headers = { 'Content-Type': 'application/json' };
            const authToken = localStorage.getItem('auth_token');
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }
            
            const response = await fetch('/api/challenges/daily', {
                headers: headers
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.challengeData = data.challenge;
                return true;
            }
            
            // Check for auth errors
            if (data.error === 'Unauthorized' || response.status === 401) {
                console.error('🔐 Authentication error fetching challenge');
                this.handleAuthError();
                throw new Error('Authentication required');
            }
            
            throw new Error(data.error || 'Failed to load daily challenge');
        } catch (error) {
            console.error('Error loading daily challenge:', error);
            throw error;
        }
    }
    
    /**
     * Handle authentication errors
     */
    handleAuthError() {
        console.warn('⚠️ Authentication error detected');
        
        // Clear any invalid tokens
        localStorage.removeItem('auth_token');
        
        // Show auth error message
        const authErrorHTML = `
            <div class="auth-error-container">
                <div class="auth-error-icon">
                    <i class="fas fa-user-lock"></i>
                </div>
                <h3>Authentication Required</h3>
                <p>Please sign in to view today's challenge.</p>
                <div class="auth-actions">
                    <a href="/login" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt"></i> Sign In
                    </a>
                    <a href="/signup" class="btn btn-outline-primary">
                        <i class="fas fa-user-plus"></i> Create Account
                    </a>
                </div>
            </div>
        `;
        
        if (this.container) {
            this.container.innerHTML = authErrorHTML;
        }
    }

    /**
     * Render the daily challenge
     */
    render() {
        if (!this.challengeData) {
            this.renderNoChallengeAvailable();
            return;
        }

        // Mark challenge start time
        this.challengeStartTime = new Date();
        
        // Common challenge header
        const headerHTML = this.generateChallengeHeader();
        
        // Challenge type-specific content
        const handler = this.challengeHandlers[this.challengeData.type];
        const contentHTML = handler ? handler.render() : this.renderUnsupportedType();
        
        // Combine and render
        this.container.innerHTML = `
            <div class="daily-challenge-container">
                ${headerHTML}
                <div class="challenge-body">
                    <div class="challenge-instructions">
                        <p>${this.challengeData.description || ''}</p>
                    </div>
                    ${contentHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generate the challenge header HTML
     * @returns {string} The header HTML
     */
    generateChallengeHeader() {
        const { title, difficulty, xp_reward, coin_reward, estimated_time } = this.challengeData;
        
        return `
            <div class="challenge-header">
                <h2 class="challenge-title">${title}</h2>
                <div class="challenge-meta">
                    <span class="difficulty-badge difficulty-${difficulty.toLowerCase()}">
                        ${difficulty}
                    </span>
                    <span class="reward-badge xp-reward">
                        <i class="fas fa-star"></i> ${xp_reward} XP
                    </span>
                    <span class="reward-badge coin-reward">
                        <i class="fas fa-coins"></i> ${coin_reward} PyCoins
                    </span>
                    <span class="time-estimate">
                        <i class="fas fa-clock"></i> ${estimated_time} mins
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Render a code challenge
     * @returns {string} The HTML for the code challenge
     */
    renderCodeChallenge() {
        const { content } = this.challengeData;
        
        return `
            <div class="code-challenge">
                <div class="challenge-instructions">
                    <p>${content.instructions}</p>
                </div>
                
                <div class="code-editor-container">
                    <div class="editor-header">
                        <span>Python Editor</span>
                    </div>
                    <div id="challenge-code-editor" class="code-editor">${content.initial_code}</div>
                </div>
                
                <div class="challenge-actions">
                    <div class="challenge-actions-left">
                        <button class="btn btn-primary btn-run-code">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                        <button class="btn btn-success btn-submit-solution">
                            <i class="fas fa-check"></i> Submit Solution
                        </button>
                    </div>
                    <div class="challenge-actions-right">
                        <button class="btn btn-outline-warning hint-btn" data-cost="${this.challengeData.hint_cost || 25}">
                            <i class="fas fa-lightbulb"></i> Hint
                            <span class="helper-cost">${this.challengeData.hint_cost || 25} <i class="fas fa-coins"></i></span>
                        </button>
                        <button class="btn btn-outline-danger skip-btn" data-cost="${this.challengeData.skip_cost || 50}">
                            <i class="fas fa-forward"></i> Skip
                            <span class="helper-cost">${this.challengeData.skip_cost || 50} <i class="fas fa-coins"></i></span>
                        </button>
                    </div>
                </div>
                
                <div id="challenge-result" class="challenge-result hidden">
                    <!-- Results will be displayed here -->
                </div>
            </div>
        `;
    }

    /**
     * Render a quiz challenge
     * @returns {string} The HTML for the quiz challenge
     */
    renderQuiz() {
        const { content } = this.challengeData;
        
        const questionsHTML = content.questions.map((question, index) => {
            const optionsHTML = question.options.map((option, optIndex) => `
                <div class="quiz-option">
                    <input type="radio" name="question-${index}" id="option-${index}-${optIndex}" value="${optIndex}">
                    <label for="option-${index}-${optIndex}">${option}</label>
                </div>
            `).join('');
            
            return `
                <div class="quiz-question" data-question-index="${index}">
                    <p class="question-text">${question.text}</p>
                    <div class="quiz-options">
                        ${optionsHTML}
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            <div class="quiz-challenge">
                <div class="challenge-instructions">
                    <p>${content.instructions}</p>
                </div>
                
                <div class="quiz-questions-container">
                    ${questionsHTML}
                </div>
                
                <div class="challenge-actions">
                    <div class="challenge-actions-main">
                        <button class="btn btn-success btn-submit-quiz">
                            <i class="fas fa-check"></i> Submit Answers
                        </button>
                    </div>
                    <div class="challenge-actions-helpers">
                        <button class="btn btn-outline-warning hint-btn" data-cost="${this.challengeData.hint_cost || 25}">
                            <i class="fas fa-lightbulb"></i> Hint
                            <span class="helper-cost">${this.challengeData.hint_cost || 25} <i class="fas fa-coins"></i></span>
                        </button>
                        <button class="btn btn-outline-danger skip-btn" data-cost="${this.challengeData.skip_cost || 50}">
                            <i class="fas fa-forward"></i> Skip
                            <span class="helper-cost">${this.challengeData.skip_cost || 50} <i class="fas fa-coins"></i></span>
                        </button>
                    </div>
                </div>
                
                <div id="challenge-result" class="challenge-result hidden">
                    <!-- Results will be displayed here -->
                </div>
            </div>
        `;
    }

    /**
     * Render a simple question challenge
     * @returns {string} The HTML for the question challenge
     */
    renderQuestion() {
        const { content } = this.challengeData;
        
        return `
            <div class="question-challenge">
                <div class="challenge-instructions">
                    <p>${content.instructions}</p>
                </div>
                
                <div class="question-input-container">
                    <label for="question-answer">${content.question}</label>
                    <textarea id="question-answer" rows="4" placeholder="Type your answer here..."></textarea>
                </div>
                
                <div class="challenge-actions">
                    <div class="challenge-actions-main">
                        <button class="btn btn-success btn-submit-answer">
                            <i class="fas fa-check"></i> Submit Answer
                        </button>
                    </div>
                    <div class="challenge-actions-helpers">
                        <button class="btn btn-outline-warning hint-btn" data-cost="${this.challengeData.hint_cost || 25}">
                            <i class="fas fa-lightbulb"></i> Hint
                            <span class="helper-cost">${this.challengeData.hint_cost || 25} <i class="fas fa-coins"></i></span>
                        </button>
                        <button class="btn btn-outline-danger skip-btn" data-cost="${this.challengeData.skip_cost || 50}">
                            <i class="fas fa-forward"></i> Skip
                            <span class="helper-cost">${this.challengeData.skip_cost || 50} <i class="fas fa-coins"></i></span>
                        </button>
                    </div>
                </div>
                
                <div id="challenge-result" class="challenge-result hidden">
                    <!-- Results will be displayed here -->
                </div>
            </div>
        `;
    }

    /**
     * Render an error for unsupported challenge types
     * @returns {string} The HTML for the error message
     */
    renderUnsupportedType() {
        return `
            <div class="challenge-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Unsupported challenge type: ${this.challengeData.type}</p>
            </div>
        `;
    }

    /**
     * Render an error message when the challenge fails to load
     */
    renderError() {
        this.container.innerHTML = `
            <div class="challenge-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Failed to Load Challenge</h3>
                <p>Sorry, we couldn't load today's challenge. Please try again later.</p>
                <button class="btn btn-primary btn-retry">Retry</button>
            </div>
        `;
        
        this.container.querySelector('.btn-retry').addEventListener('click', () => {
            this.init(this.container);
        });
    }

    /**
     * Render a message when no challenge is available
     */
    renderNoChallengeAvailable() {
        this.container.innerHTML = `
            <div class="no-challenge-modern">
                <div class="no-challenge-icon">
                    <i class="fas fa-calendar-times"></i>
                </div>
                <h3>No Challenge Today</h3>
                <p>Check back tomorrow for a new coding challenge!</p>
                <button class="btn btn-secondary btn-view-previous">
                    <i class="fas fa-history"></i> View Previous Challenges
                </button>
            </div>
        `;
        
        this.container.querySelector('.btn-view-previous').addEventListener('click', () => {
            // Navigate to previous challenges page
            window.location.href = '/challenges/history';
        });
    }

    /**
     * Render helper buttons (Hint and Skip)
     * @returns {string} HTML for the helper buttons
     */
    renderHelperButtons() {
        // Define costs (these could also come from the challenge data)
        const hintCost = this.challengeData.hint_cost || 25;
        const skipCost = this.challengeData.skip_cost || 50;
        
        // Check if user has already used a helper for this challenge
        const challengeId = this.challengeData.id;
        const helperUsedKey = `challenge_helper_used_${challengeId}`;
        const helperUsed = localStorage.getItem(helperUsedKey);
        
        // If helper was used, show disabled state
        if (helperUsed) {
            const helperType = localStorage.getItem(`challenge_helper_type_${challengeId}`);
            return `
                <div class="challenge-helpers">
                    <h4>Helper Options</h4>
                    <p class="helper-note">You've already used the ${helperType === 'hint' ? 'Hint' : 'Skip'} option for today's challenge.</p>
                </div>
            `;
        }
        
        // Otherwise show active helper buttons
        return `
            <div class="challenge-helpers">
                <h4>Need help?</h4>
                <p class="helper-note">You can use ONE of these options per day:</p>
                
                <div class="helper-buttons">
                    <button class="btn hint-btn" data-cost="${hintCost}">
                        <i class="fas fa-lightbulb"></i>
                        Get a Hint
                        <span class="helper-cost">${hintCost} <i class="fas fa-coins"></i></span>
                    </button>
                    
                    <button class="btn skip-btn" data-cost="${skipCost}">
                        <i class="fas fa-forward"></i>
                        Skip Challenge
                        <span class="helper-cost">${skipCost} <i class="fas fa-coins"></i></span>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Bind event listeners to interactive elements
     */
    bindEvents() {
        // Bind any code editor and button events
        const runCodeBtn = this.container.querySelector('.btn-run-code');
        const submitBtn = this.container.querySelector('.btn-submit-solution');
        
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => this.runCode());
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitSolution());
        }
        
        // Bind hint and skip button handlers
        this.bindHelperButtons();
        
        // Initialize code editor if needed
        this.initializeCodeEditor();
    }
    
    /**
     * Handle hint and skip buttons
     * @private
     */
    bindHelperButtons() {
        const hintBtn = this.container.querySelector('.hint-btn');
        const skipBtn = this.container.querySelector('.skip-btn');
        
        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.handleHintRequest());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.handleSkipRequest());
        }
        
        // Check if helpers were already used for today
        this.checkHelperStatus();
    }
    
    /**
     * Check if user has already used a helper today
     */
    async checkHelperStatus() {
        try {
            const response = await fetch('/api/challenges/helper-status');
            const data = await response.json();
            
            if (data.success && data.helperUsed) {
                this.disableHelperButtons('You have already used a helper for today\'s challenge.');
            }
        } catch (error) {
            console.error('Error checking helper status:', error);
        }
    }
    
    /**
     * Disable helper buttons
     * @param {string} message - Message to display
     */
    disableHelperButtons(message) {
        const hintBtn = this.container.querySelector('.hint-btn');
        const skipBtn = this.container.querySelector('.skip-btn');
        
        if (hintBtn) {
            hintBtn.disabled = true;
            hintBtn.classList.add('disabled');
        }
        
        if (skipBtn) {
            skipBtn.disabled = true;
            skipBtn.classList.add('disabled');
        }
        
        // Display message
        const actionsHelpers = this.container.querySelector('.challenge-actions-helpers');
        if (actionsHelpers) {
            const messageEl = document.createElement('div');
            messageEl.className = 'helper-message';
            messageEl.textContent = message;
            actionsHelpers.appendChild(messageEl);
        }
    }
    
    /**
     * Handle hint button click
     */
    async handleHintRequest() {
        const hintBtn = this.container.querySelector('.hint-btn');
        const skipBtn = this.container.querySelector('.skip-btn');
        const cost = parseInt(hintBtn.dataset.cost);
        
        // Show confirmation dialog
        if (!confirm(`Use ${cost} PyCoins to get a hint? You can only use one helper per day.`)) {
            return;
        }
        
        try {
            const response = await fetch('/api/challenges/use-helper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: this.challengeData.id,
                    helperType: 'hint',
                    cost: cost
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display the hint
                this.displayHint(data.hint);
                
                // Disable both helper buttons
                this.disableHelperButtons('You have used your helper for today.');
                
                // Update PyCoins display
                this.updatePyCoinsDisplay(data.newBalance);
            } else {
                alert(data.message || 'Could not get hint. Please try again.');
            }
        } catch (error) {
            console.error('Error requesting hint:', error);
            alert('Could not get hint. Please try again.');
        }
    }
    
    /**
     * Handle skip button click
     */
    async handleSkipRequest() {
        const skipBtn = this.container.querySelector('.skip-btn');
        const cost = parseInt(skipBtn.dataset.cost);
        
        // Show confirmation dialog
        if (!confirm(`Use ${cost} PyCoins to skip today's challenge? You can only use one helper per day.`)) {
            return;
        }
        
        try {
            const response = await fetch('/api/challenges/use-helper', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: this.challengeData.id,
                    helperType: 'skip',
                    cost: cost
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display skip success
                this.displaySkipSuccess(data);
                
                // Disable both helper buttons
                this.disableHelperButtons('You have skipped today\'s challenge.');
                
                // Update PyCoins display
                this.updatePyCoinsDisplay(data.newBalance);
            } else {
                alert(data.message || 'Could not skip challenge. Please try again.');
            }
        } catch (error) {
            console.error('Error skipping challenge:', error);
            alert('Could not skip challenge. Please try again.');
        }
    }
    
    /**
     * Display hint in the UI
     * @param {string} hint - The hint text
     */
    displayHint(hint) {
        // Create hint element if it doesn't exist
        let hintElement = this.container.querySelector('.challenge-hint');
        if (!hintElement) {
            hintElement = document.createElement('div');
            hintElement.className = 'challenge-hint';
            
            // Insert after instructions
            const instructions = this.container.querySelector('.challenge-instructions');
            if (instructions && instructions.nextSibling) {
                instructions.parentNode.insertBefore(hintElement, instructions.nextSibling);
            } else {
                const codeChallenge = this.container.querySelector('.code-challenge');
                if (codeChallenge) {
                    codeChallenge.insertBefore(hintElement, codeChallenge.firstChild);
                }
            }
        }
        
        // Set hint content
        hintElement.innerHTML = `
            <h5><i class="fas fa-lightbulb"></i> Hint:</h5>
            <p>${hint}</p>
        `;
        
        // Animate hint appearance
        hintElement.style.animation = 'fadeIn 0.5s ease';
    }
    
    /**
     * Display skip success message
     * @param {Object} data - Response data
     */
    displaySkipSuccess(data) {
        // Replace content with success message
        const codeChallenge = this.container.querySelector('.code-challenge');
        if (codeChallenge) {
            codeChallenge.innerHTML = `
                <div class="skip-success">
                    <div class="skip-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3>Challenge Skipped!</h3>
                    <p>You've been awarded ${data.xpAwarded} XP for participation.</p>
                    <p>Your streak has been maintained. Come back tomorrow for a new challenge!</p>
                    
                    <div class="skip-rewards">
                        <div class="skip-reward xp-reward-value">
                            <i class="fas fa-star"></i>
                            <span>+${data.xpAwarded} XP</span>
                        </div>
                        <div class="skip-reward streak-value">
                            <i class="fas fa-fire"></i>
                            <span>Streak: ${data.currentStreak} days</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Update the PyCoins display
     * @param {number} newBalance - New PyCoins balance
     */
    updatePyCoinsDisplay(newBalance) {
        // Find and update any PyCoins display in the UI
        const pycoinsElements = document.querySelectorAll('.user-pycoins, .pycoins-count');
        pycoinsElements.forEach(element => {
            element.textContent = newBalance;
        });
    }
    
    /**
     * Show a message to the user
     * @param {string} message - The message to display
     * @param {string} type - Message type ('success', 'error', etc.)
     */
    showMessage(message, type = 'info') {
        // First try to use a toast system if available
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        // Fallback to alert
        alert(message);
    }

    /**
     * Validate a code challenge submission
     * @param {string} code - The submitted code
     * @returns {Promise<Object>} Validation result
     */
    async validateCodeChallenge(code) {
        // This would be implemented on the server side
        // For now, we'll just return a placeholder
        return {
            success: false,
            message: 'Validation happens on the server'
        };
    }

    /**
     * Validate a quiz submission
     * @param {Array} answers - The submitted answers
     * @returns {Promise<Object>} Validation result
     */
    async validateQuiz(answers) {
        // This would be implemented on the server side
        // For now, we'll just return a placeholder
        return {
            success: false,
            message: 'Validation happens on the server'
        };
    }

    /**
     * Validate a text answer submission
     * @param {string} answer - The submitted answer
     * @returns {Promise<Object>} Validation result
     */
    async validateQuestion(answer) {
        // This would be implemented on the server side
        // For now, we'll just return a placeholder
        return {
            success: false,
            message: 'Validation happens on the server'
        };
    }

    /**
     * Initialize the code editor using ACE editor
     */
    initializeCodeEditor() {
        if (typeof ace === 'undefined') {
            console.error('ACE editor not loaded');
            return;
        }
        
        const editorElement = document.getElementById('challenge-code-editor');
        if (!editorElement) {
            console.error('Code editor element not found');
            return;
        }
        
        try {
            // Create editor instance
            this.editor = ace.edit('challenge-code-editor');
            
            // Configure editor
            this.editor.setTheme('ace/theme/monokai');
            this.editor.session.setMode('ace/mode/python');
            this.editor.setOptions({
                fontSize: '14px',
                showPrintMargin: false,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
            });
            
            // Set initial code
            const initialCode = this.challengeData.content.initial_code || '# Your code here';
            this.editor.setValue(initialCode);
            this.editor.clearSelection();
            
            console.log('✅ Code editor initialized');
        } catch (error) {
            console.error('Failed to initialize code editor:', error);
        }
    }
    
    /**
     * Run code without submitting
     */
    async runCode() {
        if (!this.editor) {
            alert('Code editor not initialized');
            return;
        }
        
        const code = this.editor.getValue();
        if (!code.trim()) {
            alert('Please write some code first');
            return;
        }
        
        // Show loading state
        const resultElement = document.getElementById('challenge-result');
        resultElement.classList.remove('hidden');
        resultElement.innerHTML = `
            <div class="result-loading">
                <div class="spinner"></div>
                <p>Running your code...</p>
            </div>
        `;
        
        try {
            const response = await fetch('/api/challenges/run-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    language: 'python'
                })
            });
            
            const data = await response.json();
            
            // Display result
            if (data.success) {
                resultElement.innerHTML = `
                    <div class="code-output ${data.error ? 'error' : 'success'}">
                        <h4>Output:</h4>
                        <pre>${data.output || 'No output'}</pre>
                        ${data.error ? `<div class="error-message"><h5>Error:</h5><pre>${data.error}</pre></div>` : ''}
                    </div>
                `;
            } else {
                resultElement.innerHTML = `
                    <div class="result-error">
                        <h4>Error:</h4>
                        <p>${data.error || 'Failed to run code'}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error running code:', error);
            resultElement.innerHTML = `
                <div class="result-error">
                    <h4>Error:</h4>
                    <p>Failed to run code. Please try again.</p>
                </div>
            `;
        }
    }
    
    /**
     * Submit solution for validation
     */
    async submitSolution() {
        if (!this.editor) {
            alert('Code editor not initialized');
            return;
        }
        
        const code = this.editor.getValue();
        if (!code.trim()) {
            alert('Please write some code first');
            return;
        }
        
        // Increment attempt count
        this.attemptCount++;
        
        // Calculate time spent
        const now = new Date();
        const timeSpent = this.challengeStartTime ? (now - this.challengeStartTime) / 1000 : 0;
        
        // Show loading state
        const resultElement = document.getElementById('challenge-result');
        resultElement.classList.remove('hidden');
        resultElement.innerHTML = `
            <div class="result-loading">
                <div class="spinner"></div>
                <p>Checking your solution...</p>
            </div>
        `;
        
        try {
            const response = await fetch('/api/challenges/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: this.challengeData.id,
                    type: this.challengeData.type,
                    code: code,
                    attemptCount: this.attemptCount,
                    timeSpent: timeSpent
                })
            });
            
            const data = await response.json();
            
            // Display result
            if (data.success) {
                // Mark challenge as completed
                this.challengeCompleted = true;
                
                // Show success message with rewards
                resultElement.innerHTML = `
                    <div class="result-success">
                        <div class="success-header">
                            <i class="fas fa-check-circle"></i>
                            <h3>Challenge Completed!</h3>
                        </div>
                        <p>${data.message || 'Great job! You solved the challenge.'}</p>
                        
                        <div class="rewards-earned">
                            <div class="reward xp-reward">
                                <i class="fas fa-star"></i>
                                <span>+${data.xp_earned} XP</span>
                            </div>
                            <div class="reward coin-reward">
                                <i class="fas fa-coins"></i>
                                <span>+${data.coins_earned} PyCoins</span>
                            </div>
                        </div>
                        
                        ${data.streak ? `
                            <div class="streak-update">
                                <i class="fas fa-fire"></i>
                                <span>Streak: ${data.streak} days</span>
                            </div>
                        ` : ''}
                        
                        ${data.achievement ? `
                            <div class="achievement-unlock">
                                <i class="fas fa-trophy"></i>
                                <span>Achievement Unlocked: ${data.achievement.name}</span>
                            </div>
                        ` : ''}
                        
                        <div class="challenge-next-steps">
                            <button class="btn btn-primary btn-next-challenge">
                                <i class="fas fa-arrow-right"></i> Continue Learning
                            </button>
                        </div>
                    </div>
                `;
                
                // Update pycoins display
                this.updatePyCoinsDisplay(data.new_balance);
                
                // Disable submit button
                const submitBtn = this.container.querySelector('.btn-submit-solution');
                if (submitBtn) {
                    submitBtn.disabled = true;
                }
                
                // Disable helper buttons
                this.disableHelperButtons('Challenge already completed!');
                
            } else {
                // Show error message with test results
                resultElement.innerHTML = `
                    <div class="result-error">
                        <div class="failure-header">
                            <i class="fas fa-times-circle"></i>
                            <h3>Not Quite Right</h3>
                        </div>
                        <p>${data.message || 'Your solution didn\'t pass all tests. Keep trying!'}</p>
                        
                        ${data.testResults ? `
                            <div class="test-results">
                                <h4>Test Results:</h4>
                                <ul class="test-list">
                                    ${data.testResults.map(test => `
                                        <li class="test-item ${test.passed ? 'passed' : 'failed'}">
                                            <div class="test-status">
                                                <i class="fas ${test.passed ? 'fa-check' : 'fa-times'}"></i>
                                            </div>
                                            <div class="test-details">
                                                <div class="test-name">${test.name || `Test ${test.input}`}</div>
                                                ${test.passed ? '' : `
                                                    <div class="test-error">
                                                        <span>Expected: ${test.expected}</span>
                                                        <span>Got: ${test.output}</span>
                                                    </div>
                                                `}
                                            </div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error submitting solution:', error);
            resultElement.innerHTML = `
                <div class="result-error">
                    <h4>Error:</h4>
                    <p>Failed to submit solution. Please try again.</p>
                </div>
            `;
        }
    }
}
