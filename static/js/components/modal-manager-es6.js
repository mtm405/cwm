/**
 * Modal Management System - ES6 Module
 * Provides functions to show, hide, and manage reusable modal components
 */

export class ModalManager {
    constructor() {
        this.activeModals = [];
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        console.log('✅ ModalManager initialized');
    }
    
    setupEventListeners() {
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopModal();
            }
        });
        
        // Handle backdrop clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal && modal.id) {
                    this.closeModal(modal.id);
                }
            }
        });
        
        // Handle modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close')) {
                const modal = e.target.closest('.modal-overlay');
                if (modal && modal.id) {
                    this.closeModal(modal.id);
                }
            }
        });
    }
    
    openModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }
        
        // Add to active modals
        this.activeModals.push(modalId);
        
        // Show modal
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Auto-close after duration if specified
        if (options.autoClose && options.duration) {
            setTimeout(() => {
                this.closeModal(modalId);
            }, options.duration);
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Remove from active modals
        const index = this.activeModals.indexOf(modalId);
        if (index > -1) {
            this.activeModals.splice(index, 1);
        }
        
        // Animate out
        modal.classList.remove('active');
        
        // Hide after animation
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Remove modal-open class if no modals are active
            if (this.activeModals.length === 0) {
                document.body.classList.remove('modal-open');
            }
        }, 300);
    }
    
    closeTopModal() {
        if (this.activeModals.length > 0) {
            const topModalId = this.activeModals[this.activeModals.length - 1];
            this.closeModal(topModalId);
        }
    }
    
    closeAllModals() {
        this.activeModals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
        this.activeModals = [];
        document.body.classList.remove('modal-open');
    }
    
    // Legacy method names for backward compatibility
    showModal(modalId, options = {}) {
        return this.openModal(modalId, options);
    }
}
