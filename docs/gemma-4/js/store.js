/**
 * CENTRALIZED STORE
 * Implements Reducer-based updates and Subscription-based UI updates.
 */
class Store {
    constructor(reducer, initialState) {
        this.reducer = reducer;
        this.state = this._safeLoad(initialState);
        this.subscribers = [];
    }

    _safeLoad(initialState) {
        try {
            const saved = localStorage.getItem('gironimo_state');
            return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
        } catch (e) {
            console.error("State corruption detected. Resetting to default.", e);
            return initialState;
        }
    }

    getState() {
        return this.state;
    }

    dispatch(action) {
        // All updates resolve into a single state change
        const nextState = this.reducer(this.state, action);
        
        // Only update if state actually changed (shallow compare)
        if (JSON.stringify(nextState) !== JSON.stringify(this.state)) {
            this.state = nextState;
            this._persist();
            this._notify();
        }
    }

    _persist() {
        try {
            localStorage.setItem('gironimo_state', JSON.stringify(this.state));
        } catch (e) {
            console.error("Persistence failed", e);
        }
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        // Initial trigger to sync UI
        callback(this.state);
    }

    _notify() {
        // Atomic Update Rule: Single render pass via subscribers
        this.subscribers.forEach(callback => callback(this.state));
    }
}

// Reducer Implementation
const initialState = {
    theme: 'light',
    selectedPhilosophyStatements: [], // Array of {id, category, text}
    selectedModel: null, // model name string
    workflowState: 'idle', // idle | active | completed
    leaderboardData: [],
    notifications: []
};

function rootReducer(state, action) {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        
        case 'TOGGLE_PHILOSOPHY':
            const id = action.payload;
            const exists = state.selectedPhilosophyStatements.find(p => p.id === id);
            const nextPhilosophies = exists 
                ? state.selectedPhilosophyStatements.filter(p => p.id !== id)
                : [...state.selectedPhilosophyStatements, action.payload];
            return { ...state, selectedPhilosophyStatements: nextPhilosophies };

        case 'SET_LEADERBOARD':
            return { ...state, leaderboardData: action.payload };

        case 'SELECT_MODEL':
            const model = state.leaderboardData.find(m => m.model === action.payload);
            return { ...state, selectedModel: model || null };

        case 'SET_WORKFLOW_STATE':
            return { ...state, workflowState: action.payload };

        case 'ADD_NOTIFICATION':
            return { ...state, notifications: [...state.notifications, action.payload] };

        case 'CLEAR_NOTIFICATIONS':
            return { ...state, notifications: [] };

        default:
            return state;
    }
}

// Global instance
const store = new Store(rootReducer, initialState);
