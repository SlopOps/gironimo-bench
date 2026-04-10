/**
 * GIRONIMO CORE ARCHITECTURE
 * Single Store, Reducer-based, Atomic Render, Strict Isolation
 */

// --- 1. Centralized Store ---
const DEFAULT_STATE = {
  theme: 'light',
  selectedPhilosophyStatements: [],
  selectedModel: null,
  workflowState: { currentStage: 'Spec' },
  leaderboardData: [],
  notification: null
};

class Store {
  constructor(initialState) {
    this.state = this.loadState() || initialState;
    this.subscribers = [];
    this.listeners = {};
  }

  loadState() {
    try {
      const saved = localStorage.getItem('gironimo_state');
      return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : null;
    } catch { return null; }
  }

  saveState() {
    try {
      localStorage.setItem('gironimo_state', JSON.stringify(this.state));
    } catch { /* fail gracefully */ }
  }

  getState() { return this.state; }

  subscribe(fn) { this.subscribers.push(fn); return () => this.subscribers.filter(s => s !== fn); }

  dispatch(action) {
    const newState = this.reduce(this.state, action);
    if (newState === this.state) return;
    this.state = newState;
    this.saveState();
    this.notify(action);
    scheduleRender();
  }

  reduce(state, action) {
    switch (action.type) {
      case 'SET_THEME': return { ...state, theme: action.payload };
      case 'TOGGLE_PHILOSOPHY': {
        const idx = state.selectedPhilosophyStatements.indexOf(action.payload);
        const next = idx >= 0 ? state.selectedPhilosophyStatements.filter(s => s !== action.payload) : [...state.selectedPhilosophyStatements, action.payload];
        return { ...state, selectedPhilosophyStatements: next };
      }
      case 'SELECT_MODEL': return { ...state, selectedModel: action.payload };
      case 'SET_LEADERBOARD': return { ...state, leaderboardData: action.payload };
      case 'SET_WORKFLOW_STAGE': return { ...state, workflowState: { ...state.workflowState, currentStage: action.payload } };
      case 'SHOW_NOTIFICATION': return { ...state, notification: action.payload };
      default: return state;
    }
  }

  notify(action) {
    this.subscribers.forEach(fn => fn(action, this.state));
  }
}

// --- 2. Atomic Render Pipeline ---
let isRendering = false;
function scheduleRender() {
  if (!isRendering) {
    isRendering = true;
    requestAnimationFrame(() => {
      render(store.getState());
      isRendering = false;
    });
  }
}

// --- 3. Data & Utilities ---
const PHILOSOPHY_STATEMENTS = [
  { cat: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
  { cat: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
  { cat: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
  { cat: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
  { cat: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
  { cat: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
  { cat: 'Technical', text: 'Own your infrastructure. Own your data' }
];

const WORKFLOW_STAGES = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const required = ['model', 'overall_score'];
  if (!required.every(r => headers.includes(r))) return [];

  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    if (vals.length !== headers.length) return null;
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (vals[i] === '' || isNaN(Number(vals[i]))) ? vals[i] : Number(vals[i]); });
    return obj;
  }).filter(Boolean);
}

async function loadLeaderboard() {
  try {
    const res = await fetch('/results/leaderboard.csv');
    if (!res.ok) throw new Error('Network error');
    const text = await res.text();
    const data = parseCSV(text);
    store.dispatch({ type: 'SET_LEADERBOARD', payload: data });
  } catch (err) {
    console.warn('Failed to load CSV:', err.message);
    store.dispatch({ type: 'SET_LEADERBOARD', payload: [] });
  }
}

// --- 4. Mascot Behavior Tree ---
const mascotTree = (state) => {
  const { theme, selectedModel, selectedPhilosophyStatements, workflowState } = state;
  if (theme !== 'light') return { cls: 'mascot-theme-change', label: 'Theme Shift' };
  if (selectedPhilosophyStatements.length > 0) return { cls: 'mascot-philosophy', label: 'Philosophy Focus' };
  if (selectedModel) return { cls: '', label: 'Leaderboard Orient', tx: `translateX(${Math.min(30, Math.max(-30, (selectedModel.overall_score - 80) * 3))}px)` };
  return { cls: 'mascot-idle', label: 'Idle' };
};

// --- 5. Render Function (Strictly Computed) ---
function render(state) {
  document.documentElement.setAttribute('data-theme', state.theme);
  
  // Philosophy
  renderPhilosophy(state);
  renderWorkflow(state);
  renderLeaderboard(state);
  renderMascot(state);
  renderNotifications(state);
}

function renderPhilosophy(state) {
  const list = document.getElementById('philosophy-list');
  list.innerHTML = '';
  PHILOSOPHY_STATEMENTS.forEach(p => {
    const isSelected = state.selectedPhilosophyStatements.includes(p.text);
    const el = document.createElement('div');
    el.className = 'philosophy-item';
    el.setAttribute('role', 'checkbox');
    el.setAttribute('aria-checked', isSelected);
    el.setAttribute('tabindex', '0');
    el.setAttribute('data-text', p.text);
    el.innerHTML = `<strong class="tag" style="color:var(--primary);font-size:0.75rem">${p.cat}</strong> <span>${p.text}</span>`;
    el.addEventListener('click', () => store.dispatch({ type: 'TOGGLE_PHILOSOPHY', payload: p.text }));
    el.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' ') { e.preventDefault(); el.click(); }});
    list.appendChild(el);
  });
}

function renderWorkflow(state) {
  const container = document.getElementById('workflow-stages');
  container.innerHTML = '';
  const score = state.selectedModel?.overall_score ?? 0;
  const maxStageIdx = score >= 90 ? 6 : score >= 70 ? 4 : 2;
  
  WORKFLOW_STAGES.forEach((stage, idx) => {
    const isLocked = idx > maxStageIdx;
    const isActive = idx <= state.workflowState.stageIdx || (idx === 0 && !state.workflowState.stageIdx);
    const isCompleted = idx < (state.workflowState.stageIdx || 0);
    const isCurrent = stage === state.workflowState.currentStage;
    
    const btn = document.createElement('button');
    btn.className = `stage-btn ${isLocked ? 'locked' : ''} ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
    btn.textContent = stage;
    btn.disabled = isLocked;
    btn.setAttribute('aria-label', `${stage} stage`);
    btn.addEventListener('click', () => {
      store.dispatch({ type: 'SET_WORKFLOW_STAGE', payload: { currentStage: stage, stageIdx: idx } });
      openModal(stage, state);
    });
    container.appendChild(btn);
  });
}

function renderLeaderboard(state) {
  const table = document.getElementById('leaderboard-table');
  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  const data = state.leaderboardData || [];
  
  if (!data.length) {
    thead.innerHTML = ''; tbody.innerHTML = '<tr><td colspan="5" class="empty">Loading or empty dataset.</td></tr>';
    return;
  }

  if (!thead.children.length) {
    const keys = ['model', 'overall_score', 'date'];
    thead.innerHTML = `<tr>${keys.map(k => `<th scope="col"><button class="btn-sm" data-sort="${k}">${k.replace('_',' ')}</button></th>`).join('')}</tr>`;
  }

  // Derive sort from active sort button state
  const activeSort = document.querySelector('.sort-btn[aria-pressed="true"]')?.dataset.sort || 'overall_score';
  const sorted = [...data].sort((a, b) => {
    if (activeSort === 'date') return new Date(b.date) - new Date(a.date);
    if (activeSort === 'model') return a.model.localeCompare(b.model);
    return (b.overall_score || 0) - (a.overall_score || 0);
  });

  tbody.innerHTML = '';
  sorted.forEach((m, i) => {
    const isSelected = state.selectedModel?.model === m.model;
    const tr = document.createElement('tr');
    tr.className = isSelected ? 'selected' : '';
    
    // Philosophy Highlighting
    const cats = state.selectedPhilosophyStatements.length ? state.selectedPhilosophyStatements : [];
    if (cats.some(c => c.includes('Practical')) && ((m.code_quality||0)+(m.feature_complete||0) >= 8)) tr.classList.add('highlight-philosophy');
    else if (cats.some(c => c.includes('Philosophical')) && (m.architecture||0) >= 8) tr.classList.add('highlight-philosophy');
    else if (cats.some(c => c.includes('Technical')) && (m.best_practices||0) >= 8) tr.classList.add('highlight-philosophy');
    
    if (i === 0 && !isSelected) tr.style.fontWeight = 'bold'; // Top performer emphasis
    
    tr.innerHTML = `<td>${m.model}</td><td>${m.overall_score ?? 0}</td><td>${m.date || '-'}</td>`;
    tr.setAttribute('tabindex', '0');
    tr.addEventListener('click', () => {
      store.dispatch({ type: 'SELECT_MODEL', payload: m });
      store.dispatch({ type: 'SHOW_NOTIFICATION', payload: `Selected: ${m.model}` });
    });
    tbody.appendChild(tr);
  });
}

function renderMascot(state) {
  const container = document.getElementById('mascot-stage');
  if (!container.firstChild) {
    container.innerHTML = `
      <svg id="mascot-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M30,80 Q30,50 40,40 L45,25 Q40,15 50,15 T55,25 L50,40 Q60,50 60,80 Z" fill="var(--primary)" class="giraffe-body"/>
        <circle cx="48" cy="28" r="2" fill="var(--bg)"/>
        <rect x="35" y="45" width="15" height="30" rx="4" fill="var(--bg)"/>
        <path d="M25,95 L35,80 M55,95 L45,80 M30,100 L35,80 M50,100 L45,80" stroke="var(--text)" stroke-width="2"/>
      </svg>`;
  }
  const behavior = mascotTree(state);
  const svg = document.getElementById('mascot-svg');
  svg.setAttribute('class', behavior.cls);
  svg.style.transform = behavior.tx || '';
  document.documentElement.setAttribute('data-theme', state.theme);
}

function renderNotifications(state) {
  const tray = document.getElementById('notification-tray');
  if (state.notification) {
    tray.innerHTML = `<div class="notification">${state.notification}</div>`;
    setTimeout(() => store.dispatch({ type: 'SHOW_NOTIFICATION', payload: null }), 3000);
  } else {
    tray.innerHTML = '';
  }
}

// --- 6. Modal System (Props-driven, Isolated) ---
function openModal(stage, state) {
  const overlay = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  overlay.classList.remove('hidden');
  title.textContent = `${stage} Details`;
  
  const m = state.selectedModel || {};
  const philoContext = state.selectedPhilosophyStatements.length > 0 
    ? `Active philosophies guide this phase.` 
    : `No philosophies selected.`;
    
  body.innerHTML = `
    <div class="card" style="padding:0.5rem; background:var(--bg); border:1px solid var(--border); margin-bottom:1rem; border-radius:var(--radius)">
      <strong>Model:</strong> ${m.model || 'None selected'}<br>
      <strong>Score:</strong> ${m.overall_score || '-'}
    </div>
    <p>${philoContext}</p>
  `;
  
  const closeBtn = document.getElementById('modal-close');
  closeBtn.focus();
  
  const trapFocus = (e) => { if(e.key==='Escape') closeModal(); };
  overlay.onkeydown = trapFocus;
  closeBtn.onclick = closeModal;
  overlay.onclick = (e) => { if(e.target === overlay) closeModal(); };
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

// --- 7. Event Wiring & Init ---
function init() {
  loadLeaderboard();
  
  // Theme
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    store.dispatch({ type: 'SET_THEME', payload: current === 'light' ? 'dark' : 'light' });
  });

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.sort-btn').forEach(b => b.setAttribute('aria-pressed', 'false'));
      e.target.setAttribute('aria-pressed', 'true');
      scheduleRender();
    });
  });

  // Filter buttons
  document.querySelectorAll('.category-filters button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;
      document.querySelectorAll('.category-filters button').forEach(b => b.setAttribute('aria-pressed', 'false'));
      e.target.setAttribute('aria-pressed', 'true');
      
      const items = document.querySelectorAll('.philosophy-item');
      items.forEach(item => {
        const cat = item.querySelector('.tag').textContent;
        item.style.display = (filter === 'all' || cat === filter) ? 'flex' : 'none';
      });
    });
  });

  // Initial render
  render(store.getState());
}

const store = new Store(DEFAULT_STATE);
window.addEventListener('DOMContentLoaded', init);
