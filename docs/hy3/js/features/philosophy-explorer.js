// Feature 2: Philosophy Explorer
const PhilosophyExplorer = (() => {
  // Static Philosophy Statements
  const statements = [
    { category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { category: 'Technical', text: 'Own your infrastructure. Own your data' }
  ];

  // Group by Category
  const groupedStatements = statements.reduce((acc, stmt) => {
    if (!acc[stmt.category]) acc[stmt.category] = [];
    acc[stmt.category].push(stmt);
    return acc;
  }, {});

  // Render Function
  const render = (container) => {
    container.innerHTML = '';
    const state = Store.getState();
    const selected = state.selectedPhilosophyStatements;
    const filterCategory = state.philosophyFilterCategory;
    const categories = Object.keys(groupedStatements);

    // Section Title
    const title = document.createElement('h2');
    title.textContent = 'Philosophy Explorer';
    container.appendChild(title);

    // Category Filters
    const filterContainer = document.createElement('div');
    filterContainer.className = 'philosophy-filters';

    // "All" Filter Button
    const allBtn = Components.Button({
      variant: filterCategory === 'All' ? 'primary' : 'secondary',
      size: 'small',
      children: 'All',
      onClick: () => Store.dispatch({
        type: 'SET_PHILOSOPHY_FILTER_CATEGORY',
        payload: 'All'
      })
    });
    filterContainer.appendChild(allBtn);

    // Category-Specific Filter Buttons
    categories.forEach(category => {
      const btn = Components.Button({
        variant: filterCategory === category ? 'primary' : 'secondary',
        size: 'small',
        children: category,
        onClick: () => Store.dispatch({
          type: 'SET_PHILOSOPHY_FILTER_CATEGORY',
          payload: category
        })
      });
      filterContainer.appendChild(btn);
    });
    container.appendChild(filterContainer);

    // Filtered Categories to Render
    const categoriesToRender = filterCategory === 'All' ? categories : [filterCategory];

    // Render Statements
    categoriesToRender.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'philosophy-category';

      const categoryTitle = document.createElement('h3');
      categoryTitle.className = 'philosophy-category-title';
      categoryTitle.textContent = category;
      categoryDiv.appendChild(categoryTitle);

      groupedStatements[category].forEach(stmt => {
        const isSelected = selected.includes(stmt.text);
        const stmtDiv = document.createElement('div');
        stmtDiv.className = `philosophy-statement ${isSelected ? 'philosophy-statement-selected' : ''}`;
        stmtDiv.setAttribute('role', 'checkbox');
        stmtDiv.setAttribute('aria-checked', isSelected);
        stmtDiv.setAttribute('tabindex', '0');

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isSelected;
        checkbox.addEventListener('click', (e) => e.stopPropagation());

        // Statement Text
        const text = document.createElement('span');
        text.textContent = stmt.text;

        // Toggle Selection
        const toggleStmt = () => Store.dispatch({
          type: 'TOGGLE_PHILOSOPHY_STATEMENT',
          payload: stmt.text
        });

        stmtDiv.addEventListener('click', toggleStmt);
        stmtDiv.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleStmt();
          }
        });

        stmtDiv.appendChild(checkbox);
        stmtDiv.appendChild(text);
        categoryDiv.appendChild(stmtDiv);
      });

      container.appendChild(categoryDiv);
    });
  };

  // Initialize
  const init = (container) => {
    Store.subscribe(() => render(container));
    render(container);
  };

  return { init, statements };
})();

window.PhilosophyExplorer = PhilosophyExplorer;
