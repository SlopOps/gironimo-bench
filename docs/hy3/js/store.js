// Centralized State Store (Single Source of Truth)
const Store = (() => {
  // Default State (Required Fields + Optional UI State)
  const defaultState = {
    // Required Fields
    theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    selectedPhilosophyStatements: [],
    selectedModel: null,
    workflowState: {
      hoveredStage: null,
      selectedStage: null
    },
    leaderboardData: null,

    // Optional UI State (Persisted)
    notifications: [],
    philosophyFilterCategory: 'All',
    leaderboardSort: { field: 'overall_score', direction: 'desc' }
  };

  // Load Persisted State from localStorage
  const loadPersistedState = () => {
    try {
      const persisted = localStorage.getItem('gironimo-store');
      if (!persisted) return { ...defaultState };
      
      const parsed = JSON.parse(persisted);
      return {
        ...defaultState,
        ...parsed,
        // Never persist leaderboard data (fetched at runtime)
        leaderboardData: null,
        // Ensure workflowState structure is intact
        workflowState: {
          ...defaultState.workflowState,
          ...(parsed.workflowState || {})
        }
      };
    } catch (e) {
      console.warn('Corrupted localStorage state, resetting to default:', e);
      localStorage.removeItem('gironimo-store');
      return { ...defaultState };
    }
  };

  // Persist State to localStorage (Exclude Runtime Data)
  const persistState = (state) => {
    try {
      const toPersist = {
        theme: state.theme,
        selectedPhilosophyStatements: state.selectedPhilosophyStatements,
        selectedModel: state.selectedModel,
        workflowState: state.workflowState,
        philosophyFilterCategory: state.philosophyFilterCategory,
        leaderboardSort: state.leaderboardSort
      };
      localStorage.setItem('gironimo-store', JSON.stringify(toPersist));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
  };

  // Reducer: Handle All State Updates
  const reducer = (state, action) => {
    switch (action.type) {
      // Required Field Updates
      case 'SET_THEME':
        return { ...state, theme: action.payload };
      
      case 'TOGGLE_PHILOSOPHY_STATEMENT':
        const stmt = action.payload;
        const current = state.selectedPhilosophyStatements;
        const exists = current.includes(stmt);
        return {
          ...state,
          selectedPhilosophyStatements: exists
            ? current.filter(s => s !== stmt)
            : [...current, stmt]
        };
      
      case 'SET_SELECTED_MODEL':
        return { ...state, selectedModel: action.payload };
      
      case 'SET_WORKFLOW_HOVER':
        return {
          ...state,
          workflowState: { ...state.workflowState, hoveredStage: action.payload }
        };
      
      case 'SET_WORKFLOW_SELECTED_STAGE':
        return {
          ...state,
          workflowState: { ...state.workflowState, selectedStage: action.payload }
        };
      
      case 'SET_LEADERBOARD_DATA':
        return { ...state, leaderboardData: action.payload };

      // Optional UI State Updates
      case 'ADD_NOTIFICATION':
        return {
          ...state,
          notifications: [...state.notifications, { id: Date.now(), ...action.payload }]
        };
      
      case 'REMOVE_NOTIFICATION':
        return {
          ...state,
          notifications: state.notifications.filter(n => n.id !== action.payload)
        };
      
      case 'SET_PHILOSOPHY_FILTER_CATEGORY':
        return { ...state, philosophyFilterCategory: action.payload };
      
      case 'SET_LEADERBOARD_SORT':
        return { ...state, leaderboardSort: action.payload };

      default:
        return state;
    }
  };

  // Initialize State
  let state = loadPersistedState();
  let subscribers = [];
  let pendingNotify = false;

  // Dispatch Action (Batched via requestAnimationFrame for Atomic Updates)
  const dispatch = (action) => {
    state = reducer(state, action);
    persistState(state);

    if (!pendingNotify) {
      pendingNotify = true;
      requestAnimationFrame(() => {
        pendingNotify = false;
        subscribers.forEach(callback => callback(state));
      });
    }
  };

  // Get Current State (Immutable Copy)
  const getState = () => ({ ...state });

  // Subscribe to State Updates (Returns Unsubscribe Function)
  const subscribe = (callback) => {
    subscribers.push(callback);
    return () => {
      subscribers = subscribers.filter(cb => cb !== callback);
    };
  };

  // Apply Initial Theme
  document.documentElement.setAttribute('data-theme', state.theme);

  return { dispatch, getState, subscribe };
})();

// Expose Globally (Module Pattern for Simplicity)
window.Store = Store;
