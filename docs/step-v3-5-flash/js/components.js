/**
 * Reusable UI Components
 * Props-driven, no feature-specific logic
 */

// ==================== Button ====================
function createButton(props = {}) {
  const {
    text = '',
    variant = 'primary', // primary | secondary | tertiary
    disabled = false,
    onClick = null,
    ariaLabel = null,
    className = '',
    type = 'button'
  } = props;

  const button = document.createElement('button');
  button.type = type;
  button.textContent = text;
  button.className = `button button-${variant} ${className}`.trim();
  button.disabled = disabled;
  
  if (ariaLabel) button.setAttribute('aria-label', ariaLabel);
  if (onClick) button.addEventListener('click', onClick);

  return button;
}

// ==================== Card ====================
function createCard(props = {}) {
  const {
    title = null,
    content = '',
    headerContent = null,
    footerContent = null,
    className = '',
    onClick = null
  } = props;

  const card = document.createElement('div');
  card.className = `card ${className}`.trim();
  
  if (onClick) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', onClick);
  }

  // Build card structure
  const parts = [];
  
  if (title || headerContent) {
    const header = document.createElement('div');
    header.className = 'card-header';
    
    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.className = 'card-title';
      titleEl.textContent = title;
      header.appendChild(titleEl);
    }
    
    if (headerContent) {
      header.appendChild(headerContent);
    }
    
    parts.push(header);
  }

  if (content) {
    const body = document.createElement('div');
    body.className = 'card-body';
    
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    
    parts.push(body);
  }

  if (footerContent) {
    const footer = document.createElement('div');
    footer.className = 'card-footer';
    
    if (typeof footerContent === 'string') {
      footer.innerHTML = footerContent;
    } else if (footerContent instanceof HTMLElement) {
      footer.appendChild(footerContent);
    }
    
    parts.push(footer);
  }

  parts.forEach(part => card.appendChild(part));
  return card;
}

// ==================== Modal ====================
function createModal(props = {}) {
  const {
    title = '',
    content = '',
    onClose = null,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    ariaLabel = null
  } = props;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  
  if (ariaLabel) overlay.setAttribute('aria-label', ariaLabel);
  if (title) overlay.setAttribute('aria-labelledby', 'modal-title');

  // Create container
  const container = document.createElement('div');
  container.className = 'modal-container';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';

  const titleEl = document.createElement('h2');
  titleEl.id = 'modal-title';
  titleEl.className = 'modal-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);

  const closeBtn = createButton({
    text: '×',
    variant: 'tertiary',
    ariaLabel: 'Close modal',
    onClick: () => close()
  });
  closeBtn.className = 'modal-close';
  header.appendChild(closeBtn);

  container.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else if (content instanceof HTMLElement) {
    body.appendChild(content);
  }
  
  container.appendChild(body);

  overlay.appendChild(container);

  // Close function
  function close() {
    overlay.remove();
    if (onClose) onClose();
  }

  // Event handlers
  if (closeOnOverlayClick) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
  }

  if (closeOnEscape) {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', handleEscape);
      }
    }
    document.addEventListener('keydown', handleEscape);
  }

  // Focus trap
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 0);
    
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  return overlay;
}

// ==================== Tooltip ====================
function createTooltip(props = {}) {
  const {
    content = '',
    children = null,
    position = 'top' // top | bottom | left | right
  } = props;

  const wrapper = document.createElement('div');
  wrapper.className = 'tooltip';

  // Tooltip content element
  const tooltipContent = document.createElement('span');
  tooltipContent.className = 'tooltip-content';
  tooltipContent.textContent = content;
  tooltipContent.setAttribute('role', 'tooltip');
  wrapper.appendChild(tooltipContent);

  // Child element (what the tooltip is attached to)
  if (children) {
    if (typeof children === 'string') {
      const span = document.createElement('span');
      span.textContent = children;
      wrapper.appendChild(span);
    } else if (children instanceof HTMLElement) {
      wrapper.appendChild(children);
    }
  }

  // Position styling
  switch (position) {
    case 'bottom':
      tooltipContent.style.top = 'auto';
      tooltipContent.style.bottom = '100%';
      tooltipContent.style.left = '50%';
      tooltipContent.style.transform = 'translateX(-50%)';
      tooltipContent.style.marginBottom = '0.5rem';
      tooltipContent.style.marginTop = '0';
      break;
    case 'left':
      tooltipContent.style.top = '50%';
      tooltipContent.style.left = 'auto';
      tooltipContent.style.right = '100%';
      tooltipContent.style.transform = 'translateY(-50%)';
      tooltipContent.style.marginRight = '0.5rem';
      tooltipContent.style.marginBottom = '0';
      break;
    case 'right':
      tooltipContent.style.top = '50%';
      tooltipContent.style.left = '100%';
      tooltipContent.style.transform = 'translateY(-50%)';
      tooltipContent.style.marginLeft = '0.5rem';
      tooltipContent.style.marginBottom = '0';
      break;
    case 'top':
    default:
      // Default positioning (already set in CSS)
      break;
  }

  return wrapper;
}

// ==================== Notification ====================
function createNotification(props = {}) {
  const {
    id = null,
    type = 'info', // success | error | info
    message = '',
    onDismiss = null,
    autoDismiss = false,
    autoDismissDelay = 5000
  } = props;

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'polite');

  const messageEl = document.createElement('span');
  messageEl.textContent = message;
  notification.appendChild(messageEl);

  const dismissBtn = createButton({
    text: '×',
    variant: 'tertiary',
    ariaLabel: 'Dismiss notification',
    onClick: () => dismiss()
  });
  dismissBtn.className = 'notification-dismiss';
  notification.appendChild(dismissBtn);

  // Auto dismiss
  if (autoDismiss && autoDismissDelay > 0) {
    setTimeout(() => dismiss(), autoDismissDelay);
  }

  function dismiss() {
    notification.remove();
    if (onDismiss) onDismiss();
  }

  return notification;
}

// ==================== ThemeProvider ====================
function createThemeProvider(props = {}) {
  const {
    initialTheme = 'light',
    onThemeChange = null
  } = props;

  const container = document.createElement('div');
  container.className = 'theme-provider';

  const toggleBtn = createButton({
    text: '🌙',
    ariaLabel: 'Toggle theme',
    onClick: () => toggleTheme()
  });
  toggleBtn.id = 'theme-toggle';
  container.appendChild(toggleBtn);

  // Subscribe to store for theme changes
  const unsubscribe = store.subscribe((state) => {
    const theme = state.theme;
    document.documentElement.setAttribute('data-theme', theme);
    toggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
    
    if (onThemeChange) onThemeChange(theme);
  });

  // Initial theme application
  document.documentElement.setAttribute('data-theme', initialTheme);

  // Store reference for cleanup
  container._unsubscribe = unsubscribe;

  return container;
}

// ==================== Export for use in app.js ====================
// All components are globally accessible via window
window.GironimoComponents = {
  createButton,
  createCard,
  createModal,
  createTooltip,
  createNotification,
  createThemeProvider
};
