/**
 * Activity Renderer
 * Specialized rendering system for different activity types
 * Phase 6 - Navigation & Activity System
 */

class ActivityRenderer {
    constructor(options = {}) {
        this.config = {
            enableAnimations: options.enableAnimations !== false,
            enableIcons: options.enableIcons !== false,
            dateFormat: options.dateFormat || 'relative',
            theme: options.theme || 'default',
            compactMode: options.compactMode || false,
            showMetadata: options.showMetadata !== false,
            enableActions: options.enableActions !== false,
            truncateLength: options.truncateLength || 150,
            ...options
        };
        
        this.templates = new Map();
        this.formatters = new Map();
        this.cache = new Map();
        
        this.init();
    }
    
    /**
     * Initialize activity renderer
     */
    init() {
        this.setupTemplates();
        this.setupFormatters();
        this.setupTheme();
        
        console.log('🎨 Activity Renderer initialized');
    }
    
    /**
     * Set up activity templates
     */
    setupTemplates() {
        // Base template for all activities
        this.templates.set('base', {
            render: (activity, options = {}) => this.renderBaseActivity(activity, options)
        });
        
        // Lesson completion template
        this.templates.set('lesson_completed', {
            render: (activity, options = {}) => this.renderLessonCompleted(activity, options)
        });
        
        // Achievement earned template
        this.templates.set('achievement_earned', {
            render: (activity, options = {}) => this.renderAchievementEarned(activity, options)
        });
        
        // Challenge completed template
        this.templates.set('challenge_completed', {
            render: (activity, options = {}) => this.renderChallengeCompleted(activity, options)
        });
        
        // Quiz completed template
        this.templates.set('quiz_completed', {
            render: (activity, options = {}) => this.renderQuizCompleted(activity, options)
        });
        
        // Project submitted template
        this.templates.set('project_submitted', {
            render: (activity, options = {}) => this.renderProjectSubmitted(activity, options)
        });
        
        // Certificate earned template
        this.templates.set('certificate_earned', {
            render: (activity, options = {}) => this.renderCertificateEarned(activity, options)
        });
        
        // Badge earned template
        this.templates.set('badge_earned', {
            render: (activity, options = {}) => this.renderBadgeEarned(activity, options)
        });
        
        // Streak milestone template
        this.templates.set('streak_milestone', {
            render: (activity, options = {}) => this.renderStreakMilestone(activity, options)
        });
        
        // Course enrolled template
        this.templates.set('course_enrolled', {
            render: (activity, options = {}) => this.renderCourseEnrolled(activity, options)
        });
    }
    
    /**
     * Set up formatters
     */
    setupFormatters() {
        // Date formatters
        this.formatters.set('date', {
            relative: (timestamp) => this.formatRelativeTime(timestamp),
            absolute: (timestamp) => this.formatAbsoluteTime(timestamp),
            compact: (timestamp) => this.formatCompactTime(timestamp)
        });
        
        // Duration formatters
        this.formatters.set('duration', {
            seconds: (duration) => this.formatDuration(duration, 'seconds'),
            minutes: (duration) => this.formatDuration(duration, 'minutes'),
            hours: (duration) => this.formatDuration(duration, 'hours')
        });
        
        // Score formatters
        this.formatters.set('score', {
            percentage: (score, total) => this.formatPercentage(score, total),
            fraction: (score, total) => this.formatFraction(score, total),
            points: (score) => this.formatPoints(score)
        });
        
        // Text formatters
        this.formatters.set('text', {
            truncate: (text, length) => this.truncateText(text, length),
            highlight: (text, query) => this.highlightText(text, query),
            sanitize: (text) => this.sanitizeText(text)
        });
    }
    
    /**
     * Set up theme
     */
    setupTheme() {
        this.themeClasses = {
            default: 'activity-theme-default',
            minimal: 'activity-theme-minimal',
            card: 'activity-theme-card',
            compact: 'activity-theme-compact'
        };
        
        this.iconSets = {
            default: {
                lesson: 'fas fa-book',
                achievement: 'fas fa-trophy',
                challenge: 'fas fa-puzzle-piece',
                quiz: 'fas fa-question-circle',
                project: 'fas fa-code',
                certificate: 'fas fa-certificate',
                badge: 'fas fa-shield-alt',
                streak: 'fas fa-fire',
                course: 'fas fa-graduation-cap'
            },
            minimal: {
                lesson: '📚',
                achievement: '🏆',
                challenge: '🧩',
                quiz: '❓',
                project: '💻',
                certificate: '📜',
                badge: '🛡️',
                streak: '🔥',
                course: '🎓'
            }
        };
    }
    
    /**
     * Render activity based on type
     */
    render(activity, options = {}) {
        const cacheKey = this.getCacheKey(activity, options);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        const mergedOptions = { ...this.config, ...options };
        const template = this.templates.get(activity.type) || this.templates.get('base');
        
        try {
            const element = template.render(activity, mergedOptions);
            
            // Add common classes and attributes
            this.applyCommonStyling(element, activity, mergedOptions);
            
            // Add animations if enabled
            if (mergedOptions.enableAnimations) {
                this.addAnimation(element, activity);
            }
            
            // Cache the result
            this.cache.set(cacheKey, element);
            
            return element;
            
        } catch (error) {
            console.error('Failed to render activity:', error);
            return this.renderErrorFallback(activity);
        }
    }
    
    /**
     * Render base activity template
     */
    renderBaseActivity(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-base';
        
        const icon = this.renderIcon(activity.type, options);
        const content = this.renderContent(activity, options);
        const timestamp = this.renderTimestamp(activity.timestamp, options);
        const actions = this.renderActions(activity, options);
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                ${content}
                ${timestamp}
            </div>
            ${actions}
        `;
        
        return element;
    }
    
    /**
     * Render lesson completed activity
     */
    renderLessonCompleted(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-lesson-completed';
        
        const icon = this.renderIcon('lesson', options);
        const duration = activity.metadata?.duration || 0;
        const score = activity.metadata?.score || 0;
        const totalQuestions = activity.metadata?.totalQuestions || 0;
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Completed Lesson</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong>${this.sanitizeText(activity.title || 'Untitled Lesson')}</strong>
                </div>
                <div class="activity-metadata">
                    ${duration > 0 ? `<span class="metadata-item">⏱️ ${this.formatDuration(duration)}</span>` : ''}
                    ${score > 0 && totalQuestions > 0 ? `<span class="metadata-item">📊 ${score}/${totalQuestions} correct</span>` : ''}
                    ${activity.metadata?.difficulty ? `<span class="metadata-item difficulty-${activity.metadata.difficulty}">📈 ${activity.metadata.difficulty}</span>` : ''}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render achievement earned activity
     */
    renderAchievementEarned(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-achievement-earned';
        
        const icon = this.renderIcon('achievement', options);
        const rarity = activity.metadata?.rarity || 'common';
        const points = activity.metadata?.points || 0;
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Achievement Unlocked!</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong class="achievement-name rarity-${rarity}">${this.sanitizeText(activity.title)}</strong>
                    <p class="achievement-description">${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item rarity-${rarity}">✨ ${rarity}</span>
                    ${points > 0 ? `<span class="metadata-item">🏅 ${points} points</span>` : ''}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render challenge completed activity
     */
    renderChallengeCompleted(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-challenge-completed';
        
        const icon = this.renderIcon('challenge', options);
        const attempts = activity.metadata?.attempts || 1;
        const timeSpent = activity.metadata?.timeSpent || 0;
        const difficulty = activity.metadata?.difficulty || 'medium';
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Challenge Completed</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong>${this.sanitizeText(activity.title)}</strong>
                    <p>${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item difficulty-${difficulty}">🎯 ${difficulty}</span>
                    <span class="metadata-item">🔄 ${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}</span>
                    ${timeSpent > 0 ? `<span class="metadata-item">⏱️ ${this.formatDuration(timeSpent)}</span>` : ''}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render quiz completed activity
     */
    renderQuizCompleted(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-quiz-completed';
        
        const icon = this.renderIcon('quiz', options);
        const score = activity.metadata?.score || 0;
        const totalQuestions = activity.metadata?.totalQuestions || 0;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        const passed = percentage >= (activity.metadata?.passingScore || 70);
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Quiz ${passed ? 'Passed' : 'Completed'}</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong>${this.sanitizeText(activity.title)}</strong>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item score-${passed ? 'pass' : 'fail'}">
                        📊 ${score}/${totalQuestions} (${percentage}%)
                    </span>
                    ${passed ? '<span class="metadata-item">✅ Passed</span>' : '<span class="metadata-item">❌ Try again</span>'}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render project submitted activity
     */
    renderProjectSubmitted(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-project-submitted';
        
        const icon = this.renderIcon('project', options);
        const language = activity.metadata?.language || 'Code';
        const linesOfCode = activity.metadata?.linesOfCode || 0;
        const status = activity.metadata?.status || 'submitted';
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Project Submitted</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong>${this.sanitizeText(activity.title)}</strong>
                    <p>${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item">💻 ${language}</span>
                    ${linesOfCode > 0 ? `<span class="metadata-item">📝 ${linesOfCode} lines</span>` : ''}
                    <span class="metadata-item status-${status}">📤 ${status}</span>
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render certificate earned activity
     */
    renderCertificateEarned(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-certificate-earned';
        
        const icon = this.renderIcon('certificate', options);
        const institution = activity.metadata?.institution || 'Code with Morais';
        const validUntil = activity.metadata?.validUntil;
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Certificate Earned</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong class="certificate-name">${this.sanitizeText(activity.title)}</strong>
                    <p class="certificate-description">${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item">🏛️ ${institution}</span>
                    ${validUntil ? `<span class="metadata-item">📅 Valid until ${this.formatAbsoluteTime(validUntil)}</span>` : ''}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render badge earned activity
     */
    renderBadgeEarned(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-badge-earned';
        
        const icon = this.renderIcon('badge', options);
        const category = activity.metadata?.category || 'General';
        const level = activity.metadata?.level || 1;
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Badge Earned</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong class="badge-name">${this.sanitizeText(activity.title)}</strong>
                    <p class="badge-description">${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item">📂 ${category}</span>
                    <span class="metadata-item">⭐ Level ${level}</span>
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render streak milestone activity
     */
    renderStreakMilestone(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-streak-milestone';
        
        const icon = this.renderIcon('streak', options);
        const days = activity.metadata?.days || 1;
        const type = activity.metadata?.type || 'daily';
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Streak Milestone!</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong class="streak-milestone">${days} Day${days !== 1 ? 's' : ''} ${type} Streak</strong>
                    <p>${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item">🔥 ${days} days</span>
                    <span class="metadata-item">📅 ${type}</span>
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render course enrolled activity
     */
    renderCourseEnrolled(activity, options) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-course-enrolled';
        
        const icon = this.renderIcon('course', options);
        const instructor = activity.metadata?.instructor || 'Unknown';
        const duration = activity.metadata?.duration || 0;
        const lessons = activity.metadata?.lessons || 0;
        
        element.innerHTML = `
            ${icon}
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Enrolled in Course</h3>
                    <time class="activity-time">${this.formatTime(activity.timestamp, options)}</time>
                </div>
                <div class="activity-description">
                    <strong class="course-name">${this.sanitizeText(activity.title)}</strong>
                    <p class="course-description">${this.sanitizeText(activity.description)}</p>
                </div>
                <div class="activity-metadata">
                    <span class="metadata-item">👨‍🏫 ${instructor}</span>
                    ${lessons > 0 ? `<span class="metadata-item">📚 ${lessons} lessons</span>` : ''}
                    ${duration > 0 ? `<span class="metadata-item">⏱️ ${this.formatDuration(duration)}</span>` : ''}
                </div>
            </div>
            ${this.renderActions(activity, options)}
        `;
        
        return element;
    }
    
    /**
     * Render activity icon
     */
    renderIcon(type, options) {
        if (!options.enableIcons) return '';
        
        const iconSet = this.iconSets[options.theme] || this.iconSets.default;
        const iconClass = iconSet[type] || iconSet.lesson;
        
        if (typeof iconClass === 'string' && iconClass.startsWith('fa')) {
            return `<div class="activity-icon"><i class="${iconClass}" aria-hidden="true"></i></div>`;
        } else {
            return `<div class="activity-icon"><span class="emoji-icon">${iconClass}</span></div>`;
        }
    }
    
    /**
     * Render activity content
     */
    renderContent(activity, options) {
        const title = this.sanitizeText(activity.title || 'Untitled Activity');
        const description = activity.description ? 
            this.truncateText(this.sanitizeText(activity.description), options.truncateLength) : '';
        
        return `
            <div class="activity-header">
                <h3 class="activity-title">${title}</h3>
            </div>
            ${description ? `<div class="activity-description">${description}</div>` : ''}
        `;
    }
    
    /**
     * Render timestamp
     */
    renderTimestamp(timestamp, options) {
        const formattedTime = this.formatTime(timestamp, options);
        return `<time class="activity-time" datetime="${timestamp}">${formattedTime}</time>`;
    }
    
    /**
     * Render activity actions
     */
    renderActions(activity, options) {
        if (!options.enableActions || !activity.actions?.length) return '';
        
        const actions = activity.actions.map(action => 
            `<button class="activity-action-btn" data-action="${action.type}" data-target="${action.target || ''}">
                ${this.sanitizeText(action.label)}
            </button>`
        ).join('');
        
        return `<div class="activity-actions">${actions}</div>`;
    }
    
    /**
     * Apply common styling
     */
    applyCommonStyling(element, activity, options) {
        // Add theme class
        const themeClass = this.themeClasses[options.theme] || this.themeClasses.default;
        element.classList.add(themeClass);
        
        // Add compact mode class
        if (options.compactMode) {
            element.classList.add('activity-compact');
        }
        
        // Add priority class
        if (activity.priority) {
            element.classList.add(`activity-priority-${activity.priority}`);
        }
        
        // Add accessibility attributes
        element.setAttribute('role', 'article');
        element.setAttribute('tabindex', '0');
        element.setAttribute('aria-label', `Activity: ${activity.title || 'Untitled'}`);
        
        // Add data attributes
        element.dataset.activityId = activity.id;
        element.dataset.activityType = activity.type;
        element.dataset.timestamp = activity.timestamp;
    }
    
    /**
     * Add animation to element
     */
    addAnimation(element, activity) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation on next frame
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
        
        // Add entrance animation class
        element.classList.add('activity-animate-in');
        
        // Remove animation class after completion
        setTimeout(() => {
            element.classList.remove('activity-animate-in');
            element.style.transition = '';
        }, 300);
    }
    
    /**
     * Render error fallback
     */
    renderErrorFallback(activity) {
        const element = document.createElement('div');
        element.className = 'activity-item activity-error';
        element.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            </div>
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">Activity Error</h3>
                </div>
                <div class="activity-description">
                    Failed to render activity: ${this.sanitizeText(activity.id || 'Unknown')}
                </div>
            </div>
        `;
        return element;
    }
    
    /**
     * Format time based on options
     */
    formatTime(timestamp, options) {
        const formatter = this.formatters.get('date')[options.dateFormat];
        return formatter ? formatter(timestamp) : this.formatRelativeTime(timestamp);
    }
    
    /**
     * Format relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return past.toLocaleDateString();
    }
    
    /**
     * Format absolute time
     */
    formatAbsoluteTime(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Format compact time
     */
    formatCompactTime(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Format duration
     */
    formatDuration(seconds, unit = 'auto') {
        if (unit === 'auto') {
            if (seconds < 60) return `${seconds}s`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
        }
        
        switch (unit) {
            case 'seconds': return `${seconds}s`;
            case 'minutes': return `${Math.floor(seconds / 60)}m`;
            case 'hours': return `${Math.floor(seconds / 3600)}h`;
            default: return `${seconds}s`;
        }
    }
    
    /**
     * Format percentage
     */
    formatPercentage(score, total) {
        if (total === 0) return '0%';
        return `${Math.round((score / total) * 100)}%`;
    }
    
    /**
     * Format fraction
     */
    formatFraction(score, total) {
        return `${score}/${total}`;
    }
    
    /**
     * Format points
     */
    formatPoints(points) {
        return points.toLocaleString();
    }
    
    /**
     * Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    
    /**
     * Highlight text
     */
    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    /**
     * Sanitize text
     */
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Get cache key
     */
    getCacheKey(activity, options) {
        return `${activity.id}-${activity.type}-${JSON.stringify(options)}`;
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
    
    /**
     * Add custom template
     */
    addTemplate(type, template) {
        this.templates.set(type, template);
    }
    
    /**
     * Remove template
     */
    removeTemplate(type) {
        this.templates.delete(type);
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.clearCache(); // Clear cache when config changes
    }
    
    /**
     * Get supported activity types
     */
    getSupportedTypes() {
        return Array.from(this.templates.keys());
    }
    
    /**
     * Destroy renderer
     */
    destroy() {
        this.templates.clear();
        this.formatters.clear();
        this.cache.clear();
        
        console.log('🎨 Activity Renderer destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityRenderer;
} else {
    window.ActivityRenderer = ActivityRenderer;
}
