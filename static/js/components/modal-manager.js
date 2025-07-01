/**
 * Modal Management System
 * Provides functions to show, hide, and manage reusable modal components
 */

// Global modal management
const ModalManager = {
    activeModals: new Set(),
    
    // Open a modal by ID
    showModal(modalId, options = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with id "${modalId}" not found`);
            return;
        }
        
        // Add to active modals
        this.activeModals.add(modalId);
        
        // Show modal
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
        
        // Focus management
        this.trapFocus(modal);
        
        // Auto-close after duration if specified
        if (options.autoClose && options.duration) {
            setTimeout(() => {
                this.closeModal(modalId);
            }, options.duration);
        }
    },
    
    // Close a modal by ID
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Remove from active modals
        this.activeModals.delete(modalId);
        
        // Animate out
        modal.classList.remove('active');
        
        setTimeout(() => {
            modal.style.display = 'none';
            
            // Remove body class if no modals are open
            if (this.activeModals.size === 0) {
                document.body.classList.remove('modal-open');
            }
        }, 300);
    },
    
    // Close all modals
    closeAllModals() {
        this.activeModals.forEach(modalId => {
            this.closeModal(modalId);
        });
    },
    
    // Focus trapping for accessibility
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus first element
        firstElement.focus();
        
        // Handle tab navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
};

// Convenience functions for backward compatibility
function showModal(modalId, options = {}) {
    ModalManager.showModal(modalId, options);
}

function closeModal(modalId) {
    ModalManager.closeModal(modalId);
}

function closeAllModals() {
    ModalManager.closeAllModals();
}

// Specific modal functions
function closeConfirmModal(modalId) {
    ModalManager.closeModal(modalId);
}

function closeInfoModal(modalId) {
    ModalManager.closeModal(modalId);
}

function closeLeaderboardModal() {
    ModalManager.closeModal('leaderboard-modal');
}

// Show confirmation modal with dynamic content
function showConfirmDialog(title, message, confirmAction, options = {}) {
    const modalId = 'dynamic-confirm-modal';
    
    // Create modal if it doesn't exist
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay modal-sm';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closeModal('${modalId}')"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="closeModal('${modalId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="confirm-message">${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="closeModal('${modalId}')">
                        ${options.cancelText || 'Cancel'}
                    </button>
                    <button class="btn btn-${options.variant || 'danger'}" onclick="${confirmAction}; closeModal('${modalId}')">
                        ${options.confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        // Update existing modal content
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.confirm-message').textContent = message;
        modal.querySelector('.btn:last-child').onclick = () => {
            eval(confirmAction);
            closeModal(modalId);
        };
    }
    
    ModalManager.showModal(modalId);
}

// Show info modal with dynamic content
function showInfoDialog(title, description, options = {}) {
    const modalId = 'dynamic-info-modal';
    
    // Create modal if it doesn't exist
    let modal = document.getElementById(modalId);
    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.style.display = 'none';
        
        let tipsHtml = '';
        if (options.tips && options.tips.length > 0) {
            tipsHtml = `
                <div class="modal-section">
                    <h4><i class="fas fa-lightbulb"></i> Pro Tips:</h4>
                    <ul class="modal-tips">
                        ${options.tips.map(tip => `<li><i class="fas fa-check"></i> ${tip}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="closeModal('${modalId}')"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">
                        ${options.icon ? `<i class="${options.icon}"></i>` : ''}
                        ${title}
                    </h3>
                    <button class="modal-close" onclick="closeModal('${modalId}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="modal-description">${description}</p>
                    ${tipsHtml}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="closeModal('${modalId}')">
                        Got it!
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    ModalManager.showModal(modalId);
}

// Keyboard event handling
document.addEventListener('keydown', (e) => {
    // Close modals on Escape key
    if (e.key === 'Escape') {
        ModalManager.closeAllModals();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalManager, showModal, closeModal, showConfirmDialog, showInfoDialog };
}
