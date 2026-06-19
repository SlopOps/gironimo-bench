// store.js
// Single Centralized Store Implementation

const GironimoStore = (function() {
    const initialState = {
        theme: 'light',
        selectedPhilosophyStatements: [],
        selectedModel: null,
        workflowState: { hoverStage: null },
        leaderboardData: [],
        leaderboardStatus: 'idle', // idle, loading, success, error
        modalState: { isOpen: false, type: null, payload: null },
        notification: { visible: false, message: '' },
        sortConfig: { key: 'overall_score', direction: 'desc' },
        philosophyFilter: 'all'
    };

    function loadState() {
        try {
            const serialized = localStorage.getItem('gironimoState');
            if (serialized) {
                const parsed = JSON.parse(serialized);
                return {
                    ...initialState,
                    ...parsed,
                    // Don't persist transient states
                    leaderboardStatus: 'idle',
                    modalState: { isOpen: false, type: null, payload: null },
                    notification: { visible: false, message: '' }
                };
            }
        } catch (e) {
            console.error("State load failed (corrupted localStorage):", e);
            return initialState;
        }
        return initialState;
    }

    function saveState(state) {
        try {
            const toSave = {
                theme: state.theme,
                selectedPhilosophyStatements: state.selectedPhilosophyStatements,
                selectedModel: state.selectedModel,
                workflowState: state.workflowState,
                sortConfig: state.sortConfig,
                philosophyFilter: state.philosophyFilter
            };
            localStorage.setItem('gironimoState', JSON.stringify(toSave));
        } catch (e) {
            console.error("State save failed:", e);
        }
    }

    function reducer(state, action) {
        switch (action.type) {
            case 'INIT':
                return state;
            
            case 'SET_THEME':
                return { ...state, theme: action.payload };
            
            case 'TOGGLE_PHILOSOPHY':
                const exists = state.selectedPhilosophyStatements.includes(action.payload);
                return {
                    ...state,
                    selectedPhilosophyStatements: exists 
                        ? state.selectedPhilosophyStatements.filter(s => s !== action.payload)
                        : [...state.selectedPhilosophyStatements, action.payload]
                };
            
            case 'SET_PHILOSOPHY_FILTER':
                return { ...state, philosophyFilter: action.payload };
            
            case 'SELECT_MODEL':
                return { 
                    ...state, 
                    selectedModel: action.payload,
                    notification: { visible: true, message: `Model ${action.payload.model} selected` }
                };
            
            case 'SET_WORKFLOW_HOVER':
                return { ...state, workflowState: { ...state.workflowState, hoverStage: action.payload } };
            
            case 'LOAD_CSV_SUCCESS':
                return { ...state, leaderboardData: action.payload, leaderboardStatus: 'success' };
            
            case 'LOAD_CSV_FAIL':
                return { ...state, leaderboardData: [], leaderboardStatus: 'error' };
            
            case 'OPEN_MODAL':
                return { ...state, modalState: { isOpen: true, type: action.payload.type, payload: action.payload.data } };
            
            case 'CLOSE_MODAL':
                return { ...state, modalState: { isOpen: false, type: null, payload: null } };
            
            case 'SHOW_NOTIFICATION':
                return { ...state, notification: { visible: true, message: action.payload } };
            
            case 'HIDE_NOTIFICATION':
                return { ...state, notification: { visible: false, message: '' } };
            
            case 'SET_SORT':
                return { ...state, sortConfig: action.payload };
            
            default:
                return state;
        }
    }

    let state = loadState();
    const listeners = [];

    return {
        getState: () => state,
        dispatch: (action) => {
            state = reducer(state, action);
            saveState(state);
            listeners.forEach(l => l());
        },
        subscribe: (listener) => {
            listeners.push(listener);
            return () => listeners.filter(l => l !== listener);
        }
    };
})();
