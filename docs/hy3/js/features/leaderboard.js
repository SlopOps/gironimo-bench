// Feature 5: Leaderboard (CSV-Driven)
const Leaderboard = (() => {
  const CSV_URL = '/results/leaderboard.csv';

  // Parse CSV Row
  const parseRow = (cells, headers) => {
    const numericFields = [
      'speed', 'one_shot_attempts', 'design', 'architecture', 'code_quality',
      'feature_complete', 'performance', 'accessibility', 'best_practices', 'value', 'overall_score'
    ];
    const row = {};
    headers.forEach((header, index) => {
      let value = cells[index]?.trim() || '0';
      row[header] = numericFields.includes(header) ? (parseFloat(value) || 0) : value;
    });
    return row;
  };

  // Fetch and Parse CSV
  const fetchCSV = async () => {
    try {
      const response = await fetch(CSV_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const text = await response.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) throw new Error('Empty or invalid CSV');

      // Parse Headers
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = [
        'model', 'date', 'video_url', 'result_url', 'speed', 'one_shot_attempts',
        'design', 'architecture', 'code_quality', 'feature_complete', 'performance',
        'accessibility', 'best_practices', 'value', 'overall_score'
      ];
      const missing = requiredHeaders.filter(h => !headers.includes(h));
      if (missing.length) throw new Error(`Missing headers: ${missing.join(', ')}`);

      // Parse Rows (Ignore Invalid)
      const rows = lines.slice(1)
        .map(line => line.split(','))
        .map(cells => parseRow(cells, headers))
        .filter(row => row.model && row.model !== '0');

      Store.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: rows });
      Store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: 'Leaderboard loaded successfully', type: 'success' }
      });

    } catch (e) {
      console.error('CSV Load Error:', e);
      Store.dispatch({
        type: 'ADD_NOTIFICATION',
        payload: { message: `Failed to load leaderboard: ${e.message}`, type: 'error', duration: 5000 }
      });
      Store.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: [] });
    }
  };

  // Render Leaderboard
  const render = (container) => {
    container.innerHTML = '';
    const state = Store.getState();
    const { leaderboardData, selectedModel, selectedPhilosophyStatements, leaderboardSort } = state;

    // Section Title
    const title = document.createElement('h2');
    title.textContent = 'Leaderboard';
    container.appendChild(title);

    // Loading State
    if (!leaderboardData) {
      container.appendChild(document.createTextNode('Loading leaderboard...'));
      return;
    }

    // Empty State
    if (leaderboardData.length === 0) {
      container.appendChild(document.createTextNode('No leaderboard data available.'));
      return;
    }

    // Sort Data (Derived State - Not Stored)
    const sortedData = [...leaderboardData].sort((a, b) => {
      const field = leaderboardSort.field;
      let valA = field === 'date' ? new Date(a[field]) : a[field];
      let valB = field === 'date' ? new Date(b[field]) : b[field];
      if (valA < valB) return leaderboardSort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return leaderboardSort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    // Top Performer (Highest Overall Score)
    const topPerformer = sortedData.reduce((max, row) => 
      row.overall_score > max.overall_score ? row : max, sortedData[0]);

    // Philosophy Highlighting (Derived State)
    const selectedCategories = selectedPhilosophyStatements.map(stmt => {
      const found = PhilosophyExplorer.statements.find(s => s.text === stmt);
      return found?.category;
    }).filter(Boolean);

    const highlightRules = {
      'Practical': (row) => (row.code_quality + row.feature_complete) >= 8,
      'Philosophical': (row) => row.architecture >= 8,
      'Technical': (row) => row.best_practices >= 8
    };

    const highlightedModels = new Set();
    selectedCategories.forEach(category => {
      if (highlightRules[category]) {
        sortedData.forEach(row => {
          if (highlightRules[category](row)) highlightedModels.add(row.model);
        });
      }
    });

    // Create Table
    const table = document.createElement('table');
    table.className = 'leaderboard';

    // Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      { field: 'model', label: 'Model' },
      { field: 'date', label: 'Date' },
      { field: 'overall_score', label: 'Overall Score' },
      { field: 'code_quality', label: 'Code Quality' },
      { field: 'feature_complete', label: 'Feature Complete' },
      { field: 'architecture', label: 'Architecture' },
      { field: 'best_practices', label: 'Best Practices' }
    ];

    headers.forEach(({ field, label }) => {
      const th = document.createElement('th');
      th.textContent = label;
      th.setAttribute('aria-sort', leaderboardSort.field === field 
        ? `${leaderboardSort.direction}ending` 
        : 'none');
      th.addEventListener('click', () => {
        const direction = leaderboardSort.field === field && leaderboardSort.direction === 'desc' 
          ? 'asc' 
          : 'desc';
        Store.dispatch({
          type: 'SET_LEADERBOARD_SORT',
          payload: { field, direction }
        });
      });
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Table Body
    const tbody = document.createElement('tbody');
    sortedData.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'leaderboard-row';

      // Row States
      if (selectedModel?.model === row.model) tr.classList.add('leaderboard-row-selected');
      if (row.model === topPerformer.model) tr.classList.add('leaderboard-row-top');
      if (highlightedModels.has(row.model)) tr.classList.add('leaderboard-row-highlighted');

      // Select Model on Click
      tr.addEventListener('click', () => {
        Store.dispatch({ type: 'SET_SELECTED_MODEL', payload: row });
        Store.dispatch({
          type: 'ADD_NOTIFICATION',
          payload: { message: `Selected model: ${row.model}`, type: 'info' }
        });
      });

      // Cells
      headers.forEach(({ field }) => {
        const td = document.createElement('td');
        td.textContent = row[field];
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
  };

  // Initialize
  const init = (container) => {
    fetchCSV();
    Store.subscribe(() => render(container));
    render(container);
  };

  return { init, fetchCSV };
})();

window.Leaderboard = Leaderboard;
