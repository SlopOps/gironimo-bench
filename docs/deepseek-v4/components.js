// Reusable Component System
const GironimoComponents = (function() {
    'use strict';
    
    // Button Component
    function createButton({ text, onClick, variant = 'primary', size = 'medium', disabled = false, ariaLabel, icon }) {
        const button = document.createElement('button');
        button.className = `btn btn-${variant} btn-${size}`;
        button.textContent = text || '';
        button.disabled = disabled;
        
        if (ariaLabel) {
            button.setAttribute('aria-label', ariaLabel);
        }
        
        if (icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'btn-icon';
            iconSpan.textContent = icon;
            button.prepend(iconSpan);
        }
        
        if (onClick && !disabled) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                onClick(e);
            });
        }
        
        return button;
    }
    
    // Card Component
    function createCard({ title, content, className = '', headerActions }) {
        const card = document.createElement('div');
        card.className = `card ${className}`;
        
        if (title) {
            const header = document.createElement('div');
            header.className = 'card-header';
            
            const titleEl = document.createElement('h2');
            titleEl.className = 'card-title';
            titleEl.textContent = title;
            header.appendChild(titleEl);
            
            if (headerActions) {
                const actionsContainer = document.createElement('div');
                actionsContainer.className = 'card-actions';
                
                if (Array.isArray(headerActions)) {
                    headerActions.forEach(action => actionsContainer.appendChild(action));
                } else {
                    actionsContainer.appendChild(headerActions);
                }
                
                header.appendChild(actionsContainer);
            }
            
            card.appendChild(header);
        }
        
        if (content) {
            const body = document.createElement('div');
            body.className = 'card-body';
            
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.appendChild(content);
            }
            
            card.appendChild(body);
        }
        
        return card;
    }
    
    // Modal Component
    function createModal({ id, title, content, onClose }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = `modal-${id}`;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', `modal-title-${id}`);
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const titleEl = document.createElement('h3');
        titleEl.className = 'modal-title';
        titleEl.id = `modal-title-${id}`;
        titleEl.textContent = title;
        header.appendChild(titleEl);
        
        const closeButton = createButton({
            text: '✕',
            variant: 'ghost',
            size: 'small',
            ariaLabel: 'Close modal',
            onClick: () => closeModal()
        });
        header.appendChild(closeButton);
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }
        
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        
        function closeModal() {
            overlay.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                if (onClose) onClose();
            }, 300);
        }
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
        
        // Close on escape key
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Show modal with animation
        setTimeout(() => overlay.classList.add('active'), 10);
        
        return {
            element: overlay,
            close: closeModal
        };
    }
    
    // Tooltip Component
    function createTooltip({ target, text, position = 'top' }) {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = text;
        tooltip.setAttribute('role', 'tooltip');
        
        target.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            positionTooltip();
        });
        
        target.addEventListener('mouseleave', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        target.addEventListener('focus', () => {
            document.body.appendChild(tooltip);
            positionTooltip();
        });
        
        target.addEventListener('blur', () => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        });
        
        function positionTooltip() {
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            let top, left;
            
            switch (position) {
                case 'top':
                    top = targetRect.top - tooltipRect.height - 5;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = targetRect.bottom + 5;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.left - tooltipRect.width - 5;
                    break;
                case 'right':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.right + 5;
                    break;
            }
            
            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;
        }
        
        return tooltip;
    }
    
    // Notification Component
    function createNotification({ message, type = 'info', onDismiss }) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        
        const messageEl = document.createElement('span');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;
        
        const dismissButton = createButton({
            text: '✕',
            variant: 'ghost',
            size: 'small',
            ariaLabel: 'Dismiss notification',
            onClick: () => {
                notification.classList.add('notification-exit');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                    if (onDismiss) onDismiss();
                }, 300);
            }
        });
        
        notification.appendChild(messageEl);
        notification.appendChild(dismissButton);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                dismissButton.click();
            }
        }, 5000);
        
        return notification;
    }
    
    // Theme Provider
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌓';
            }
        }
    }
    
    return {
        createButton,
        createCard,
        createModal,
        createTooltip,
        createNotification,
        applyTheme
    };
})();
