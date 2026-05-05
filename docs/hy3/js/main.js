// Application Entry Point
const App = (() => {
  // Initialize Notification System
  const initNotifications = () => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    Store.subscribe((state) => {
      container.innerHTML = '';
      state.notifications.forEach(notif => {
        const notifEl = Components.Notification({
          id: notif.id,
          message: notif.message,
          type: notif.type,
          duration: notif.duration,
          onClose: (id) => Store.dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
        });
        container.appendChild(notifEl);
      });
    });
  };

  // Initialize Theme Toggle
  const initThemeToggle = () => {
    const container = document.getElementById('theme-toggle-container');
    if (!container) return;

    const renderToggle = () => {
      const state = Store.getState();
      container.innerHTML = '';
      const btn = Components.Button({
        variant: 'secondary',
        size: 'small',
        onClick: () => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          Store.dispatch({ type: 'SET_THEME', payload: newTheme });
        },
        children: state.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode',
        ariaLabel: `Switch to ${state.theme === 'light' ? 'dark' : 'light'} theme`
      });
      container.appendChild(btn);
    };

    Store.subscribe(renderToggle);
    renderToggle();
  };

  // Initialize All Features
  const init = () => {
    // Theme Provider
    const themeProviderContainer = document.getElementById('theme-provider');
    if (themeProviderContainer) {
      themeProviderContainer.appendChild(Components.ThemeProvider({}));
    }

    // Core Systems
    initNotifications();
    initThemeToggle();

    // Features
    PhilosophyExplorer.init(document.getElementById('philosophy-explorer-container'));
    Workflow.init(document.getElementById('workflow-container'));
    Leaderboard.init(document.getElementById('leaderboard-container'));
    Mascot.init();
  };

  return { init };
})();

// Start App on DOM Load
document.addEventListener('DOMContentLoaded', () => App.init());
