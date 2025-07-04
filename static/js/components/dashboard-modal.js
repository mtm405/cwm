/**
 * Dashboard Modal System
 * Handles all modal functionality for dashboard
 */

class DashboardModal {
    constructor() {
        this.activeModal = null;
        this.init();
    }

    init() {
        // Bind modal close events
        this.bindCloseEvents();
        
        // Make methods globally available for onclick handlers
        window.openScheduleModal = this.openScheduleModal.bind(this);
        window.closeScheduleModal = this.closeScheduleModal.bind(this);
    }

    bindCloseEvents() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
    }

    openScheduleModal() {
        const modal = document.getElementById('schedule-modal');
        if (!modal) {
            console.warn('Schedule modal not found');
            return;
        }

        this.activeModal = modal;
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        modal.classList.add('active');
        
        // Add staggered animation to table rows
        this.animateTableRows(modal);
    }

    closeScheduleModal() {
        this.closeModal();
    }

    closeModal() {
        if (!this.activeModal) return;

        document.body.style.overflow = ''; // Restore scrolling
        this.activeModal.classList.remove('active');
        
        // Reset animations for next open
        setTimeout(() => {
            if (this.activeModal && !this.activeModal.classList.contains('active')) {
                this.resetTableAnimations(this.activeModal);
            }
            this.activeModal = null;
        }, 300);
    }

    animateTableRows(modal) {
        const rows = modal.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, 100 + (index * 50)); // Staggered animation
        });
    }

    resetTableAnimations(modal) {
        const rows = modal.querySelectorAll('tbody tr');
        rows.forEach(row => {
            row.style.transition = 'none';
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
        });
    }
}

// Export for use in other modules
window.DashboardModal = DashboardModal;
