/**
 * Gironimo — Philosophy Explorer
 */

const Philosophy = (() => {
  const STATEMENTS = [
    { category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { category: 'Technical', text: 'Own your infrastructure. Own your data' },
  ];

  const CATEGORIES = ['All', 'Practical', 'Philosophical', 'Technical'];

  function getCategory(text) {
    const s = STATEMENTS.find(s => s.text === text);
    return s ? s.category : null;
  }

  function isHighlighted(statement, state) {
    if (!state.selectedModel || state.selectedPhilosophyStatements.length === 0) return false;
    if (!state.selectedPhilosophyStatements.includes(statement.text)) return false;
    const m = state.selectedModel;
    switch (statement.category) {
      case 'Practical': return m.code_quality >= 8 && m.feature_complete >= 8;
      case 'Philosophical': return m.architecture >= 8;
      case 'Technical': return m.best_practices >= 8;
      default: return false;
    }
  }

  function render() {
    const state = AppStore.getState();
    const container = document.createElement('div');
    container.id = 'philosophy-panel';

    const title = document.createElement('h2');
    title.className = 'panel-title';
    title.textContent = 'Philosophy';
    container.appendChild(title);

    // Filters
    const filters = document.createElement('div');
    filters.className = 'philosophy-filters';
    filters.setAttribute('role', 'tablist');
    filters.setAttribute('aria-label', 'Filter by category');

    CATEGORIES.forEach(cat => {
      const btn = Components.Button({
        text: cat,
        size: 'sm',
        variant: state.philosophyFilter === cat ? 'active' : '',
        onClick: () => AppStore.dispatch({ type: 'SET_PHILOSOPHY_FILTER', payload: cat }),
      });
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', state.philosophyFilter === cat ? 'true' : 'false');
      filters.appendChild(btn);
    });
    container.appendChild(filters);

    // List
    const list = document.createElement('div');
    list.className = 'philosophy-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Philosophy statements');

    const filtered = STATEMENTS.filter(s =>
      state.philosophyFilter === 'All' || s.category === state.philosophyFilter
    );

    filtered.forEach((stmt, idx) => {
      const selected = state.selectedPhilosophyStatements.includes(stmt.text);
      const highlighted = isHighlighted(stmt, state);

      const item = document.createElement('div');
      item.className = `philosophy-item ${selected ? 'selected' : ''} fade-up stagger-${Math.min(idx + 1, 4)}`;
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', selected ? 'true' : 'false');
      item.setAttribute('tabindex', '0');

      if (highlighted) {
        item.style.boxShadow = 'inset 0 0 0 1px var(--accent), 0 0 8px rgba(232,197,71,0.15)';
      }

      const check = document.createElement('div');
      check.className = 'philosophy-item__check';

      const textWrap = document.createElement('div');
      const text = document.createElement('div');
      text.className = 'philosophy-item__text';
      text.textContent = stmt.text;

      const cat = document.createElement('div');
      cat.className = 'philosophy-item__category';
      cat.textContent = stmt.category;

      textWrap.appendChild(text);
      textWrap.appendChild(cat);
      item.appendChild(check);
      item.appendChild(textWrap);

      const toggle = () => {
        AppStore.dispatch({ type: 'TOGGLE_PHILOSOPHY_STATEMENT', payload: stmt.text });
      };
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });

      list.appendChild(item);
    });

    container.appendChild(list);
    return container;
  }

  return { render, getCategory, STATEMENTS, CATEGORIES };
})();
