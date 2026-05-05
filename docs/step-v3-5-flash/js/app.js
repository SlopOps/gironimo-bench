/**
 * Core Application Logic
 * CSV fetching, feature wiring, render functions
 */

// ==================== CSV Fetching ====================
async function fetchLeaderboardCSV() {
  try {
    const response = await fetch('/results/leaderboard.csv');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error('Failed to fetch leaderboard CSV:', error);
    store.dispatch({ type: 'FETCH_ERROR', payload: error.message });
    return [];
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    console.warn('CSV has no data rows');
    return [];
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  const requiredHeaders = [
    'model', 'date', 'video_url', 'result_url', 'speed',
    'one_shot_attempts', 'design', 'architecture', 'code_quality',
    'feature_complete', 'performance', 'accessibility', 'best_practices',
    'value', 'overall_score'
  ];

  // Validate headers
  const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));
  if (!hasRequiredHeaders) {
    console.error('CSV missing required headers');
    return [];
  }

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    if (values.length !== headers.length) {
      console.warn(`Skipping invalid row ${i}: column count mismatch`);
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      const value = values[index] ? values[index].trim() : '';
      
      // Convert numeric fields
      if (['speed', 'one_shot_attempts', 'design', 'architecture', 
           'code_quality', 'feature_complete', 'performance', 
           'accessibility', 'best_practices', 'value', 'overall_score'].includes(header)) {
        row[header] = parseFloat(value) || 0;
      } else {
        row[header] = value;
      }
    });

    // Validate required fields
    if (!row.model) {
      console.warn(`Skipping row ${i}: missing model name`);
      continue;
    }

    data.push(row);
  }

  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

// ==================== Derived State (computed during render) ====================
function getSortedLeaderboard(state) {
  const data = [...state.leaderboardData];
  const { sortKey, sortDirection } = state;

  data.sort((a, b) => {
    let aVal = a[sortKey] || '';
    let bVal = b[sortKey] || '';

    // Handle string comparison
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return data;
}

function getFilteredLeaderboard(state) {
  let data = getSortedLeaderboard(state);
  
  // Filter by selected philosophy if any
  if (state.selectedPhilosophyStatements.length > 0) {
    const categories = state.selectedPhilosophyStatements.map(s => {
      // Extract category from statement mapping
      const mapping = {
        'Five minutes of correct work beats thirty seconds of plausible garbage': 'practical',
        'Human gates at specification and architecture catch expensive mistakes early': 'practical',
        'AI amplifies human judgment; it doesn\'t replace it': 'philosophical',
        'Stand tall. See far. Move deliberately': 'philosophical',
        'Two-model critique catches what single-model confidence misses': 'technical',
        'Documentation is auto-drafted because it fails when it\'s optional': 'technical',
        'Own your infrastructure. Own your data': 'technical'
      };
      return mapping[s] || null;
    }).filter(c => c !== null);

    // Highlight rows based on philosophy criteria
    data = data.map(row => ({
      ...row,
      highlighted: categories.includes('practical') && 
                   (row.code_quality >= 8 || row.feature_complete >= 8) ||
                   categories.includes('philosophical') && 
                   row.architecture >= 8 ||
                   categories.includes('technical') && 
                   row.best_practices >= 8
    }));
  }

  return data;
}

function getWorkflowStages(state) {
  const stages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];
  const model = state.selectedModel;
  
  let maxStage = 6; // ADR (default for score >= 90)
  
  if (model) {
    const score = model.overall_score || 0;
    if (score >= 90) {
      maxStage = 6; // All stages
    } else if (score >= 70) {
      maxStage = 4; // Up to Implementation (index 4)
    } else {
      maxStage = 2; // Up to Architecture (index 2)
    }
  } else {
    maxStage = -1; // No model selected
  }

  return stages.map((stage, index) => ({
    name: stage,
    index,
    enabled: index <= maxStage,
    active: state.workflowState.activeStage === stage
  }));
}

// ==================== Render Functions ====================
function renderThemeProvider() {
  const container = document.getElementById('theme-toggle');
  if (!container) return;

  container.innerHTML = '';
  const themeProvider = createThemeProvider({
    initialTheme: store.getState().theme,
    onThemeChange: (theme) => {
      store.dispatch({ type: 'SET_THEME', payload: theme });
    }
  });
  container.appendChild(themeProvider);
}

function renderPhilosophyExplorer() {
  const filtersContainer = document.getElementById('philosophy-filters');
  const statementsContainer = document.getElementById('philosophy-statements');
  
  if (!filtersContainer || !statementsContainer) return;

  const state = store.getState();
  
  // Category filter buttons
  const categories = ['all', 'practical', 'philosophical', 'technical'];
  
  filtersContainer.innerHTML = '';
  
  categories.forEach(category => {
    const btn = createButton({
      text: category.charAt(0).toUpperCase() + category.slice(1),
      variant: state.selectedPhilosophyStatements.length > 0 && 
               state.selectedPhilosophyStatements.some(s => {
                 const mapping = {
                   'Five minutes of correct work beats thirty seconds of plausible garbage': 'practical',
                   'Human gates at specification and architecture catch expensive mistakes early': 'practical',
                   'AI amplifies human judgment; it doesn\'t replace it': 'philosophical',
                   'Stand tall. See far. Move deliberately': 'philosophical',
                   'Two-model critique catches what single-model confidence misses': 'technical',
                   'Documentation is auto-drafted because it fails when it\'s optional': 'technical',
                   'Own your infrastructure. Own your data': 'technical'
                 };
                 return mapping[s] === category;
               }) ? 'primary' : 'secondary',
      onClick: () => {
        // Filter logic handled in render
        renderPhilosophyExplorer();
      }
    });
    filtersContainer.appendChild(btn);
  });

  // Philosophy statements
  const statements = [
    { text: 'Five minutes of correct work beats thirty seconds of plausible garbage', category: 'practical' },
    { text: 'Human gates at specification and architecture catch expensive mistakes early', category: 'practical' },
    { text: 'AI amplifies human judgment; it doesn\'t replace it', category: 'philosophical' },
    { text: 'Stand tall. See far. Move deliberately', category: 'philosophical' },
    { text: 'Two-model critique catches what single-model confidence misses', category: 'technical' },
    { text: 'Documentation is auto-drafted because it fails when it\'s optional', category: 'technical' },
    { text: 'Own your infrastructure. Own your data', category: 'technical' }
  ];

  statementsContainer.innerHTML = '';

  statements.forEach(statement => {
    const isSelected = state.selectedPhilosophyStatements.includes(statement.text);
    
    const card = createCard({
      content: '',
      className: `philosophy-card ${isSelected ? 'selected' : ''}`,
      onClick: () => {
        store.dispatch({
          type: 'TOGGLE_PHILOSOPHY_SELECTION',
          payload: statement.text
        });
      }
    });

    const categoryBadge = document.createElement('span');
    categoryBadge.className = `philosophy-category category-${statement.category}`;
    categoryBadge.textContent = statement.category;
    card.appendChild(categoryBadge);

    const textEl = document.createElement('p');
    textEl.textContent = statement.text;
    textEl.style.marginTop = '0.5rem';
    card.appendChild(textEl);

    statementsContainer.appendChild(card);
  });
}

function renderWorkflow() {
  const container = document.getElementById('workflow-stages');
  if (!container) return;

  const state = store.getState();
  const stages = getWorkflowStages(state);

  container.innerHTML = '';

  stages.forEach(stage => {
    const btn = createButton({
      text: stage.name,
      variant: stage.active ? 'primary' : 'secondary',
      disabled: !stage.enabled,
      onClick: () => {
        if (stage.enabled) {
          store.dispatch({
            type: 'SET_WORKFLOW_STAGE',
            payload: { stage: stage.name, modalOpen: true }
          });
        }
      },
      className: `workflow-stage ${stage.enabled ? 'enabled' : 'disabled'} ${stage.active ? 'active' : ''}`
    });

    // Add tooltip for disabled stages
    if (!stage.enabled && state.selectedModel) {
      const tooltip = createTooltip({
        content: `Select a model with higher score to unlock`,
        children: btn
      });
      container.appendChild(tooltip);
    } else {
      container.appendChild(btn);
    }
  });

  // Render modal if open
  if (state.workflowState.modalOpen && state.workflowState.activeStage) {
    renderWorkflowModal(state);
  }
}

function renderWorkflowModal(state) {
  // Remove existing modal
  const existingModal = document.querySelector('.modal-overlay');
  if (existingModal) existingModal.remove();

  const model = state.selectedModel;
  const stage = state.workflowState.activeStage;

  let content = '';
  
  if (model) {
    content = `
      <div style="margin-bottom: 1rem;">
        <strong>Selected Model:</strong> ${model.model}<br>
        <strong>Overall Score:</strong> ${model.overall_score}<br>
        <strong>Date:</strong> ${model.date}
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>Stage:</strong> ${stage}<br>
        <strong>Progress:</strong> ${getWorkflowStages(state).findIndex(s => s.name === stage) + 1} of 7
      </div>
    `;

    if (state.selectedPhilosophyStatements.length > 0) {
      content += `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <strong>Selected Philosophies:</strong>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            ${state.selectedPhilosophyStatements.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  } else {
    content = `
      <p>No model selected. Select a model from the leaderboard to view workflow progress.</p>
    `;
  }

  const modal = createModal({
    title: `Workflow Stage: ${stage}`,
    content: content,
    onClose: () => {
      store.dispatch({
        type: 'SET_WORKFLOW_STAGE',
        payload: { stage: null, modalOpen: false }
      });
    }
  });

  document.getElementById('modal-container').appendChild(modal);
}

function renderLeaderboard() {
  const controlsContainer = document.getElementById('leaderboard-controls');
  const tableContainer = document.getElementById('leaderboard-table');
  
  if (!controlsContainer || !tableContainer) return;

  const state = store.getState();
  const data = getFilteredLeaderboard(state);

  // Controls
  controlsContainer.innerHTML = '';

  const sortControls = document.createElement('div');
  sortControls.className = 'sort-controls';

  const sortOptions = [
    { key: 'overall_score', label: 'Score' },
    { key: 'date', label: 'Date' },
    { key: 'model', label: 'Name' }
  ];

  sortOptions.forEach(option => {
    const btn = createButton({
      text: option.label,
      variant: state.sortKey === option.key ? 'primary' : 'secondary',
      onClick: () => {
        const newDirection = state.sortKey === option.key && state.sortDirection === 'desc' 
          ? 'asc' : 'desc';
        store.dispatch({
          type: 'SET_SORT',
          payload: { key: option.key, direction: newDirection }
        });
      }
    });
    sortControls.appendChild(btn);
  });

  controlsContainer.appendChild(sortControls);

  // Table
  if (data.length === 0) {
    tableContainer.innerHTML = `
      <div class="empty-state">
        <p>No leaderboard data available.</p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem;">
          Ensure /results/leaderboard.csv is accessible.
        </p>
      </div>
    `;
    return;
  }

  const table = document.createElement('table');
  table.className = 'leaderboard-table';
  table.setAttribute('role', 'grid');

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  const columns = [
    { key: 'model', label: 'Model' },
    { key: 'overall_score', label: 'Score' },
    { key: 'date', label: 'Date' },
    { key: 'design', label: 'Design' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'code_quality', label: 'Code' }
  ];

  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    th.setAttribute('scope', 'col');
    th.setAttribute('tabindex', '0');
    th.setAttribute('role', 'columnheader');
    
    if (state.sortKey === col.key) {
      th.setAttribute('aria-sort', state.sortDirection === 'asc' ? 'ascending' : 'descending');
    }

    th.addEventListener('click', () => {
      const newDirection = state.sortKey === col.key && state.sortDirection === 'desc' 
        ? 'asc' : 'desc';
      store.dispatch({
        type: 'SET_SORT',
        payload: { key: col.key, direction: newDirection }
      });
    });

    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        th.click();
      }
    });

    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  const topScore = data.length > 0 ? Math.max(...data.map(d => d.overall_score || 0)) : 0;

  data.forEach((row, index) => {
    const tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    tr.setAttribute('tabindex', '0');

    const isSelected = state.selectedModel && state.selectedModel.model === row.model;
    const isTopPerformer = row.overall_score === topScore && topScore > 0;
    const isHighlighted = row.highlighted;

    if (isSelected) tr.classList.add('selected');
    if (isTopPerformer) tr.classList.add('top-performer');
    if (isHighlighted) tr.classList.add('highlighted');

    if (isTopPerformer) {
      tr.setAttribute('aria-label', `Top performer: ${row.model}`);
    }

    // Row data
    const cells = [
      row.model,
      row.overall_score.toFixed(1),
      row.date,
      (row.design || 0).toFixed(1),
      (row.architecture || 0).toFixed(1),
      (row.code_quality || 0).toFixed(1)
    ];

    cells.forEach(cellData => {
      const td = document.createElement('td');
      td.textContent = cellData;
      td.setAttribute('role', 'gridcell');
      tr.appendChild(td);
    });

    // Click handler
    tr.addEventListener('click', () => {
      store.dispatch({
        type: 'SELECT_MODEL',
        payload: row
      });
    });

    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tr.click();
      }
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableContainer.innerHTML = '';
  tableContainer.appendChild(table);
}

function renderNotifications() {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const state = store.getState();
  
  // Clear and re-render notifications
  container.innerHTML = '';
  
  state.notifications.forEach(notification => {
    const el = createNotification({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      onDismiss: () => {
        store.dispatch({
          type: 'DISMISS_NOTIFICATION',
          payload: notification.id
        });
      },
      autoDismiss: true,
      autoDismissDelay: 5000
    });
    container.appendChild(el);
  });
}

// ==================== Main Render ====================
function render() {
  renderThemeProvider();
  renderPhilosophyExplorer();
  renderWorkflow();
  renderLeaderboard();
  renderNotifications();
}

// ==================== Initialization ====================
async function init() {
  console.log('Gironimo initializing...');

  // Subscribe to store updates
  store.subscribe(() => {
    render();
  });

  // Initial render
  render();

  // Initialize mascot
  initMascot();

  // Fetch leaderboard data
  const data = await fetchLeaderboardCSV();
  
  if (data.length > 0) {
    store.dispatch({
      type: 'SET_LEADERBOARD_DATA',
      payload: data
    });
  }

  console.log('Gironimo initialized');
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
