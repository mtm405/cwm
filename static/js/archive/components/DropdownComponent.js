/**
 * Dropdown Component
 * Handles dropdown menus with keyboard navigation and accessibility features
 */

class DropdownComponent extends BaseComponent {
    constructor(options = {}) {
        const defaultOptions = {
            trigger: 'click', // click, hover, focus
            placement: 'bottom-start', // top, bottom, left, right with -start, -center, -end
            offset: [0, 4],
            closeOnSelect: true,
            closeOnOutsideClick: true,
            closeOnEscape: true,
            autoClose: true,
            maxHeight: null,
            searchable: false,
            searchPlaceholder: 'Search...',
            items: [], // Array of dropdown items
            template: null,
            className: 'dropdown',
            showArrow: true,
            animation: 'fade', // fade, slide
            delay: { show: 0, hide: 150 },
            boundary: 'viewport' // viewport, scrollParent
        };

        super({ ...defaultOptions, ...options });

        // Dropdown-specific properties
        this.isOpen = false;
        this.dropdown = null;
        this.menu = null;
        this.trigger = null;
        this.focusedIndex = -1;
        this.filteredItems = [];
        this.searchInput = null;
        this.showTimer = null;
        this.hideTimer = null;

        // Create dropdown structure
        this.createDropdownStructure();
    }

    /**
     * Initialize dropdown component
     */
    async onInit() {
        // Find or create trigger element
        this.findTriggerElement();
        
        // Create default template if none provided
        if (!this.template) {
            this.template = this.createDefaultTemplate();
        }

        // Set up accessibility
        this.setupAccessibility();

        // Filter items initially
        this.filterItems();

        if (this.options.debugMode) {
            console.log('[DropdownComponent] Initialized:', this.id);
        }
    }

    /**
     * Create dropdown structure
     */
    createDropdownStructure() {
        // Create dropdown container
        this.element = Utils.dom.createElement('div', {
            className: `dropdown ${this.options.className}`,
            id: this.id
        });

        // Create dropdown menu
        this.menu = Utils.dom.createElement('div', {
            className: `dropdown-menu dropdown-${this.options.animation}`,
            role: 'menu',
            'aria-hidden': 'true',
            'data-dropdown-id': this.id
        });

        // Apply max height if specified
        if (this.options.maxHeight) {
            this.menu.style.maxHeight = this.options.maxHeight;
            this.menu.style.overflowY = 'auto';
        }

        this.element.appendChild(this.menu);
        
        // Initially hidden
        this.menu.style.display = 'none';
    }

    /**
     * Find or create trigger element
     */
    findTriggerElement() {
        if (this.options.trigger && typeof this.options.trigger === 'string') {
            this.trigger = document.querySelector(this.options.trigger);
        } else if (this.options.trigger instanceof HTMLElement) {
            this.trigger = this.options.trigger;
        } else {
            // Create default trigger
            this.trigger = Utils.dom.createElement('button', {
                className: 'dropdown-trigger btn',
                type: 'button',
                'aria-haspopup': 'true',
                'aria-expanded': 'false'
            }, 'Dropdown');
            
            this.element.insertBefore(this.trigger, this.menu);
        }
    }

    /**
     * Setup accessibility attributes
     */
    setupAccessibility() {
        if (this.trigger) {
            this.trigger.setAttribute('aria-haspopup', 'true');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.trigger.setAttribute('aria-controls', this.menu.id || `${this.id}-menu`);
        }

        this.menu.id = this.menu.id || `${this.id}-menu`;
        this.menu.setAttribute('role', 'menu');
        this.menu.setAttribute('aria-labelledby', this.trigger?.id || `${this.id}-trigger`);
    }

    /**
     * Create default dropdown template
     */
    createDefaultTemplate() {
        return (data) => {
            const { items, searchable, searchPlaceholder } = data;
            
            let html = '';
            
            // Add search input if searchable
            if (searchable) {
                html += `
                    <div class="dropdown-search">
                        <input 
                            type="text" 
                            class="dropdown-search-input" 
                            placeholder="${searchPlaceholder}"
                            aria-label="Search items"
                            autocomplete="off"
                        />
                    </div>
                `;
            }

            // Add items
            html += '<div class="dropdown-items">';
            
            if (items.length === 0) {
                html += '<div class="dropdown-item dropdown-item-empty">No items found</div>';
            } else {
                items.forEach((item, index) => {
                    html += this.createItemHTML(item, index);
                });
            }
            
            html += '</div>';
            
            return html;
        };
    }

    /**
     * Create individual item HTML
     * @param {Object} item - Item configuration
     * @param {number} index - Item index
     */
    createItemHTML(item, index) {
        const itemClass = [
            'dropdown-item',
            item.className || '',
            item.disabled ? 'dropdown-item-disabled' : '',
            item.divider ? 'dropdown-divider' : '',
            item.header ? 'dropdown-header' : ''
        ].filter(c => c).join(' ');

        if (item.divider) {
            return '<div class="dropdown-divider" role="separator"></div>';
        }

        if (item.header) {
            return `<div class="dropdown-header">${item.text || item.label}</div>`;
        }

        const itemId = item.id || `${this.id}-item-${index}`;
        const content = item.html || (item.icon ? `<i class="${item.icon}"></i> ` : '') + (item.text || item.label);

        return `
            <div 
                class="${itemClass}"
                role="menuitem"
                tabindex="-1"
                data-item-index="${index}"
                data-item-value="${item.value || ''}"
                id="${itemId}"
                ${item.disabled ? 'aria-disabled="true"' : ''}
            >
                ${content}
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (!this.trigger) return;

        // Trigger events
        switch (this.options.trigger) {
            case 'click':
                this.trigger.addEventListener('click', this.toggle.bind(this));
                break;
            case 'hover':
                this.trigger.addEventListener('mouseenter', this.show.bind(this));
                this.trigger.addEventListener('mouseleave', this.scheduleHide.bind(this));
                this.menu.addEventListener('mouseenter', this.cancelHide.bind(this));
                this.menu.addEventListener('mouseleave', this.scheduleHide.bind(this));
                break;
            case 'focus':
                this.trigger.addEventListener('focus', this.show.bind(this));
                this.trigger.addEventListener('blur', this.scheduleHide.bind(this));
                break;
        }

        // Keyboard navigation
        this.trigger.addEventListener('keydown', this.handleTriggerKeydown.bind(this));
        this.menu.addEventListener('keydown', this.handleMenuKeydown.bind(this));

        // Item clicks
        this.addEventListener('.dropdown-item:not(.dropdown-item-disabled)', 'click', this.handleItemClick);

        // Search input
        if (this.options.searchable) {
            this.addEventListener('.dropdown-search-input', 'input', this.handleSearch);
            this.addEventListener('.dropdown-search-input', 'keydown', this.handleSearchKeydown);
        }

        // Outside click
        if (this.options.closeOnOutsideClick) {
            document.addEventListener('click', this.handleOutsideClick.bind(this));
        }

        // Escape key
        if (this.options.closeOnEscape) {
            document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        }
    }

    /**
     * Handle trigger keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleTriggerKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
            case 'ArrowUp':
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (!this.isOpen) {
                    this.show();
                } else {
                    this.focusFirstItem();
                }
                break;
        }
    }

    /**
     * Handle menu keydown events
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleMenuKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.focusNextItem();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.focusPreviousItem();
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.selectFocusedItem();
                break;
            case 'Escape':
                e.preventDefault();
                this.hide();
                this.trigger.focus();
                break;
            case 'Tab':
                // Allow default tab behavior to close dropdown
                this.hide();
                break;
        }
    }

    /**
     * Handle search input
     * @param {Event} e - Input event
     */
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        this.filterItems(query);
        this.updateMenu();
        this.focusedIndex = -1;
    }

    /**
     * Handle search keydown
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleSearchKeydown(e) {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.focusFirstItem();
                break;
            case 'Escape':
                e.preventDefault();
                this.hide();
                this.trigger.focus();
                break;
        }
    }

    /**
     * Handle item click
     * @param {Event} e - Click event
     */
    handleItemClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const itemIndex = parseInt(e.currentTarget.getAttribute('data-item-index'));
        const item = this.filteredItems[itemIndex];

        if (item && !item.disabled) {
            this.selectItem(item, itemIndex);
        }
    }

    /**
     * Handle outside click
     * @param {Event} e - Click event
     */
    handleOutsideClick(e) {
        if (!this.isOpen) return;

        if (!this.element.contains(e.target)) {
            this.hide();
        }
    }

    /**
     * Handle escape key
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.hide();
            this.trigger.focus();
        }
    }

    /**
     * Show dropdown
     */
    show() {
        if (this.isOpen) return this;

        this.cancelHide();

        this.showTimer = setTimeout(() => {
            this.updateMenu();
            this.positionMenu();
            
            this.menu.style.display = 'block';
            this.menu.setAttribute('aria-hidden', 'false');
            
            requestAnimationFrame(() => {
                Utils.dom.addClass(this.menu, 'show');
            });

            this.isOpen = true;
            
            if (this.trigger) {
                this.trigger.setAttribute('aria-expanded', 'true');
                Utils.dom.addClass(this.trigger, Constants.CLASSES.ACTIVE);
            }

            // Focus search input if searchable
            if (this.options.searchable) {
                const searchInput = this.menu.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            this.emit('show', { dropdown: this });

            if (this.options.debugMode) {
                console.log(`[DropdownComponent] Shown: ${this.id}`);
            }
        }, this.options.delay.show);

        return this;
    }

    /**
     * Hide dropdown
     */
    hide() {
        if (!this.isOpen) return this;

        this.cancelShow();

        Utils.dom.removeClass(this.menu, 'show');
        
        setTimeout(() => {
            this.menu.style.display = 'none';
            this.menu.setAttribute('aria-hidden', 'true');
            
            this.isOpen = false;
            this.focusedIndex = -1;
            
            if (this.trigger) {
                this.trigger.setAttribute('aria-expanded', 'false');
                Utils.dom.removeClass(this.trigger, Constants.CLASSES.ACTIVE);
            }

            // Clear search if exists
            if (this.options.searchable) {
                const searchInput = this.menu.querySelector('.dropdown-search-input');
                if (searchInput) {
                    searchInput.value = '';
                }
                this.filterItems(); // Reset filter
            }

            this.emit('hide', { dropdown: this });

            if (this.options.debugMode) {
                console.log(`[DropdownComponent] Hidden: ${this.id}`);
            }
        }, 150);

        return this;
    }

    /**
     * Toggle dropdown visibility
     */
    toggle() {
        return this.isOpen ? this.hide() : this.show();
    }

    /**
     * Schedule hide with delay
     */
    scheduleHide() {
        this.cancelShow();
        this.hideTimer = setTimeout(() => {
            this.hide();
        }, this.options.delay.hide);
    }

    /**
     * Cancel scheduled hide
     */
    cancelHide() {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
    }

    /**
     * Cancel scheduled show
     */
    cancelShow() {
        if (this.showTimer) {
            clearTimeout(this.showTimer);
            this.showTimer = null;
        }
    }

    /**
     * Filter items based on search query
     * @param {string} query - Search query
     */
    filterItems(query = '') {
        if (!query) {
            this.filteredItems = [...this.options.items];
        } else {
            this.filteredItems = this.options.items.filter(item => {
                if (item.divider || item.header) return true;
                const text = (item.text || item.label || '').toLowerCase();
                const value = (item.value || '').toLowerCase();
                return text.includes(query) || value.includes(query);
            });
        }
    }

    /**
     * Update menu content
     */
    updateMenu() {
        const templateData = {
            ...this.options,
            items: this.filteredItems
        };
        
        this.menu.innerHTML = this.template(templateData);
        
        // Re-setup item event listeners
        this.setupItemListeners();
    }

    /**
     * Setup item-specific event listeners
     */
    setupItemListeners() {
        // This is called after updating menu content
        // Item event listeners are set up in setupEventListeners using event delegation
    }

    /**
     * Position dropdown menu
     */
    positionMenu() {
        if (!this.trigger) return;

        const triggerRect = this.trigger.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        let { top, left } = this.calculatePosition(triggerRect, menuRect, viewport);

        // Apply positioning
        this.menu.style.position = 'fixed';
        this.menu.style.top = `${top}px`;
        this.menu.style.left = `${left}px`;
        this.menu.style.zIndex = '1050';
    }

    /**
     * Calculate dropdown position
     * @param {DOMRect} triggerRect - Trigger element rect
     * @param {DOMRect} menuRect - Menu element rect
     * @param {Object} viewport - Viewport dimensions
     * @returns {Object} Position coordinates
     */
    calculatePosition(triggerRect, menuRect, viewport) {
        const [placement, alignment = 'start'] = this.options.placement.split('-');
        const [offsetX, offsetY] = this.options.offset;

        let top, left;

        // Calculate base position
        switch (placement) {
            case 'top':
                top = triggerRect.top - menuRect.height - offsetY;
                break;
            case 'bottom':
                top = triggerRect.bottom + offsetY;
                break;
            case 'left':
                left = triggerRect.left - menuRect.width - offsetX;
                break;
            case 'right':
                left = triggerRect.right + offsetX;
                break;
            default:
                top = triggerRect.bottom + offsetY;
        }

        // Calculate alignment
        if (placement === 'top' || placement === 'bottom') {
            switch (alignment) {
                case 'start':
                    left = triggerRect.left + offsetX;
                    break;
                case 'center':
                    left = triggerRect.left + (triggerRect.width / 2) - (menuRect.width / 2) + offsetX;
                    break;
                case 'end':
                    left = triggerRect.right - menuRect.width + offsetX;
                    break;
            }
        } else {
            switch (alignment) {
                case 'start':
                    top = triggerRect.top + offsetY;
                    break;
                case 'center':
                    top = triggerRect.top + (triggerRect.height / 2) - (menuRect.height / 2) + offsetY;
                    break;
                case 'end':
                    top = triggerRect.bottom - menuRect.height + offsetY;
                    break;
            }
        }

        // Boundary checks
        if (this.options.boundary === 'viewport') {
            // Prevent overflow
            if (left + menuRect.width > viewport.width) {
                left = viewport.width - menuRect.width - 10;
            }
            if (left < 10) {
                left = 10;
            }
            if (top + menuRect.height > viewport.height) {
                top = triggerRect.top - menuRect.height - offsetY;
            }
            if (top < 10) {
                top = 10;
            }
        }

        return { top, left };
    }

    /**
     * Focus management
     */
    focusFirstItem() {
        const items = this.getSelectableItems();
        if (items.length > 0) {
            this.focusedIndex = 0;
            this.updateFocus();
        }
    }

    focusLastItem() {
        const items = this.getSelectableItems();
        if (items.length > 0) {
            this.focusedIndex = items.length - 1;
            this.updateFocus();
        }
    }

    focusNextItem() {
        const items = this.getSelectableItems();
        if (items.length === 0) return;

        this.focusedIndex = (this.focusedIndex + 1) % items.length;
        this.updateFocus();
    }

    focusPreviousItem() {
        const items = this.getSelectableItems();
        if (items.length === 0) return;

        this.focusedIndex = this.focusedIndex <= 0 ? items.length - 1 : this.focusedIndex - 1;
        this.updateFocus();
    }

    updateFocus() {
        const items = this.getSelectableItems();
        
        items.forEach((item, index) => {
            if (index === this.focusedIndex) {
                item.focus();
                Utils.dom.addClass(item, 'focused');
            } else {
                Utils.dom.removeClass(item, 'focused');
            }
        });
    }

    getSelectableItems() {
        return Array.from(this.menu.querySelectorAll('.dropdown-item:not(.dropdown-item-disabled):not(.dropdown-header):not(.dropdown-divider)'));
    }

    selectFocusedItem() {
        if (this.focusedIndex >= 0) {
            const items = this.getSelectableItems();
            const item = items[this.focusedIndex];
            if (item) {
                item.click();
            }
        }
    }

    /**
     * Select item
     * @param {Object} item - Item data
     * @param {number} index - Item index
     */
    selectItem(item, index) {
        this.emit('select', { item, index, dropdown: this });

        // Call item action if provided
        if (typeof item.action === 'function') {
            item.action(item, this);
        }

        // Close dropdown if autoClose is enabled
        if (this.options.closeOnSelect && this.options.autoClose) {
            this.hide();
            this.trigger.focus();
        }
    }

    /**
     * Add item to dropdown
     * @param {Object} item - Item configuration
     * @param {number} index - Insert position (optional)
     */
    addItem(item, index = null) {
        if (index === null) {
            this.options.items.push(item);
        } else {
            this.options.items.splice(index, 0, item);
        }
        
        this.filterItems();
        
        if (this.isOpen) {
            this.updateMenu();
        }
    }

    /**
     * Remove item from dropdown
     * @param {number} index - Item index
     */
    removeItem(index) {
        this.options.items.splice(index, 1);
        this.filterItems();
        
        if (this.isOpen) {
            this.updateMenu();
        }
    }

    /**
     * Update item
     * @param {number} index - Item index
     * @param {Object} item - New item data
     */
    updateItem(index, item) {
        this.options.items[index] = { ...this.options.items[index], ...item };
        this.filterItems();
        
        if (this.isOpen) {
            this.updateMenu();
        }
    }

    /**
     * Clear all items
     */
    clearItems() {
        this.options.items = [];
        this.filterItems();
        
        if (this.isOpen) {
            this.updateMenu();
        }
    }

    /**
     * Set items
     * @param {Array} items - New items array
     */
    setItems(items) {
        this.options.items = items;
        this.filterItems();
        
        if (this.isOpen) {
            this.updateMenu();
        }
    }

    /**
     * Component cleanup
     */
    async onDestroy() {
        this.cancelShow();
        this.cancelHide();
        
        if (this.isOpen) {
            this.hide();
        }

        // Remove global listeners
        document.removeEventListener('click', this.handleOutsideClick);
        document.removeEventListener('keydown', this.handleEscapeKey);
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DropdownComponent };
} else {
    // Make available globally
    window.DropdownComponent = DropdownComponent;
}
