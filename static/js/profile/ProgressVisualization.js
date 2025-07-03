/**
 * Progress Visualization - Handles interactive charts and progress displays
 * Phase 4, Session 1: User Profile System
 */

class ProgressVisualization {
    constructor() {
        this.charts = {};
        this.data = {};
        this.container = null;
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };
    }

    async loadData() {
        try {
            const response = await fetch('/api/profile/stats');
            const data = await response.json();
            
            if (data.success) {
                this.data = data.stats;
                return true;
            }
            throw new Error(data.error || 'Failed to load progress data');
        } catch (error) {
            console.error('Error loading progress data:', error);
            return false;
        }
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = this.generateVisualizationHTML();
        this.initializeCharts();
        this.bindEvents();
    }

    generateVisualizationHTML() {
        return `
            <div class="progress-visualization">
                <div class="visualization-header">
                    <h3>
                        <i class="fas fa-chart-line"></i>
                        Progress Overview
                    </h3>
                    <div class="time-range-selector">
                        <button class="time-btn active" data-range="7d">7 Days</button>
                        <button class="time-btn" data-range="30d">30 Days</button>
                        <button class="time-btn" data-range="90d">90 Days</button>
                        <button class="time-btn" data-range="1y">1 Year</button>
                        <button class="time-btn" data-range="all">All Time</button>
                    </div>
                </div>

                <div class="stats-overview">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Lessons Completed</h4>
                            <span class="stat-value">${this.data.lessons_completed || 0}</span>
                            <span class="stat-change positive">+${this.data.recent_lessons || 0} this week</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-code"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Code Executions</h4>
                            <span class="stat-value">${this.data.code_executions || 0}</span>
                            <span class="stat-change positive">+${this.data.recent_executions || 0} this week</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Time Spent</h4>
                            <span class="stat-value">${this.formatTime(this.data.total_time || 0)}</span>
                            <span class="stat-change positive">+${this.formatTime(this.data.recent_time || 0)} this week</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-fire"></i>
                        </div>
                        <div class="stat-content">
                            <h4>Current Streak</h4>
                            <span class="stat-value">${this.data.current_streak || 0}</span>
                            <span class="stat-change">days</span>
                        </div>
                    </div>
                </div>

                <div class="charts-container">
                    <div class="chart-section">
                        <h4>Learning Progress</h4>
                        <div class="chart-wrapper">
                            <canvas id="progressChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-section">
                        <h4>Activity Heatmap</h4>
                        <div class="chart-wrapper">
                            <canvas id="activityChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-section">
                        <h4>Skills Breakdown</h4>
                        <div class="chart-wrapper">
                            <canvas id="skillsChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-section">
                        <h4>Weekly Activity</h4>
                        <div class="chart-wrapper">
                            <canvas id="weeklyChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="detailed-progress">
                    <h4>Detailed Progress</h4>
                    <div class="progress-categories">
                        ${this.generateProgressCategories()}
                    </div>
                </div>
            </div>
        `;
    }

    generateProgressCategories() {
        const categories = this.data.progress_by_category || {};
        
        return Object.entries(categories).map(([category, progress]) => {
            const percentage = Math.round((progress.completed / progress.total) * 100);
            
            return `
                <div class="progress-category">
                    <div class="category-header">
                        <h5>${category}</h5>
                        <span class="percentage">${percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="category-details">
                        <span>${progress.completed}/${progress.total} completed</span>
                        <span class="time-spent">${this.formatTime(progress.time_spent || 0)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    initializeCharts() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            this.loadChartJS().then(() => {
                this.createCharts();
            });
        } else {
            this.createCharts();
        }
    }

    async loadChartJS() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    createCharts() {
        this.createProgressChart();
        this.createActivityChart();
        this.createSkillsChart();
        this.createWeeklyChart();
    }

    createProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const progressData = this.data.daily_progress || [];
        const labels = progressData.map(d => new Date(d.date).toLocaleDateString());
        const lessonData = progressData.map(d => d.lessons_completed || 0);
        const timeData = progressData.map(d => d.time_spent || 0);

        this.charts.progress = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lessons Completed',
                    data: lessonData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y'
                }, {
                    label: 'Time Spent (minutes)',
                    data: timeData,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    yAxisID: 'y1'
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Lessons'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Minutes'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    createActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        const activityData = this.data.activity_heatmap || [];
        
        // Convert activity data to heatmap format
        const heatmapData = activityData.map(d => ({
            x: new Date(d.date).getDay(),
            y: Math.floor((new Date(d.date) - new Date(d.date).setHours(0,0,0,0)) / (1000 * 60 * 60)),
            v: d.activity_count || 0
        }));

        this.charts.activity = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Activity Level',
                    data: heatmapData,
                    backgroundColor: function(context) {
                        const value = context.parsed.v;
                        const alpha = Math.min(value / 10, 1);
                        return `rgba(75, 192, 192, ${alpha})`;
                    },
                    pointRadius: 8
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: 0,
                        max: 6,
                        ticks: {
                            callback: function(value) {
                                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                                return days[value];
                            }
                        },
                        title: {
                            display: true,
                            text: 'Day of Week'
                        }
                    },
                    y: {
                        type: 'linear',
                        min: 0,
                        max: 23,
                        title: {
                            display: true,
                            text: 'Hour of Day'
                        }
                    }
                }
            }
        });
    }

    createSkillsChart() {
        const ctx = document.getElementById('skillsChart');
        if (!ctx) return;

        const skillsData = this.data.skills_progress || {};
        const labels = Object.keys(skillsData);
        const values = Object.values(skillsData);

        this.charts.skills = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40',
                        '#FF6384',
                        '#C9CBCF'
                    ]
                }]
            },
            options: {
                ...this.chartOptions,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    createWeeklyChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        const weeklyData = this.data.weekly_activity || [];
        const labels = weeklyData.map(d => `Week ${d.week}`);
        const values = weeklyData.map(d => d.total_time || 0);

        this.charts.weekly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Time Spent (minutes)',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.chartOptions,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Minutes'
                        }
                    }
                }
            }
        });
    }

    bindEvents() {
        // Time range selector
        const timeButtons = this.container.querySelectorAll('.time-btn');
        timeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const range = e.target.dataset.range;
                this.changeTimeRange(range);
                
                // Update active button
                timeButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Resize charts on window resize
        window.addEventListener('resize', () => {
            this.resizeCharts();
        });
    }

    async changeTimeRange(range) {
        try {
            const response = await fetch(`/api/profile/stats?range=${range}`);
            const data = await response.json();
            
            if (data.success) {
                this.data = data.stats;
                this.updateCharts();
                this.updateStats();
            }
        } catch (error) {
            console.error('Error changing time range:', error);
        }
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });
        this.createCharts();
    }

    updateStats() {
        // Update stat cards
        const statCards = this.container.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const statType = card.querySelector('h4').textContent;
            const statValue = card.querySelector('.stat-value');
            const statChange = card.querySelector('.stat-change');
            
            switch (statType) {
                case 'Lessons Completed':
                    statValue.textContent = this.data.lessons_completed || 0;
                    statChange.textContent = `+${this.data.recent_lessons || 0} this week`;
                    break;
                case 'Code Executions':
                    statValue.textContent = this.data.code_executions || 0;
                    statChange.textContent = `+${this.data.recent_executions || 0} this week`;
                    break;
                case 'Time Spent':
                    statValue.textContent = this.formatTime(this.data.total_time || 0);
                    statChange.textContent = `+${this.formatTime(this.data.recent_time || 0)} this week`;
                    break;
                case 'Current Streak':
                    statValue.textContent = this.data.current_streak || 0;
                    break;
            }
        });

        // Update progress categories
        const progressCategories = this.container.querySelector('.progress-categories');
        progressCategories.innerHTML = this.generateProgressCategories();
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }

    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return `${days}d ${hours}h`;
        }
    }

    // Public API methods
    async refreshData() {
        await this.loadData();
        this.updateCharts();
        this.updateStats();
    }

    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `progress_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });
        this.charts = {};
    }
}

// Export for use in other modules
window.ProgressVisualization = ProgressVisualization;
