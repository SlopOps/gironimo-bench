/**
 * Gironimo — Reusable UI Components
 * All props-driven. No feature logic.
 */

const Components = (() => {

  /* ── Button ── */
  function Button({ text, variant = '', size = '', onClick, disabled = false, ariaLabel, className = '', tooltip } = {}) {
    const el = document.createElement('button');
    el.className = `btn ${variant ? 'btn--' + variant : ''} ${size ? 'btn--' + size : ''} ${className}`.trim();
    el.textContent = text;
    el.disabled = disabled;
    if (ariaLabel) el.setAttribute('aria-label', ariaLabel);
    if (tooltip) el.setAttribute('data-tooltip', tooltip);
    if (onClick) el.addEventListener('click', onClick);
    return el;
  }

  /* ── Card ── */
  function Card({ title, body, footer, interactive = false, selected = false, onClick, className = '' } = {}) {
    const el = document.createElement('div');
    el.className = `card ${interactive ? 'card--interactive' : ''} ${selected ? 'card--selected' : ''} ${className}`.trim();
    if (interactive && onClick) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', onClick);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } });
    }
    if (title) {
      const h = document.createElement('div');
      h.className = 'card__header';
      const t = document.createElement('h4');
      t.className = 'card__title';
      t.textContent = title;
      h.appendChild(t);
      el.appendChild(h);
    }
    if (body) {
      const b = document.createElement('div');
      b.className = 'card__body';
      b.textContent = body;
      el.appendChild(b);
    }
    if (footer) {
      const f = document.createElement('div');
      f.className = 'card__footer';
      f.textContent = footer;
      el.appendChild(f);
    }
    return el;
  }

  /* ── Modal ── */
  function Modal({ title, body, onClose }) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title || 'Dialog');

    const modal = document.createElement('div');
    modal.className = 'modal';

    const header = document.createElement('div');
    header.className = 'modal__header';
    const h2 = document.createElement('h2');
    h2.className = 'modal__title';
    h2.textContent = title;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal__close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close dialog');
    closeBtn.addEventListener('click', onClose);
    header.appendChild(h2);
    header.appendChild(closeBtn);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'modal__body';
    if (typeof body === 'string') {
      bodyEl.innerHTML = body;
    } else if (body instanceof HTMLElement) {
      bodyEl.appendChild(body);
    }

    modal.appendChild(header);
    modal.appendChild(bodyEl);
    overlay.appendChild(modal);

    overlay.addEventListener('click', e => { if (e.target === overlay) onClose(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { onClose(); document.removeEventListener('keydown', esc); }
    });

    requestAnimationFrame(() => overlay.classList.add('active'));
    closeBtn.focus();

    return overlay;
  }

  /* ── Notification Container ── */
  function NotificationContainer() {
    const el = document.createElement('div');
    el.className = 'notification-container';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.id = 'notification-container';
    return el;
  }

  function showNotification(title, body) {
    AppStore.dispatch({ type: 'ADD_NOTIFICATION', payload: { title, body } });
  }

  function renderNotifications() {
    const container = document.getElementById('notification-container');
    if (!container) return;
    const { notifications } = AppStore.getState();
    const existing = new Set();
    container.querySelectorAll('.notification').forEach(n => existing.add(n.dataset.id));

    notifications.forEach(n => {
      const id = String(n.id);
      if (!existing.has(id)) {
        const el = document.createElement('div');
        el.className = 'notification fade-in';
        el.dataset.id = id;
        el.innerHTML = `<div class="notification__title">${escHtml(n.title)}</div>${n.body ? `<div class="notification__body">${escHtml(n.body)}</div>` : ''}`;
        container.appendChild(el);
        setTimeout(() => {
          el.classList.add('removing');
          setTimeout(() => {
            el.remove();
            AppStore.dispatch({ type: 'REMOVE_NOTIFICATION', payload: n.id });
          }, 250);
        }, 3500);
      }
    });
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── ThemeProvider ── */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return { Button, Card, Modal, NotificationContainer, showNotification, renderNotifications, applyTheme, escHtml };
})();
