// Centralized Store Implementation
const GironimoStore = (function() {
    'use strict';
    
    // Initial state
    const initialState = {
        theme: 'light',
        selectedPhilosophyStatements: [],
        selectedModel: null,
        workflowState: {
            currentStage: 'Spec',
            stages: ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'],
            progress: 0
        },
        leaderboardData: [],
        notifications: []
    };
    
    let state = { ...initialState };
    let subscribers = [];
    let isUpdating = false;
    let updateQueue = [];
    
    // Load persisted state
    function loadPersistedState() {
        try {
            const persisted = localStorage.getItem('gironimo-state');
            if (persisted) {
                const parsed = JSON.parse(persisted);
                // Merge with initial state to handle missing fields
                state = {
                    ...initialState,
                    ...parsed,
                    // Ensure these are always properly initialized
                    selectedPhilosophyStatements: Array.isArray(parsed.selectedPhilosophyStatements) 
                        ? parsed.selectedPhilosophyStatements 
                        : [],
                    leaderboardData: Array.isArray(parsed.leaderboardData) 
                        ? parsed.leaderboardData 
                        : [],
                    notifications: []
                };
            }
        } catch (error) {
            console.warn('Failed to load persisted state, using initial state:', error);
            state = { ...initialState };
        }
    }
    
    // Persist state
    function persistState() {
        try {
            const toPersist = {
                theme: state.theme,
                selectedPhilosophyStatements: state.selectedPhilosophyStatements,
                selectedModel: state.selectedModel,
                workflowState: state.workflowState
                // Don't persist leaderboard data - fetch fresh
            };
            localStorage.setItem('gironimo-state', JSON.stringify(toPersist));
        } catch (error) {
            console.warn('Failed to persist state:', error);
        }
    }
    
    // Reducer function
    function reducer(currentState, action) {
        switch (action.type) {
            case 'SET_THEME':
                return { ...currentState, theme: action.payload };
                
            case 'TOGGLE_PHILOSOPHY_STATEMENT':
                const statements = [...currentState.selectedPhilosophyStatements];
                const index = statements.indexOf(action.payload);
                if (index > -1) {
                    statements.splice(index, 1);
                } else {
                    statements.push(action.payload);
                }
                return { ...currentState, selectedPhilosophyStatements: statements };
                
            case 'SELECT_MODEL':
                return { ...currentState, selectedModel: action.payload };
                
            case 'SET_WORKFLOW_STATE':
                return { 
                    ...currentState, 
                    workflowState: { ...currentState.workflowState, ...action.payload }
                };
                
            case 'SET_LEADERBOARD_DATA':
                return { ...currentState, leaderboardData: action.payload };
                
            case 'ADD_NOTIFICATION':
                const notification = {
                    id: Date.now(),
                    message: action.payload.message,
                    type: action.payload.type || 'info',
                    timestamp: new Date().toISOString()
                };
                return { 
                    ...currentState, 
                    notifications: [...currentState.notifications, notification]
                };
                
            case 'REMOVE_NOTIFICATION':
                return {
                    ...currentState,
                    notifications: currentState.notifications.filter(n => n.id !== action.payload)
                };
                
            default:
                return currentState;
        }
    }
    
    // Dispatch action
    function dispatch(action) {
        if (isUpdating) {
            updateQueue.push(action);
            return;
        }
        
        isUpdating = true;
        
        try {
            const newState = reducer(state, action);
            
            if (newState !== state) {
                state = newState;
                persistState();
                
                // Notify subscribers
                subscribers.forEach(callback => {
                    try {
                        callback(state, action);
                    } catch (error) {
                        console.error('Subscriber error:', error);
                    }
                });
            }
        } catch (error) {
            console.error('Dispatch error:', error);
            // Recover by using current state
        } finally {
            isUpdating = false;
            
            // Process queued updates
            if (updateQueue.length > 0) {
                const nextAction = updateQueue.shift();
                dispatch(nextAction);
            }
        }
    }
    
    // Subscribe to state changes
    function subscribe(callback) {
        subscribers.push(callback);
        
        // Return unsubscribe function
        return function unsubscribe() {
            const index = subscribers.indexOf(callback);
            if (index > -1) {
                subscribers.splice(index, 1);
            }
        };
    }
    
    // Get current state (read-only copy)
    function getState() {
        return { ...state };
    }
    
    // Initialize store
    loadPersistedState();
    
    // Public API
    return {
        dispatch,
        subscribe,
        getState,
        initialState: { ...initialState }
    };
})();
