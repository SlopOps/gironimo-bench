/**
 * Gironimo — Application Entry Point
 * Orchestrates all features via centralized store.
 */

(function App() {
  'use strict';

  // ── Apply initial theme ──
  Components.applyTheme(AppStore.getState().theme);

  // ── Build DOM structure ──
  function buildApp() {
    const wrapper = document.querySelector('.app-wrapper');

    // Header
    const header = document.querySelector('.app-header');
    const headerActions = document.createElement('div');
    headerActions.className = 'header-actions';

    // Theme toggle
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle theme');
    themeBtn.setAttribute('data-tooltip', 'Toggle theme');
    themeBtn.addEventListener('click', () => {
      const current = AppStore.getState().theme;
      AppStore.dispatch({ type: 'SET_THEME', payload: current === 'dark' ? 'light' : 'dark' });
    });
    headerActions.appendChild(themeBtn);
    header.appendChild(headerActions);

    // Notification container
    document.body.appendChild(Components.NotificationContainer());

    // Main grid
    const main = document.querySelector('.app-main');

    // Left: Philosophy
    const leftPanel = document.createElement('div');
    leftPanel.className = 'panel';
    leftPanel.id = 'philosophy-root';
    main.appendChild(leftPanel);

    // Center: Giraffe + Workflow
    const centerPanel = document.createElement('div');
    centerPanel.className = 'center-panel';
    centerPanel.id = 'center-root';
    main.appendChild(centerPanel);

    // Right: Leaderboard
    const rightPanel = document.createElement('div');
    rightPanel.className = 'panel leaderboard-panel';
    rightPanel.id = 'leaderboard-root';
    main.appendChild(rightPanel);

    // Initial render
    fullRender();

    // Fetch leaderboard data
    Leaderboard.fetchData();
  }

  // ── Full re-render ──
  function fullRender() {
    const state = AppStore.getState();

    // Theme
    Components.applyTheme(state.theme);

    // Philosophy
    const philoRoot = document.getElementById('philosophy-root');
    philoRoot.innerHTML = '';
    philoRoot.appendChild(Philosophy.render());

    // Center: Giraffe + Workflow
    const centerRoot = document.getElementById('center-root');
    centerRoot.innerHTML = '';
    centerRoot.appendChild(Giraffe.render());
    centerRoot.appendChild(Workflow.render());

    // Leaderboard
    const lbRoot = document.getElementById('leaderboard-root');
    lbRoot.innerHTML = '';
    lbRoot.appendChild(Leaderboard.render());

    // Notifications
    Components.renderNotifications();
  }

  // ── Optimized partial updates ──
  function handleStateChange(state, prev, action) {
    // For data loads and sorting, do full re-render
    if (['SET_LEADERBOARD_DATA', 'SET_LEADERBOARD_ERROR', 'SET_LEADERBOARD_LOADING', 'SET_SORT'].includes(action.type)) {
      const lbRoot = document.getElementById('leaderboard-root');
      if (lbRoot) { lbRoot.innerHTML = ''; lbRoot.appendChild(Leaderboard.render()); }
      Components.renderNotifications();
      return;
    }

    // Theme change
    if (action.type === 'SET_THEME') {
      Components.applyTheme(state.theme);
      Giraffe.handleStateChange(state, prev);
      Components.renderNotifications();
      return;
    }

    // Philosophy changes
    if (action.type === 'TOGGLE_PHILOSOPHY_STATEMENT' || action.type === 'SET_PHILOSOPHY_FILTER') {
      const philoRoot = document.getElementById('philosophy-root');
      if (philoRoot) { philoRoot.innerHTML = ''; philoRoot.appendChild(Philosophy.render()); }
      Giraffe.handleStateChange(state, prev);
      // Re-render leaderboard for highlighting
      const lbRoot = document.getElementById('leaderboard-root');
      if (lbRoot) { lbRoot.innerHTML = ''; lbRoot.appendChild(Leaderboard.render()); }
      // Re-render workflow for philosophy context
      const centerRoot = document.getElementById('center-root');
      if (centerRoot) {
        const giraffeContainer = centerRoot.querySelector('.giraffe-container');
        centerRoot.innerHTML = '';
        if (giraffeContainer) {
          centerRoot.appendChild(Giraffe.render());
        }
        centerRoot.appendChild(Workflow.render());
      }
      Components.renderNotifications();
      return;
    }

    // Model selection
    if (action.type === 'SET_SELECTED_MODEL') {
      Giraffe.handleStateChange(state, prev);
      // Re-render leaderboard for selection highlight
      const lbRoot = document.getElementById('leaderboard-root');
      if (lbRoot) { lbRoot.innerHTML = ''; lbRoot.appendChild(Leaderboard.render()); }
      // Re-render workflow
      const centerRoot = document.getElementById('center-root');
      if (centerRoot) {
        centerRoot.innerHTML = '';
        centerRoot.appendChild(Giraffe.render());
        centerRoot.appendChild(Workflow.render());
      }
      Components.renderNotifications();
      return;
    }

    // Workflow hover
    if (action.type === 'SET_WORKFLOW_HOVER') {
      Giraffe.handleStateChange(state, prev);
      return;
    }

    // Notifications
    if (action.type === 'ADD_NOTIFICATION' || action.type === 'REMOVE_NOTIFICATION') {
      Components.renderNotifications();
      return;
    }

    // Fallback: full render
    fullRender();
  }

  // ── Subscribe to store ──
  AppStore.subscribe(handleStateChange);

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildApp);
  } else {
    buildApp();
  }
})();
