// Reusable UI Components (No Feature-Specific Logic)
const Components = (() => {
  // Button Component
  const Button = (props) => {
    const {
      variant = 'primary',
      size = 'medium',
      disabled = false,
      onClick,
      children,
      className = '',
      ariaLabel,
      ...rest
    } = props;

    const button = document.createElement('button');
    button.className = `btn btn-${variant} btn-${size} ${className}`;
    button.disabled = disabled;
    if (ariaLabel) button.setAttribute('aria-label', ariaLabel);

    // Click Handler
    button.addEventListener('click', (e) => {
      if (!disabled && onClick) onClick(e);
    });

    // Keyboard Support (Enter/Space)
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });

    // Append Children
    if (typeof children === 'string') {
      button.textContent = children;
    } else if (children) {
      button.appendChild(children);
    }

    // Set Additional Attributes
    Object.entries(rest).forEach(([key, val]) => button.setAttribute(key, val));
    return button;
  };

  // Card Component
  const Card = (props) => {
    const { children, className = '', onClick, ...rest } = props;
    const card = document.createElement('div');
    card.className = `card ${className}`;

    if (onClick) {
      card.addEventListener('click', onClick);
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      });
    }

    if (children) {
      Array.isArray(children) 
        ? children.forEach(child => card.appendChild(child))
        : card.appendChild(children);
    }

    Object.entries(rest).forEach(([key, val]) => card.setAttribute(key, val));
    return card;
  };

  // Modal Component
  const Modal = (props) => {
    const { isOpen, onClose, title, children, ...rest } = props;
    const modal = document.createElement('div');
    modal.className = `modal ${isOpen ? 'modal-open' : ''}`;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');

    if (!isOpen) {
      modal.style.display = 'none';
      return modal;
    }

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', onClose);

    // Content Container
    const content = document.createElement('div');
    content.className = 'modal-content';

    // Close Button
    const closeBtn = Button({
      variant: 'ghost',
      size: 'small',
      onClick: onClose,
      className: 'modal-close',
      ariaLabel: 'Close modal',
      children: '×'
    });

    // Title
    const titleEl = document.createElement('h2');
    titleEl.id = 'modal-title';
    titleEl.className = 'modal-title';
    titleEl.textContent = title || '';

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (children) {
      Array.isArray(children)
        ? children.forEach(child => body.appendChild(child))
        : body.appendChild(children);
    }

    content.appendChild(closeBtn);
    content.appendChild(titleEl);
    content.appendChild(body);
    modal.appendChild(overlay);
    modal.appendChild(content);

    // Focus Trap
    const focusableElements = content.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });

    // Auto-Focus First Element
    setTimeout(() => firstElement?.focus(), 0);
    return modal;
  };

  // Tooltip Component
  const Tooltip = (props) => {
    const { target, content, position = 'top', ...rest } = props;
    const tooltip = document.createElement('div');
    tooltip.className = `tooltip tooltip-${position}`;
    tooltip.textContent = content;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.style.display = 'none';

    // Show/Hide Events
    ['mouseenter', 'focus'].forEach(event => {
      target.addEventListener(event, () => { tooltip.style.display = 'block'; });
    });
    ['mouseleave', 'blur'].forEach(event => {
      target.addEventListener(event, () => { tooltip.style.display = 'none'; });
    });

    return tooltip;
  };

  // Notification Component
  const Notification = (props) => {
    const { id, message, type = 'info', duration = 3000, onClose } = props;
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    const messageEl = document.createElement('span');
    messageEl.textContent = message;

    const closeBtn = Button({
      variant: 'ghost',
      size: 'small',
      onClick: () => onClose(id),
      ariaLabel: 'Close notification',
      children: '×'
    });

    notification.appendChild(messageEl);
    notification.appendChild(closeBtn);

    // Auto-Close
    setTimeout(() => onClose(id), duration);
    return notification;
  };

  // ThemeProvider Component
  const ThemeProvider = (props) => {
    const { children } = props;
    const provider = document.createElement('div');
    provider.className = 'theme-provider';

    // Sync Theme with Store
    const unsubscribe = Store.subscribe((state) => {
      document.documentElement.setAttribute('data-theme', state.theme);
    });

    // Initial Theme
    document.documentElement.setAttribute('data-theme', Store.getState().theme);
    provider.unsubscribe = unsubscribe;

    // Append Children
    if (children) {
      Array.isArray(children)
        ? children.forEach(child => provider.appendChild(child))
        : provider.appendChild(children);
    }

    return provider;
  };

  return { Button, Card, Modal, Tooltip, Notification, ThemeProvider };
})();

window.Components = Components;
