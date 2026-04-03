// /docs/gironimo/js/components.js

const Components = (function() {
    // Button Component
    function Button({ text, onClick, variant = 'default', disabled = false, icon = null, className = '' }) {
        const btn = document.createElement('button');
        btn.className = `btn btn-${variant} ${className}`;
        btn.disabled = disabled;
        
        if (icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'btn-icon-content';
            iconSpan.textContent = icon;
            btn.appendChild(iconSpan);
        }
        
        if (text) {
            const textSpan = document.createElement('span');
            textSpan.textContent = text;
            btn.appendChild(textSpan);
        }
        
        btn.addEventListener('click', onClick);
        return btn;
    }

    // Card Component
    function Card({ children, className = '', onClick = null, selected = false }) {
        const card = document.createElement('div');
        card.className = `card ${className} ${selected ? 'selected' : ''}`;
        if (onClick) {
            card.addEventListener('click', onClick);
            card.style.cursor = 'pointer';
        }
        
        if (typeof children === 'string') {
            card.innerHTML = children;
        } else if (children instanceof Node) {
            card.appendChild(children);
        } else if (Array.isArray(children)) {
            children.forEach(child => card.appendChild(child));
        }
        
        return card;
    }

    // Modal Component
    function Modal({ title, content, onClose }) {
        const overlay = document.getElementById('modal-overlay');
        const contentContainer = document.getElementById('modal-content');
        
        contentContainer.innerHTML = '';
        
        const titleEl = document.createElement('h3');
        titleEl.className = 'modal-title';
        titleEl.textContent = title;
        contentContainer.appendChild(titleEl);
        
        if (typeof content === 'string') {
            contentContainer.innerHTML += content;
        } else if (content instanceof Node) {
            contentContainer.appendChild(content);
        }
        
        overlay.classList.remove('hidden');
        
        const closeHandler = (e) => {
            if (e.target === overlay || e.target.classList.contains('modal-close')) {
                overlay.classList.add('hidden');
                if (onClose) onClose();
            }
        };
        
        overlay.onclick = closeHandler;
        const closeBtn = overlay.querySelector('.modal-close');
        closeBtn.onclick = closeHandler;
        
        // Focus trap
        const focusableElements = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    // Tooltip Component
    function Tooltip(element, text) {
        element.setAttribute('data-tooltip', text);
        return element;
    }

    // Notification Component
    function Notification({ title, message, type = 'info', duration = 5000 }) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const titleEl = document.createElement('div');
        titleEl.className = 'notification-title';
        titleEl.textContent = title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'notification-message';
        messageEl.textContent = message;
        
        notification.appendChild(titleEl);
        notification.appendChild(messageEl);
        container.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                notification.style.animation = 'slide-in 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
        
        return notification;
    }

    // Theme Provider
    function ThemeProvider(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    return {
        Button,
        Card,
        Modal,
        Tooltip,
        Notification,
        ThemeProvider
    };
})();
