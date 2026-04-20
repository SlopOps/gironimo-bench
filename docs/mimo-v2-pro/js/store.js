/**
 * Gironimo — Centralized Store
 * Single source of truth. Reducer-based. Subscription-driven.
 */

const INITIAL_STATE = {
  theme: 'dark',
  selectedPhilosophyStatements: [],
  selectedModel: null,
  workflowState: {
    currentStage: null,
    modalOpen: false,
    hoveredStage: null,
  },
  leaderboardData: null,
  leaderboardLoading: true,
  leaderboardError: null,
  sortColumn: 'overall_score',
  sortDirection: 'desc',
  philosophyFilter: 'All',
  notifications: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'TOGGLE_PHILOSOPHY_STATEMENT': {
      const stmt = action.payload;
      const sel = state.selectedPhilosophyStatements;
      const next = sel.includes(stmt)
        ? sel.filter(s => s !== stmt)
        : [...sel, stmt];
      return { ...state, selectedPhilosophyStatements: next };
    }

    case 'SET_PHILOSOPHY_FILTER':
      return { ...state, philosophyFilter: action.payload };

    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModel: action.payload };

    case 'SET_WORKFLOW_MODAL':
      return {
        ...state,
        workflowState: { ...state.workflowState, modalOpen: action.payload },
      };

    case 'SET_WORKFLOW_STAGE':
      return {
        ...state,
        workflowState: { ...state.workflowState, currentStage: action.payload },
      };

    case 'SET_WORKFLOW_HOVER':
      return {
        ...state,
        workflowState: { ...state.workflowState, hoveredStage: action.payload },
      };

    case 'SET_LEADERBOARD_DATA':
      return {
        ...state,
        leaderboardData: action.payload,
        leaderboardLoading: false,
        leaderboardError: null,
      };

    case 'SET_LEADERBOARD_LOADING':
      return { ...state, leaderboardLoading: action.payload };

    case 'SET_LEADERBOARD_ERROR':
      return {
        ...state,
        leaderboardError: action.payload,
        leaderboardLoading: false,
      };

    case 'SET_SORT':
      return {
        ...state,
        sortColumn: action.payload.column,
        sortDirection: action.payload.direction,
      };

    case 'ADD_NOTIFICATION': {
      const n = {
        id: Date.now() + Math.random(),
        title: action.payload.title,
        body: action.payload.body || '',
        timestamp: Date.now(),
      };
      return { ...state, notifications: [...state.notifications, n] };
    }

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    default:
      return state;
  }
}

function createPersistentStore(initialState, reducerFn) {
  let state = loadState(initialState);
  const subscribers = new Set();
  let renderScheduled = false;

  function loadState(fallback) {
    try {
      const raw = localStorage.getItem('gironimo-state');
      if (!raw) return { ...fallback };
      const saved = JSON.parse(raw);
      return {
        ...fallback,
        theme: saved.theme || fallback.theme,
        selectedPhilosophyStatements: Array.isArray(saved.selectedPhilosophyStatements)
          ? saved.selectedPhilosophyStatements
          : fallback.selectedPhilosophyStatements,
        selectedModel: saved.selectedModel || fallback.selectedModel,
        sortColumn: saved.sortColumn || fallback.sortColumn,
        sortDirection: saved.sortDirection || fallback.sortDirection,
        philosophyFilter: saved.philosophyFilter || fallback.philosophyFilter,
      };
    } catch {
      try { localStorage.removeItem('gironimo-state'); } catch {}
      return { ...fallback };
    }
  }

  function persistState() {
    try {
      const toSave = {
        theme: state.theme,
        selectedPhilosophyStatements: state.selectedPhilosophyStatements,
        selectedModel: state.selectedModel,
        sortColumn: state.sortColumn,
        sortDirection: state.sortDirection,
        philosophyFilter: state.philosophyFilter,
      };
      localStorage.setItem('gironimo-state', JSON.stringify(toSave));
    } catch {}
  }

  function getState() {
    return state;
  }

  function dispatch(action) {
    const prev = state;
    state = reducerFn(state, action);
    persistState();
    if (!renderScheduled) {
      renderScheduled = true;
      queueMicrotask(() => {
        renderScheduled = false;
        subscribers.forEach(fn => {
          try { fn(state, prev, action); } catch (e) { console.error('Subscriber error:', e); }
        });
      });
    }
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  return { getState, dispatch, subscribe };
}

window.AppStore = createPersistentStore(INITIAL_STATE, reducer);
