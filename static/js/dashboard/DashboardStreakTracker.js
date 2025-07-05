/**
 * DashboardStreakTracker.js
 * Handles tracking and visualization of user challenge streaks in the dashboard
 */

import { AppUtils } from '../utils/AppUtils.js';

export class DashboardStreakTracker {
    constructor() {
        this.container = null;
        this.userData = null;
        this.streakData = null;
        this.initialized = false;
    }

    /**
     * Initialize the streak tracker
     * @param {HTMLElement} container - Container element for the streak tracker
     */
    async init(container) {
        this.container = container || document.querySelector('#challenge-tab .streak-container');
        
        if (!this.container) {
            console.error('Streak tracker container not found');
            return;
        }
        
        try {
            await this.fetchStreakData();
            this.render();
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize streak tracker:', error);
            this.renderError();
        }
    }

    /**
     * Fetch streak data from the server
     */
    async fetchStreakData() {
        try {
            const response = await fetch('/api/user/streak');
            const data = await response.json();
            
            if (data.success) {
                this.streakData = data.streak;
                this.userData = data.user || {};
                return true;
            }
            throw new Error(data.error || 'Failed to load streak data');
        } catch (error) {
            console.error('Error loading streak data:', error);
            throw error;
        }
    }

    /**
     * Render the streak tracker
     */
    render() {
        if (!this.streakData) {
            this.renderNoStreakData();
            return;
        }

        const currentStreak = this.streakData.current || 0;
        const longestStreak = this.streakData.longest || 0;
        const lastCompletedDate = this.streakData.lastCompletedDate;
        const completionDates = this.streakData.completionDates || [];
        
        // Calculate time until next challenge
        const nextChallengeTime = this.calculateNextChallengeTime(lastCompletedDate);
        const timeRemaining = AppUtils.getTimeUntilNextChallenge(nextChallengeTime);
        
        // Generate calendar visualization
        const calendarHtml = this.generateCalendarView(completionDates);
        
        this.container.innerHTML = `
            <div class="streak-tracker">
                <div class="streak-stats">
                    <div class="streak-stat current-streak">
                        <span class="streak-value">${currentStreak}</span>
                        <span class="streak-label">Current Streak</span>
                    </div>
                    <div class="streak-stat longest-streak">
                        <span class="streak-value">${longestStreak}</span>
                        <span class="streak-label">Longest Streak</span>
                    </div>
                    <div class="streak-stat next-challenge">
                        <span class="streak-value">${timeRemaining}</span>
                        <span class="streak-label">Next Challenge</span>
                    </div>
                </div>
                
                <div class="streak-calendar">
                    <h4>Challenge Activity</h4>
                    ${calendarHtml}
                </div>
            </div>
        `;
    }

    /**
     * Generate a calendar visualization of challenge completions
     * @param {Array} completionDates - Array of dates when challenges were completed
     * @returns {string} HTML for the calendar visualization
     */
    generateCalendarView(completionDates) {
        // Convert string dates to Date objects
        const completionSet = new Set(completionDates.map(date => {
            const d = new Date(date);
            return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
        }));
        
        // Generate last 4 weeks (28 days) of calendar cells
        const today = new Date();
        const days = [];
        
        for (let i = 27; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const dateKey = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
            const isCompleted = completionSet.has(dateKey);
            
            days.push({
                date,
                dateKey,
                isCompleted,
                isToday: i === 0
            });
        }
        
        // Group by week
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }
        
        // Generate HTML
        let html = '<div class="calendar-grid">';
        
        // Day labels
        html += '<div class="day-labels">';
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        dayLabels.forEach(day => {
            html += `<div class="day-label">${day}</div>`;
        });
        html += '</div>';
        
        // Calendar cells
        weeks.forEach(week => {
            html += '<div class="calendar-week">';
            week.forEach(day => {
                const cellClass = `calendar-day ${day.isCompleted ? 'completed' : ''} ${day.isToday ? 'today' : ''}`;
                const dateString = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                html += `
                    <div class="${cellClass}" title="${dateString}">
                        <div class="day-indicator"></div>
                    </div>
                `;
            });
            html += '</div>';
        });
        
        html += '</div>';
        return html;
    }

    /**
     * Calculate when the next challenge will be available
     * @param {string} lastCompletedDate - ISO date string of last completion
     * @returns {Date} Date when next challenge will be available
     */
    calculateNextChallengeTime(lastCompletedDate) {
        const now = new Date();
        
        // If no last completion, challenge is available now
        if (!lastCompletedDate) {
            return now;
        }
        
        const lastDate = new Date(lastCompletedDate);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // If last completion was before today, challenge is available now
        if (lastDay < today) {
            return now;
        }
        
        // If last completion was today, next challenge is tomorrow at midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        return tomorrow;
    }

    /**
     * Render error state
     */
    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="streak-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load streak data</p>
                <button class="btn btn-sm btn-retry">Retry</button>
            </div>
        `;
        
        this.container.querySelector('.btn-retry').addEventListener('click', async () => {
            try {
                await this.fetchStreakData();
                this.render();
            } catch (error) {
                console.error('Failed to retry loading streak data:', error);
            }
        });
    }

    /**
     * Render empty state when no streak data is available
     */
    renderNoStreakData() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="streak-empty">
                <i class="fas fa-calendar-alt"></i>
                <p>Complete your first daily challenge to start your streak!</p>
            </div>
        `;
    }

    /**
     * Update the streak tracker with new data
     * @param {Object} streakData - New streak data
     */
    update(streakData) {
        if (!this.initialized) {
            this.init();
            return;
        }
        
        this.streakData = streakData;
        this.render();
    }
}
