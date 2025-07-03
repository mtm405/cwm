/**
 * Profile Manager - Handles user profile functionality
 * Phase 4, Session 1: User Profile System
 */

class ProfileManager {
    constructor(userId) {
        this.userId = userId;
        this.profileData = null;
        this.stats = null;
        this.achievements = [];
        this.activities = [];
        this.isOwnProfile = false;
        this.eventListeners = new Map();
        
        // Configuration
        this.config = {
            apiEndpoint: '/api/profile',
            refreshInterval: 30000,
            maxActivities: 20,
            enableRealTimeUpdates: true
        };
        
        this.init();
    }
    
    async init() {
        console.log('🔄 Initializing Profile Manager for user:', this.userId);
        
        try {
            // Check if this is the user's own profile
            this.isOwnProfile = await this.checkOwnProfile();
            
            // Load profile data
            await this.loadProfileData();
            await this.loadStats();
            await this.loadAchievements();
            await this.loadActivities();
            
            // Initialize specialized components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            this.setupNavigation();
            
            // Render profile
            this.render();
            
            // Start real-time updates if enabled
            if (this.config.enableRealTimeUpdates) {
                this.startRealTimeUpdates();
            }
            
            console.log('✅ Profile Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Profile Manager initialization failed:', error);
            this.showError('Failed to load profile data');
        }
    }
    
    initializeComponents() {
        // Initialize Achievement System
        if (typeof AchievementSystem !== 'undefined') {
            this.achievementSystem = new AchievementSystem();
            this.achievementSystem.loadAchievements();
        }
        
        // Initialize Progress Visualization
        if (typeof ProgressVisualization !== 'undefined') {
            this.progressVisualization = new ProgressVisualization();
            this.progressVisualization.loadData();
        }
        
        console.log('📊 Profile components initialized');
    }
    
    async checkOwnProfile() {
        try {
            const response = await fetch('/api/auth/current-user');
            if (response.ok) {
                const userData = await response.json();
                return userData.user_id === this.userId;
            }
            return false;
        } catch (error) {
            console.error('Error checking own profile:', error);
            return false;
        }
    }
    
    async loadProfileData() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.profileData = data.profile;
            this.stats = data.stats;
            this.userId = data.profile.user_id;
            
            console.log('📊 Profile data loaded:', this.profileData);
            
        } catch (error) {
            console.error('Error loading profile data:', error);
            throw error;
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/stats`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.stats = data.stats;
            
            console.log('📈 Stats loaded:', this.stats);
            
        } catch (error) {
            console.error('Error loading stats:', error);
            // Use default stats if loading fails
            this.stats = this.getDefaultStats();
        }
    }
    
    async loadAchievements() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/achievements?user_id=${this.userId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.achievements = data.achievements || [];
            
            console.log('🏆 Achievements loaded:', this.achievements.length);
            
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.achievements = [];
        }
    }
    
    async loadActivities() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/activity?user_id=${this.userId}&limit=${this.config.maxActivities}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.activities = data.activities || [];
            
            console.log('📱 Activities loaded:', this.activities.length);
            
        } catch (error) {
            console.error('Error loading activities:', error);
            this.activities = [];
        }
    }
    
    async updateProfile(profileData) {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Update local data
            this.profileData = { ...this.profileData, ...profileData };
            
            // Re-render profile
            this.renderProfileInfo();
            
            this.showSuccess('Profile updated successfully');
            
            return data;
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile');
            throw error;
        }
    }
    
    async uploadAvatar(file) {
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            
            const response = await fetch(`${this.config.apiEndpoint}/avatar`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Update avatar URL
            this.profileData.avatar_url = data.avatar_url;
            
            // Update avatar display
            this.updateAvatarDisplay(data.avatar_url);
            
            this.showSuccess('Avatar updated successfully');
            
            return data;
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.showError('Failed to upload avatar');
            throw error;
        }
    }
    
    render() {
        this.renderProfileInfo();
        this.renderStats();
        this.renderAchievements();
        this.renderActivities();
        this.renderEditControls();
    }
    
    renderProfileInfo() {
        const profileHeader = document.querySelector('.profile-header');
        if (!profileHeader) return;
        
        const profile = this.profileData || {};
        const stats = this.stats || {};
        
        profileHeader.innerHTML = `
            <div class="profile-banner">
                <img src="${profile.banner_url || '/static/img/default-banner.jpg'}" alt="Profile Banner">
                ${this.isOwnProfile ? '<button class="edit-banner-btn" title="Change Banner"><i class="fas fa-camera"></i></button>' : ''}
            </div>
            <div class="profile-info">
                <div class="profile-avatar">
                    <img src="${profile.avatar_url || '/static/img/default-avatar.png'}" alt="Profile Avatar">
                    <div class="level-badge">${stats.level || 1}</div>
                    ${this.isOwnProfile ? '<button class="edit-avatar-btn" title="Change Avatar"><i class="fas fa-camera"></i></button>' : ''}
                </div>
                <div class="profile-details">
                    <h1>${profile.display_name || 'User'}</h1>
                    <p class="profile-bio">${profile.bio || 'No bio provided'}</p>
                    ${profile.location ? `<p class="profile-location"><i class="fas fa-map-marker-alt"></i> ${profile.location}</p>` : ''}
                    ${profile.website ? `<p class="profile-website"><i class="fas fa-link"></i> <a href="${profile.website}" target="_blank">${profile.website}</a></p>` : ''}
                    <div class="profile-stats">
                        <div class="stat-item">
                            <span class="stat-number">${stats.xp || 0}</span>
                            <span class="stat-label">XP</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.current_streak || 0}</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.lessons_completed || 0}</span>
                            <span class="stat-label">Lessons</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${stats.achievements_unlocked || 0}</span>
                            <span class="stat-label">Achievements</span>
                        </div>
                    </div>
                    ${this.isOwnProfile ? '<button class="edit-profile-btn btn btn-primary"><i class="fas fa-edit"></i> Edit Profile</button>' : ''}
                </div>
            </div>
        `;
    }
    
    renderStats() {
        const statsSection = document.querySelector('.profile-section.stats');
        if (!statsSection) return;
        
        const stats = this.stats || {};
        
        // Calculate level progress
        const currentLevel = stats.level || 1;
        const xpForCurrentLevel = this.getXPForLevel(currentLevel);
        const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
        const currentXP = stats.xp || 0;
        const levelProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
        
        statsSection.innerHTML = `
            <h2>📊 Learning Statistics</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🎓</div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.lessons_completed || 0}</div>
                        <div class="stat-label">Lessons Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">❓</div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.quizzes_completed || 0}</div>
                        <div class="stat-label">Quizzes Completed</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💻</div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.code_executions || 0}</div>
                        <div class="stat-label">Code Executions</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-content">
                        <div class="stat-number">${Math.floor((stats.study_time_minutes || 0) / 60)}h ${(stats.study_time_minutes || 0) % 60}m</div>
                        <div class="stat-label">Study Time</div>
                    </div>
                </div>
                <div class="stat-card level-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-content">
                        <div class="stat-number">Level ${currentLevel}</div>
                        <div class="stat-label">Current Level</div>
                        <div class="level-progress">
                            <div class="level-progress-bar">
                                <div class="level-progress-fill" style="width: ${levelProgress}%"></div>
                            </div>
                            <div class="level-progress-text">${currentXP}/${xpForNextLevel} XP</div>
                        </div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-content">
                        <div class="stat-number">${stats.current_streak || 0}</div>
                        <div class="stat-label">Current Streak</div>
                        <div class="stat-subtitle">Max: ${stats.max_streak || 0} days</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderAchievements() {
        const achievementsSection = document.querySelector('.profile-section.achievements');
        if (!achievementsSection) return;
        
        const unlockedAchievements = this.achievements.filter(a => a.unlocked);
        const lockedAchievements = this.achievements.filter(a => !a.unlocked);
        
        achievementsSection.innerHTML = `
            <h2>🏆 Achievements (${unlockedAchievements.length}/${this.achievements.length})</h2>
            <div class="achievement-categories">
                <div class="achievement-category">
                    <h3>Unlocked (${unlockedAchievements.length})</h3>
                    <div class="achievement-grid">
                        ${unlockedAchievements.map(achievement => this.renderAchievementItem(achievement)).join('')}
                    </div>
                </div>
                ${lockedAchievements.length > 0 ? `
                    <div class="achievement-category">
                        <h3>Locked (${lockedAchievements.length})</h3>
                        <div class="achievement-grid">
                            ${lockedAchievements.map(achievement => this.renderAchievementItem(achievement)).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderAchievementItem(achievement) {
        const rarityClass = `rarity-${achievement.rarity}`;
        const progressPercentage = achievement.max_progress > 0 ? 
            (achievement.progress / achievement.max_progress) * 100 : 0;
        
        return `
            <div class="achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'} ${rarityClass}"
                 data-achievement-id="${achievement.id}"
                 title="${achievement.description}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    ${!achievement.unlocked ? `
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                            </div>
                            <div class="progress-text">${achievement.progress}/${achievement.max_progress}</div>
                        </div>
                    ` : `
                        <div class="achievement-unlocked">
                            <i class="fas fa-check"></i> Unlocked
                        </div>
                    `}
                    <div class="achievement-points">${achievement.points} XP</div>
                </div>
            </div>
        `;
    }
    
    renderActivities() {
        const activitiesSection = document.querySelector('.profile-section.activities');
        if (!activitiesSection) return;
        
        activitiesSection.innerHTML = `
            <h2>📱 Recent Activity</h2>
            <div class="activity-feed">
                ${this.activities.length > 0 ? 
                    this.activities.map(activity => this.renderActivityItem(activity)).join('') :
                    '<div class="empty-state">No recent activity</div>'
                }
            </div>
        `;
    }
    
    renderActivityItem(activity) {
        const timeAgo = this.getTimeAgo(new Date(activity.created_at));
        
        return `
            <div class="activity-item" data-activity-id="${activity.id}">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }
    
    renderEditControls() {
        if (!this.isOwnProfile) return;
        
        // Profile edit modal
        const editModal = document.getElementById('profileEditModal');
        if (editModal) {
            editModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Profile</h2>
                        <button class="modal-close" type="button">&times;</button>
                    </div>
                    <form id="profileEditForm">
                        <div class="form-group">
                            <label for="display_name">Display Name</label>
                            <input type="text" id="display_name" name="display_name" 
                                   value="${this.profileData?.display_name || ''}" maxlength="50">
                        </div>
                        <div class="form-group">
                            <label for="bio">Bio</label>
                            <textarea id="bio" name="bio" maxlength="200" rows="3">${this.profileData?.bio || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="location">Location</label>
                            <input type="text" id="location" name="location" 
                                   value="${this.profileData?.location || ''}" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label for="website">Website</label>
                            <input type="url" id="website" name="website" 
                                   value="${this.profileData?.website || ''}" maxlength="200">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="profile_public" 
                                       ${this.profileData?.profile_public ? 'checked' : ''}>
                                Make profile public
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary cancel-edit">Cancel</button>
                            <button type="submit" class="btn btn-primary save-profile">Save Changes</button>
                        </div>
                    </form>
                </div>
            `;
        }
    }
    
    setupEventListeners() {
        // Edit profile button
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.showEditProfileModal());
        }
        
        // Avatar change button
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => this.showAvatarUploadModal());
        }
        
        // Share profile button
        const shareProfileBtn = document.getElementById('shareProfileBtn');
        if (shareProfileBtn) {
            shareProfileBtn.addEventListener('click', () => this.shareProfile());
        }
        
        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettings());
        }
        
        // Modal close buttons
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
        
        // Edit profile form
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditProfile(e);
            });
        }
        
        // Avatar upload
        const avatarFileInput = document.getElementById('avatarFileInput');
        if (avatarFileInput) {
            avatarFileInput.addEventListener('change', (e) => this.handleAvatarPreview(e));
        }
        
        const saveAvatarBtn = document.getElementById('saveAvatarBtn');
        if (saveAvatarBtn) {
            saveAvatarBtn.addEventListener('click', () => this.handleAvatarUpload());
        }
        
        // Activity filters
        const activityFilters = document.querySelectorAll('.activity-filters .filter-btn');
        activityFilters.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterActivities(e.target.dataset.filter));
        });
        
        console.log('📝 Event listeners set up');
    }
    
    showEditProfileModal() {
        const modal = document.getElementById('editProfileModal');
        if (!modal) return;
        
        // Pre-fill form with current profile data
        if (this.profileData) {
            document.getElementById('displayName').value = this.profileData.display_name || '';
            document.getElementById('bio').value = this.profileData.bio || '';
            document.getElementById('location').value = this.profileData.location || '';
            document.getElementById('website').value = this.profileData.website || '';
            document.getElementById('profilePublic').checked = this.profileData.profile_public || false;
            document.getElementById('showProgress').checked = this.profileData.show_progress || false;
            document.getElementById('showAchievements').checked = this.profileData.show_achievements || false;
        }
        
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    showAvatarUploadModal() {
        const modal = document.getElementById('avatarUploadModal');
        if (!modal) return;
        
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    async handleEditProfile(event) {
        const formData = new FormData(event.target);
        const profileData = Object.fromEntries(formData.entries());
        
        // Convert checkboxes to boolean
        profileData.profile_public = formData.has('profile_public');
        profileData.show_progress = formData.has('show_progress');
        profileData.show_achievements = formData.has('show_achievements');
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.config.apiEndpoint}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            
            const result = await response.json();
            if (result.success) {
                this.profileData = { ...this.profileData, ...profileData };
                this.updateProfileDisplay();
                this.closeModal(document.getElementById('editProfileModal'));
                this.showSuccess('Profile updated successfully!');
            } else {
                throw new Error(result.error || 'Failed to update profile');
            }
            
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Failed to update profile. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    handleAvatarPreview(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatarPreview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
    
    async handleAvatarUpload() {
        const fileInput = document.getElementById('avatarFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showError('Please select an image file');
            return;
        }
        
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            this.showLoading();
            
            const response = await fetch(`${this.config.apiEndpoint}/avatar`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload avatar');
            }
            
            const result = await response.json();
            if (result.success) {
                // Update avatar display
                const avatarImg = document.getElementById('profileAvatar');
                avatarImg.src = result.avatar_url;
                
                this.closeModal(document.getElementById('avatarUploadModal'));
                this.showSuccess('Avatar updated successfully!');
            } else {
                throw new Error(result.error || 'Failed to upload avatar');
            }
            
        } catch (error) {
            console.error('Error uploading avatar:', error);
            this.showError('Failed to upload avatar. Please try again.');
        } finally {
            this.hideLoading();
        }
    }
    
    shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: `${this.profileData.display_name || 'User'}'s Profile`,
                text: `Check out my learning progress on ES6 Learning Platform!`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showSuccess('Profile link copied to clipboard!');
            }).catch(() => {
                this.showError('Failed to copy link to clipboard');
            });
        }
    }
    
    openSettings() {
        // Navigate to settings page or open settings modal
        window.location.href = '/settings';
    }
    
    updateProfileDisplay() {
        // Update display name
        const displayNameEl = document.getElementById('profileDisplayName');
        if (displayNameEl) {
            displayNameEl.textContent = this.profileData.display_name || this.profileData.email || 'Unknown User';
        }
        
        // Update bio
        const bioEl = document.getElementById('profileBio');
        if (bioEl) {
            bioEl.textContent = this.profileData.bio || 'No bio available';
        }
    }
    
    filterActivities(filter) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach(item => {
            const activityType = item.dataset.activityType;
            const shouldShow = filter === 'all' || activityType === filter;
            item.style.display = shouldShow ? 'block' : 'none';
        });
        
        // Update active filter button
        const filterButtons = document.querySelectorAll('.activity-filters .filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }
    
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
            overlay.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Helper methods
    getDefaultStats() {
        return {
            xp: 0,
            level: 1,
            lessons_completed: 0,
            quizzes_completed: 0,
            code_executions: 0,
            study_time_minutes: 0,
            current_streak: 0,
            max_streak: 0,
            achievements_unlocked: 0
        };
    }
    
    getXPForLevel(level) {
        if (level <= 1) return 0;
        if (level === 2) return 100;
        if (level === 3) return 250;
        if (level === 4) return 500;
        if (level === 5) return 1000;
        return 2000 + (level - 5) * 1000;
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    
    getCSRFToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.getAttribute('content') : '';
    }
    
    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Event emitter methods
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                callback(data);
            });
        }
    }
    
    destroy() {
        // Clean up event listeners and timers
        this.eventListeners.clear();
        console.log('🧹 Profile Manager destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
} else {
    window.ProfileManager = ProfileManager;
}
