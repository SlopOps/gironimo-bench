/**
 * Gironimo — Leaderboard (CSV-driven)
 */

const Leaderboard = (() => {
  const CSV_URL = '/results/leaderboard.csv';

  const METRIC_KEYS = [
    'speed','one_shot_attempts','design','architecture','code_quality',
    'feature_complete','performance','accessibility','best_practices','value','overall_score'
  ];

  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      if (vals.length < headers.length) continue;
      const row = {};
      let valid = true;
      headers.forEach((h, idx) => {
        if (h === 'model') {
          row[h] = vals[idx] || '';
          if (!row[h]) valid = false;
        } else if (h === 'date' || h === 'video_url' || h === 'result_url') {
          row[h] = vals[idx] || '';
        } else {
          const n = parseFloat(vals[idx]);
          row[h] = isNaN(n) ? 0 : n;
        }
      });
      if (valid && row.model) rows.push(row);
    }
    return rows;
  }

  async function fetchData() {
    AppStore.dispatch({ type: 'SET_LEADERBOARD_LOADING', payload: true });
    try {
      const resp = await fetch(CSV_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const data = parseCSV(text);
      if (data.length === 0) throw new Error('No valid data rows');
      AppStore.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: data });
    } catch (err) {
      AppStore.dispatch({ type: 'SET_LEADERBOARD_ERROR', payload: err.message });
    }
  }

  function getScoreClass(score) {
    if (score >= 8) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  function getSortArrow(col, state) {
    if (state.sortColumn !== col) return '';
    return state.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  function getSortedData(state) {
    if (!state.leaderboardData) return [];
    const data = [...state.leaderboardData];
    const col = state.sortColumn;
    const dir = state.sortDirection === 'asc' ? 1 : -1;
    data.sort((a, b) => {
      if (col === 'model') return dir * a.model.localeCompare(b.model);
      if (col === 'date') return dir * (a.date || '').localeCompare(b.date || '');
      return dir * ((a[col] || 0) - (b[col] || 0));
    });
    return data;
  }

  function render() {
    const state = AppStore.getState();
    const wrapper = document.createElement('div');
    wrapper.id = 'leaderboard-panel';

    // Title
    const title = document.createElement('h2');
    title.className = 'panel-title';
    title.textContent = 'Leaderboard';
    wrapper.appendChild(title);

    // Sort controls
    const controls = document.createElement('div');
    controls.className = 'leaderboard-controls';
    const sortOptions = [
      { col: 'overall_score', label: 'Score' },
      { col: 'date', label: 'Date' },
      { col: 'model', label: 'A-Z' },
    ];
    sortOptions.forEach(opt => {
      const btn = Components.Button({
        text: opt.label,
        size: 'sm',
        variant: state.sortColumn === opt.col ? 'active' : '',
        onClick: () => {
          const st = AppStore.getState();
          const dir = (st.sortColumn === opt.col && st.sortDirection === 'desc') ? 'asc' : 'desc';
          AppStore.dispatch({ type: 'SET_SORT', payload: { column: opt.col, direction: dir } });
        },
      });
      controls.appendChild(btn);
    });
    wrapper.appendChild(controls);

    // Content
    if (state.leaderboardLoading) {
      const skel = document.createElement('div');
      for (let i = 0; i < 5; i++) {
        const line = document.createElement('div');
        line.className = 'skeleton skeleton-line';
        skel.appendChild(line);
      }
      wrapper.appendChild(skel);
      return wrapper;
    }

    if (state.leaderboardError) {
      const err = document.createElement('div');
      err.className = 'leaderboard-error';
      err.innerHTML = `<strong>Failed to load leaderboard</strong><br>${Components.escHtml(state.leaderboardError)}<br><br>`;
      const retryBtn = Components.Button({ text: 'Retry', variant: 'primary', size: 'sm', onClick: fetchData });
      err.appendChild(retryBtn);
      wrapper.appendChild(err);
      return wrapper;
    }

    if (!state.leaderboardData || state.leaderboardData.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'leaderboard-empty';
      empty.textContent = 'No models found.';
      wrapper.appendChild(empty);
      return wrapper;
    }

    const sorted = getSortedData(state);
    const topScore = sorted.length > 0 ? sorted[0].overall_score : 0;

    // Table
    const tableWrap = document.createElement('div');
    tableWrap.className = 'leaderboard-table-wrapper';
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    table.setAttribute('role', 'grid');

    // Thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const cols = [
      { key: 'rank', label: '#' },
      { key: 'model', label: 'Model' },
      { key: 'overall_score', label: 'Score' },
      { key: 'date', label: 'Date' },
    ];
    cols.forEach(c => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = c.label;
      if (c.key !== 'rank') {
        th.classList.add('sorted');
        th.innerHTML += `<span class="sort-arrow">${getSortArrow(c.key, state)}</span>`;
      }
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Tbody
    const tbody = document.createElement('tbody');
    sorted.forEach((model, idx) => {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');
      tr.setAttribute('tabindex', '0');
      const isSelected = state.selectedModel && state.selectedModel.model === model.model;
      const isTop = idx === 0 && topScore > 0;
      if (isSelected) tr.classList.add('selected');
      if (isTop) tr.classList.add('top-performer');

      // Rank
      const tdRank = document.createElement('td');
      tdRank.className = 'leaderboard-rank';
      tdRank.textContent = idx + 1;
      tr.appendChild(tdRank);

      // Name
      const tdName = document.createElement('td');
      tdName.className = 'leaderboard-model-name';
      tdName.textContent = model.model;
      tr.appendChild(tdName);

      // Score
      const tdScore = document.createElement('td');
      tdScore.className = `leaderboard-score ${getScoreClass(model.overall_score)}`;
      tdScore.textContent = model.overall_score.toFixed(1);
      tr.appendChild(tdScore);

      // Date
      const tdDate = document.createElement('td');
      tdDate.textContent = model.date || '—';
      tr.appendChild(tdDate);

      // Click handler
      const selectModel = () => {
        const current = AppStore.getState().selectedModel;
        if (current && current.model === model.model) {
          AppStore.dispatch({ type: 'SET_SELECTED_MODEL', payload: null });
        } else {
          AppStore.dispatch({ type: 'SET_SELECTED_MODEL', payload: model });
          Components.showNotification('Model Selected', `${model.model} — Score: ${model.overall_score.toFixed(1)}`);
        }
      };
      tr.addEventListener('click', selectModel);
      tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectModel(); } });

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tableWrap.appendChild(table);
    wrapper.appendChild(tableWrap);

    return wrapper;
  }

  return { fetchData, render, parseCSV };
})();
