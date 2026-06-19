// components.js
// Reusable UI Components

const Components = {
    Button: function({ text, onClick, variant = 'primary', disabled = false, ariaLabel }) {
        const btn = document.createElement('button');
        btn.className = `btn btn-${variant}`;
        btn.textContent = text;
        btn.disabled = disabled;
        if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
        if (onClick) btn.addEventListener('click', onClick);
        return btn;
    },

    Card: function({ content, onClick, isSelected, isHighlighted }) {
        const card = document.createElement('div');
        card.className = 'card';
        if (isSelected) card.classList.add('selected');
        if (isHighlighted) card.classList.add('highlighted');
        card.innerHTML = content;
        if (onClick) card.addEventListener('click', onClick);
        return card;
    },

    Modal: function({ title, content, onClose }) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) onClose();
        });

        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `<h3>${title}</h3>`;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.addEventListener('click', onClose);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = content;
        
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        
        // Close on Escape
        document.addEventListener('keydown', function escapeClose(e) {
            if (e.key === 'Escape') {
                onClose();
                document.removeEventListener('keydown', escapeClose);
            }
        });
        
        return overlay;
    },

    Tooltip: function({ target, text }) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        const rect = target.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
        tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        return tooltip;
    },

    Notification: function({ message, onClose }) {
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.setAttribute('role', 'alert');
        notif.textContent = message;
        setTimeout(onClose, 3000);
        return notif;
    },

    ThemeToggle: function(currentTheme, onToggle) {
        const container = document.createElement('div');
        const btn = this.Button({
            text: currentTheme === 'light' ? '🌙' : '☀️',
            variant: 'secondary',
            onClick: onToggle,
            ariaLabel: 'Toggle theme'
        });
        container.appendChild(btn);
        return container;
    }
};
