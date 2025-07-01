/**
 * Modal Component
 * Handles modal dialogs with various configurations and accessibility features
 */

class ModalComponent extends BaseComponent {
    constructor(options = {}) {
        const defaultOptions = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            closable: true,
            closeOnOverlay: true,
            closeOnEscape: true,
            showCloseButton: true,
            backdrop: true,
            animation: 'fade', // fade, slide, zoom
            autoFocus: true,
            restoreFocus: true,
            buttons: [], // Array of button objects
            className: 'modal',
            template: null,
            beforeOpen: null,
            afterOpen: null,
            beforeClose: null,
            afterClose: null
        };

        super({ ...defaultOptions, ...options });

        // Modal-specific properties
        this.isOpen = false;
        this.previousActiveElement = null;
        this.backdrop = null;
        this.focusTrap = null;
        this.openModals = [];

        // Create modal structure
        this.createModalStructure();
    }

    /**
     * Initialize modal component
     */
    async onInit() {
        // Set up global modal listeners
        this.setupGlobalListeners();
        
        // Create default template if none provided
        if (!this.template) {
            this.template = this.createDefaultTemplate();
        }

        // Set up accessibility attributes
        this.setupAccessibility();

        if (this.options.debugMode) {
            console.log('[ModalComponent] Initialized:', this.id);
        }
    }

    /**
     * Create modal structure
     */
    createModalStructure() {
        // Create backdrop
        if (this.options.backdrop) {
            this.backdrop = Utils.dom.createElement('div', {
                className: `modal-backdrop modal-backdrop-${this.options.animation}`,
                'data-modal-id': this.id
            });
        }

        // Create modal container
        this.element = Utils.dom.createElement('div', {
            className: `modal modal-${this.options.size} modal-${this.options.animation}`,
            id: this.id,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-hidden': 'true',
            tabindex: '-1'
        });

        // Add to body initially hidden
        this.element.style.display = 'none';
        if (this.backdrop) {
            this.backdrop.style.display = 'none';
            document.body.appendChild(this.backdrop);
        }
        document.body.appendChild(this.element);
    }

    /**
     * Create default modal template
     */
    createDefaultTemplate() {
        return (data) => {
            const { title, content, buttons, showCloseButton, closable } = data;
            
            return `
                <div class="modal-dialog">
                    <div class="modal-content">
                        ${title || showCloseButton ? `
                            <div class="modal-header">
                                ${title ? `<h2 class="modal-title" id="${this.id}-title">${title}</h2>` : ''}
                                ${showCloseButton && closable ? `
                                    <button type="button" class="modal-close" aria-label="Close modal">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                ` : ''}
                            </div>
                        ` : ''}
                        <div class="modal-body" id="${this.id}-content">
                            ${content}
                        </div>
                        ${buttons.length > 0 ? `
                            <div class="modal-footer">
                                ${this.createButtonsHTML(buttons)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        };
    }

    /**
     * Create buttons HTML
     * @param {Array} buttons - Button configurations
     */
    createButtonsHTML(buttons) {
        return buttons.map((button, index) => {
            const btnClass = button.className || `btn ${button.variant || 'btn-secondary'}`;
            const btnId = button.id || `${this.id}-btn-${index}`;
            
            return `
                <button 
                    type="button" 
                    class="${btnClass}" 
                    id="${btnId}"
                    data-button-index="${index}"
                    ${button.disabled ? 'disabled' : ''}
                    ${button.autofocus ? 'autofocus' : ''}
                >
                    ${button.text || button.label}
                </button>
            `;
        }).join('');
    }

    /**
     * Setup accessibility attributes
     */
    setupAccessibility() {
        if (this.options.title) {
            this.element.setAttribute('aria-labelledby', `${this.id}-title`);
        }
        this.element.setAttribute('aria-describedby', `${this.id}-content`);
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Listen for modal events
        eventBus.on(Constants.EVENTS.MODAL_OPEN, this.handleGlobalOpen.bind(this));
        eventBus.on(Constants.EVENTS.MODAL_CLOSE, this.handleGlobalClose.bind(this));
        
        // Keyboard events
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        }
    }

    /**
     * Setup event listeners for the modal
     */
    setupEventListeners() {
        // Close button
        this.addEventListener('.modal-close', 'click', this.close);

        // Backdrop click
        if (this.options.closeOnOverlay && this.backdrop) {
            this.backdrop.addEventListener('click', this.close.bind(this));
        }

        // Button clicks
        this.addEventListener('.modal-footer button', 'click', this.handleButtonClick);

        // Prevent modal content clicks from closing
        this.addEventListener('.modal-dialog', 'click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * Handle global modal open events
     * @param {Object} data - Event data
     */
    handleGlobalOpen(data) {
        if (data.modalId === this.id || data.modal === this) {
            this.open(data.options);
        }
    }

    /**
     * Handle global modal close events
     * @param {Object} data - Event data
     */
    handleGlobalClose(data) {
        if (data.modalId === this.id || data.modal === this) {
            this.close();
        }
    }

    /**
     * Handle keyboard events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeydown(e) {
        if (!this.isOpen) return;

        switch (e.key) {
            case 'Escape':
                if (this.options.closeOnEscape && this.options.closable) {
                    e.preventDefault();
                    this.close();
                }
                break;
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }

    /**
     * Handle tab key for focus trapping
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleTabKey(e) {
        const focusableElements = this.getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * Get focusable elements within modal
     * @returns {Array} Focusable elements
     */
    getFocusableElements() {
        const focusableSelectors = [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ];

        return Array.from(this.element.querySelectorAll(focusableSelectors.join(', ')))
            .filter(el => {
                return el.offsetWidth > 0 && el.offsetHeight > 0;
            });
    }

    /**
     * Handle button clicks
     * @param {Event} e - Click event
     */
    handleButtonClick(e) {
        const buttonIndex = parseInt(e.target.getAttribute('data-button-index'));
        const button = this.options.buttons[buttonIndex];
        
        if (button && typeof button.action === 'function') {
            const result = button.action(this, e);
            
            // Close modal unless action returns false
            if (result !== false && !button.keepOpen) {
                this.close();
            }
        }
    }

    /**
     * Open the modal
     * @param {Object} options - Override options
     */
    async open(options = {}) {
        if (this.isOpen) {
            console.warn(`Modal ${this.id} is already open`);
            return this;
        }

        try {
            // Merge options
            const modalData = { ...this.options, ...options };

            // Before open hook
            if (typeof modalData.beforeOpen === 'function') {
                const result = await modalData.beforeOpen(this);
                if (result === false) return this;
            }

            // Store current active element for restoration
            if (this.options.restoreFocus) {
                this.previousActiveElement = document.activeElement;
            }

            // Prevent body scroll
            this.preventBodyScroll();

            // Update content
            this.updateContent(modalData);

            // Show backdrop
            if (this.backdrop) {
                this.backdrop.style.display = 'block';
                requestAnimationFrame(() => {
                    Utils.dom.addClass(this.backdrop, 'show');
                });
            }

            // Show modal
            this.element.style.display = 'block';
            this.element.setAttribute('aria-hidden', 'false');
            
            requestAnimationFrame(() => {
                Utils.dom.addClass(this.element, 'show');
                
                // Auto focus
                if (this.options.autoFocus) {
                    this.setInitialFocus();
                }
            });

            this.isOpen = true;
            ModalComponent.openModals.push(this);

            // After open hook
            if (typeof modalData.afterOpen === 'function') {
                await modalData.afterOpen(this);
            }

            this.emit('open', { modal: this });
            eventBus.emit(Constants.EVENTS.MODAL_OPEN, { modal: this });

            if (this.options.debugMode) {
                console.log(`[ModalComponent] Opened: ${this.id}`);
            }

        } catch (error) {
            console.error(`Error opening modal ${this.id}:`, error);
            this.emit('error', { type: 'open', error });
        }

        return this;
    }

    /**
     * Close the modal
     */
    async close() {
        if (!this.isOpen) {
            console.warn(`Modal ${this.id} is not open`);
            return this;
        }

        try {
            // Before close hook
            if (typeof this.options.beforeClose === 'function') {
                const result = await this.options.beforeClose(this);
                if (result === false) return this;
            }

            // Hide modal
            Utils.dom.removeClass(this.element, 'show');
            
            // Hide backdrop
            if (this.backdrop) {
                Utils.dom.removeClass(this.backdrop, 'show');
            }

            // Wait for animation to complete
            setTimeout(() => {
                this.element.style.display = 'none';
                this.element.setAttribute('aria-hidden', 'true');
                
                if (this.backdrop) {
                    this.backdrop.style.display = 'none';
                }

                // Restore body scroll
                this.restoreBodyScroll();

                // Restore focus
                if (this.options.restoreFocus && this.previousActiveElement) {
                    this.previousActiveElement.focus();
                    this.previousActiveElement = null;
                }

            }, this.getAnimationDuration());

            this.isOpen = false;
            
            // Remove from open modals list
            const index = ModalComponent.openModals.indexOf(this);
            if (index > -1) {
                ModalComponent.openModals.splice(index, 1);
            }

            // After close hook
            if (typeof this.options.afterClose === 'function') {
                await this.options.afterClose(this);
            }

            this.emit('close', { modal: this });
            eventBus.emit(Constants.EVENTS.MODAL_CLOSE, { modal: this });

            if (this.options.debugMode) {
                console.log(`[ModalComponent] Closed: ${this.id}`);
            }

        } catch (error) {
            console.error(`Error closing modal ${this.id}:`, error);
            this.emit('error', { type: 'close', error });
        }

        return this;
    }

    /**
     * Update modal content
     * @param {Object} data - Modal data
     */
    updateContent(data) {
        this.element.innerHTML = this.template(data);
        
        // Re-setup event listeners
        this.setupEventListeners();
        
        // Update accessibility attributes
        if (data.title) {
            this.element.setAttribute('aria-labelledby', `${this.id}-title`);
        }
    }

    /**
     * Set initial focus in modal
     */
    setInitialFocus() {
        // Try autofocus element first
        let focusElement = this.element.querySelector('[autofocus]');
        
        // Then try first focusable element
        if (!focusElement) {
            const focusableElements = this.getFocusableElements();
            focusElement = focusableElements[0];
        }

        // Fallback to modal itself
        if (!focusElement) {
            focusElement = this.element;
        }

        if (focusElement) {
            focusElement.focus();
        }
    }

    /**
     * Prevent body scroll
     */
    preventBodyScroll() {
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        document.body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
    }

    /**
     * Restore body scroll
     */
    restoreBodyScroll() {
        // Only restore if no other modals are open
        if (ModalComponent.openModals.length === 0) {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    }

    /**
     * Get animation duration from CSS
     * @returns {number} Duration in milliseconds
     */
    getAnimationDuration() {
        const computedStyle = window.getComputedStyle(this.element);
        const duration = computedStyle.transitionDuration || '0.3s';
        return parseFloat(duration) * 1000;
    }

    /**
     * Toggle modal visibility
     */
    toggle() {
        return this.isOpen ? this.close() : this.open();
    }

    /**
     * Update modal options
     * @param {Object} options - New options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
        
        if (this.isOpen) {
            this.updateContent(this.options);
        }
    }

    /**
     * Set modal title
     * @param {string} title - New title
     */
    setTitle(title) {
        this.options.title = title;
        
        if (this.isOpen) {
            const titleElement = this.element.querySelector('.modal-title');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    /**
     * Set modal content
     * @param {string} content - New content
     */
    setContent(content) {
        this.options.content = content;
        
        if (this.isOpen) {
            const contentElement = this.element.querySelector('.modal-body');
            if (contentElement) {
                contentElement.innerHTML = content;
            }
        }
    }

    /**
     * Add button to modal
     * @param {Object} button - Button configuration
     */
    addButton(button) {
        this.options.buttons.push(button);
        
        if (this.isOpen) {
            this.updateContent(this.options);
        }
    }

    /**
     * Remove button from modal
     * @param {number} index - Button index
     */
    removeButton(index) {
        this.options.buttons.splice(index, 1);
        
        if (this.isOpen) {
            this.updateContent(this.options);
        }
    }

    /**
     * Component cleanup
     */
    async onDestroy() {
        if (this.isOpen) {
            await this.close();
        }

        // Remove from DOM
        if (this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (this.backdrop && this.backdrop.parentNode) {
            this.backdrop.parentNode.removeChild(this.backdrop);
        }

        // Remove global listeners
        document.removeEventListener('keydown', this.handleKeydown);
        eventBus.off(Constants.EVENTS.MODAL_OPEN, this.handleGlobalOpen);
        eventBus.off(Constants.EVENTS.MODAL_CLOSE, this.handleGlobalClose);
    }

    // Static methods and properties
    static openModals = [];

    /**
     * Close all open modals
     */
    static closeAll() {
        const modals = [...this.openModals];
        modals.forEach(modal => modal.close());
    }

    /**
     * Get topmost modal
     * @returns {ModalComponent|null} Topmost modal
     */
    static getTopmost() {
        return this.openModals[this.openModals.length - 1] || null;
    }

    /**
     * Create confirmation modal
     * @param {Object} options - Modal options
     * @returns {Promise} Promise that resolves with user choice
     */
    static confirm(options = {}) {
        return new Promise((resolve) => {
            const modal = new ModalComponent({
                title: options.title || 'Confirm',
                content: options.message || 'Are you sure?',
                size: 'small',
                buttons: [
                    {
                        text: options.cancelText || 'Cancel',
                        variant: 'btn-secondary',
                        action: () => resolve(false)
                    },
                    {
                        text: options.confirmText || 'Confirm',
                        variant: 'btn-primary',
                        action: () => resolve(true)
                    }
                ],
                beforeClose: options.beforeClose,
                afterClose: () => {
                    modal.destroy();
                    if (options.afterClose) options.afterClose();
                }
            });

            modal.open();
        });
    }

    /**
     * Create alert modal
     * @param {Object} options - Modal options
     * @returns {Promise} Promise that resolves when closed
     */
    static alert(options = {}) {
        return new Promise((resolve) => {
            const modal = new ModalComponent({
                title: options.title || 'Alert',
                content: options.message || '',
                size: 'small',
                buttons: [
                    {
                        text: options.buttonText || 'OK',
                        variant: 'btn-primary',
                        action: () => resolve()
                    }
                ],
                beforeClose: options.beforeClose,
                afterClose: () => {
                    modal.destroy();
                    if (options.afterClose) options.afterClose();
                }
            });

            modal.open();
        });
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModalComponent };
} else {
    // Make available globally
    window.ModalComponent = ModalComponent;
    
    // Global convenience functions
    window.modal = {
        create: (options) => new ModalComponent(options),
        confirm: (options) => ModalComponent.confirm(options),
        alert: (options) => ModalComponent.alert(options),
        closeAll: () => ModalComponent.closeAll()
    };
}
