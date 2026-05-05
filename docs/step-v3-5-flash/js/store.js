/**
 * Centralized State Store
 * Single source of truth, reducer-based updates, localStorage persistence
 */

// Initial state with all required fields
const initialState = {
  theme: 'light',
  selectedPhilosophyStatements: [],
  selectedModel: null,
  workflowState: {
    activeStage: null,
    modalOpen: false
  },
  leaderboardData: [],
  notifications: [],
  sortKey: 'overall_score',
  sortDirection: 'desc'
};

// State reducer (pure function, returns new state)
function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'TOGGLE_PHILOSOPHY_SELECTION': {
      const statement = action.payload;
      const isSelected = state.selectedPhilosophyStatements.includes(statement);
      return {
        ...state,
        selectedPhilosophyStatements: isSelected
          ? state.selectedPhilosophyStatements.filter(s => s !== statement)
          : [...state.selectedPhilosophyStatements, statement]
      };
    }

    case 'SELECT_MODEL':
      return {
        ...state,
        selectedModel: action.payload,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'success',
            message: `Selected model: ${action.payload.model}, score: ${action.payload.overall_score}`
          }
        ]
      };

    case 'SET_LEADERBOARD_DATA':
      return { ...state, leaderboardData: action.payload };

    case 'SET_WORKFLOW_STAGE':
      return {
        ...state,
        workflowState: {
          activeStage: action.payload.stage,
          modalOpen: action.payload.modalOpen ?? !state.workflowState.modalOpen
        }
      };

    case 'SET_SORT':
      return {
        ...state,
        sortKey: action.payload.key,
        sortDirection: action.payload.direction
      };

    case 'SHOW_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'FETCH_ERROR':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            type: 'error',
            message: `Error loading leaderboard: ${action.payload}`
          }
        ]
      };

    default:
      return state;
  }
}

// Store implementation
class Store {
  constructor() {
    // Load persisted state safely
    this.state = this.loadPersistedState();
    this.subscribers = [];
  }

  // Load state from localStorage, handle missing/corrupt data
  loadPersistedState() {
    try {
      const persisted = localStorage.getItem('gironimo-state');
      if (!persisted) return initialState;

      const parsed = JSON.parse(persisted);
      // Validate persisted state structure
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        ['theme', 'selectedPhilosophyStatements', 'selectedModel', 'workflowState', 'sortKey', 'sortDirection'].every(key => key in parsed)
      ) {
        return { ...initialState, ...parsed };
      }
      throw new Error('Invalid persisted state structure');
    } catch (error) {
      console.warn('Failed to load persisted state, using initial state:', error);
      return initialState;
    }
  }

  // Save state to localStorage (omit transient data)
  persistState() {
    try {
      const stateToPersist = {
        theme: this.state.theme,
        selectedPhilosophyStatements: this.state.selectedPhilosophyStatements,
        selectedModel: this.state.selectedModel,
        workflowState: this.state.workflowState,
        sortKey: this.state.sortKey,
        sortDirection: this.state.sortDirection
      };
      localStorage.setItem('gironimo-state', JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn('Failed to persist state:', error);
    }
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Dispatch action (atomic update)
  dispatch(action) {
    const prevState = this.state;
    this.state = reducer(prevState, action);

    // Only persist and notify if state actually changed
    if (this.state !== prevState) {
      this.persistState();
      this.notifySubscribers();
    }
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // Notify all subscribers of state change
  notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// Global store instance
const store = new Store();

// Action creators — attached to window for global access (no ES module export)
window.actions = {
  setTheme: (theme) => store.dispatch({ type: 'SET_THEME', payload: theme }),
  togglePhilosophySelection: (statement) => store.dispatch({ type: 'TOGGLE_PHILOSOPHY_SELECTION', payload: statement }),
  selectModel: (model) => store.dispatch({ type: 'SELECT_MODEL', payload: model }),
  setLeaderboardData: (data) => store.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: data }),
  setWorkflowStage: (stage, modalOpen) => store.dispatch({ type: 'SET_WORKFLOW_STAGE', payload: { stage, modalOpen } }),
  setSort: (key, direction) => store.dispatch({ type: 'SET_SORT', payload: { key, direction } }),
  showNotification: (notification) => store.dispatch({ type: 'SHOW_NOTIFICATION', payload: notification }),
  dismissNotification: (id) => store.dispatch({ type: 'DISMISS_NOTIFICATION', payload: id }),
  fetchError: (message) => store.dispatch({ type: 'FETCH_ERROR', payload: message })
};
