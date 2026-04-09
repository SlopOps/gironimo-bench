/**
 * COMPONENT SYSTEM
 * Pure functions that return DOM elements based on props.
 * No feature-specific logic allowed here.
 */
const Components = {
    Button: (props) => {
        const btn = document.createElement('button');
        btn.className = `btn ${props.variant || 'btn-primary'}`;
        btn.textContent = props.label;
        if (props.onClick) btn.onclick = props.onClick;
        if (props.disabled) btn.disabled = true;
        return btn;
    },

    Card: (props) => {
        const card = document.createElement('div');
        card.className = `card ${props.className || ''}`;
        if (props.title) {
            const h3 = document.createElement('h3');
            h3.textContent = props.title;
            card.appendChild(h3);
        }
        const content = document.createElement('div');
        content.appendChild(props.children);
        card.appendChild(content);
        return card;
    },

    Modal: (props) => {
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${props.isOpen ? '' : 'hidden'}`;
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const closeBtn = Components.Button({
            label: '✕',
            variant: 'btn-outline',
            onClick: props.onClose
        });
        closeBtn.style.float = 'right';

        content.appendChild(closeBtn);
        content.appendChild(props.children);
        overlay.appendChild(content);
        
        return overlay;
    },

    Notification: (props) => {
        const div = document.createElement('div');
        div.className = 'notification';
        div.textContent = props.message;
        return div
    }
};
