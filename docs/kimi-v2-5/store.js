// /docs/gironimo/js/store.js

const Store = (function() {
    // Initial state
    const initialState = {
        theme: localStorage.getItem('gironimo-theme') || 'dark',
        selectedPhilosophyStatements: JSON.parse(localStorage.getItem('gironimo-philosophy') || '[]'),
        selectedModel: null,
        workflowState: {
            stages: ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'],
            currentStage: -1,
            reachedStage: -1
        },
        leaderboardData: [],
        leaderboardSort: 'overall_score',
        leaderboardLoading: false,
        leaderboardError: null,
        notification: null
    };

    let state = { ...initialState };
    const listeners = new Set();

    // Actions
    const ACTIONS = {
        SET_THEME: 'SET_THEME',
        TOGGLE_THEME: 'TOGGLE_THEME',
        TOGGLE_PHILOSOPHY_STATEMENT: 'TOGGLE_PHILOSOPHY_STATEMENT',
        SET_PHILOSOPHY_FILTER: 'SET_PHILOSOPHY_FILTER',
        SELECT_MODEL: 'SELECT_MODEL',
        SET_LEADERBOARD_DATA: 'SET_LEADERBOARD_DATA',
        SET_LEADERBOARD_SORT: 'SET_LEADERBOARD_SORT',
        SET_LEADERBOARD_ERROR: 'SET_LEADERBOARD_ERROR',
        SET_WORKFLOW_STAGE: 'SET_WORKFLOW_STAGE',
        SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
        CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
        UPDATE_MASCOT_STATE: 'UPDATE_MASCOT_STATE'
    };

    // Reducer
    function reducer(state, action) {
        switch (action.type) {
            case ACTIONS.SET_THEME:
                return { ...state, theme: action.payload };
            
            case ACTIONS.TOGGLE_THEME:
                const newTheme = state.theme === 'dark' ? 'light' : 'dark';
                localStorage.setItem('gironimo-theme', newTheme);
                return { ...state, theme: newTheme };
            
            case ACTIONS.TOGGLE_PHILOSOPHY_STATEMENT: {
                const statement = action.payload;
                const current = state.selectedPhilosophyStatements;
                const exists = current.find(s => s.statement === statement.statement);
                let updated;
                if (exists) {
                    updated = current.filter(s => s.statement !== statement.statement);
                } else {
                    updated = [...current, statement];
                }
                localStorage.setItem('gironimo-philosophy', JSON.stringify(updated));
                return { ...state, selectedPhilosophyStatements: updated };
            }
            
            case ACTIONS.SET_PHILOSOPHY_FILTER:
                return { ...state, philosophyFilter: action.payload };
            
            case ACTIONS.SELECT_MODEL: {
                const model = action.payload;
                // Calculate workflow progression based on score
                let reachedStage = -1;
                if (model) {
                    const score = parseFloat(model.overall_score) || 0;
                    if (score >= 90) reachedStage = 6; // Full progression
                    else if (score >= 70) reachedStage = 4; // Stops at Implementation
                    else if (score >= 0) reachedStage = 2; // Stops at Architecture
                }
                return {
                    ...state,
                    selectedModel: model,
                    workflowState: {
                        ...state.workflowState,
                        reachedStage,
                        currentStage: reachedStage
                    }
                };
            }
            
            case ACTIONS.SET_LEADERBOARD_DATA:
                return {
                    ...state,
                    leaderboardData: action.payload,
                    leaderboardLoading: false,
                    leaderboardError: null
                };
            
            case ACTIONS.SET_LEADERBOARD_SORT:
                return { ...state, leaderboardSort: action.payload };
            
            case ACTIONS.SET_LEADERBOARD_ERROR:
                return {
                    ...state,
                    leaderboardError: action.payload,
                    leaderboardLoading: false
                };
            
            case ACTIONS.SET_WORKFLOW_STAGE:
                return {
                    ...state,
                    workflowState: {
                        ...state.workflowState,
                        currentStage: action.payload
                    }
                };
            
            case ACTIONS.SHOW_NOTIFICATION:
                return { ...state, notification: action.payload };
            
            case ACTIONS.CLEAR_NOTIFICATION:
                return { ...state, notification: null };
            
            case ACTIONS.UPDATE_MASCOT_STATE:
                return { ...state, mascotState: action.payload };
            
            default:
                return state;
        }
    }

    // Public API
    return {
        ACTIONS,
        
        dispatch(action) {
            const prevState = state;
            state = reducer(state, action);
            
            // Only notify if state actually changed
            if (state !== prevState) {
                listeners.forEach(listener => listener(state, prevState));
            }
        },
        
        subscribe(listener) {
            listeners.add(listener);
            // Immediate call with current state
            listener(state, state);
            return () => listeners.delete(listener);
        },
        
        getState() {
            return { ...state };
        },
        
        // Helper to create bound action creators
        createAction(type, payload) {
            return { type, payload };
        }
    };
})();
