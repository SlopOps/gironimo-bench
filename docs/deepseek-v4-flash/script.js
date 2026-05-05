// script.js
// Single Centralized Store Implementation

// Action Types
const ACTIONS = {
    SET_THEME: 'SET_THEME',
    TOGGLE_PHILOSOPHY: 'TOGGLE_PHILOSOPHY',
    SET_PHILOSOPHY_FILTER: 'SET_PHILOSOPHY_FILTER',
    SELECT_MODEL: 'SELECT_MODEL',
    SET_LEADERBOARD: 'SET_LEADERBOARD',
    SET_SORT: 'SET_SORT',
    SET_WORKFLOW_STAGE: 'SET_WORKFLOW_STAGE',
    SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
    HIDE_NOTIFICATION: 'HIDE_NOTIFICATION',
    SET_MASCOT_STATE: 'SET_MASCOT_STATE'
};

// Initial State
const initialState = {
    theme: 'light',
    selectedPhilosophyStatements: [],
    philosophyFilter: 'all',
    selectedModel: null,
    leaderboardData: [],
    sortBy: 'overall_score',
    sortDirection: 'desc',
    workflowState: {
        currentStage: 'Spec',
        completedStages: [],
        blockedStages: []
    },
    mascotState: 'idle',
    notifications: []
};

// Store Implementation
class Store {
    constructor(initialState, reducer) {
        this.state = initialState;
        this.reducer = reducer;
        this.subscribers = new Set();
        this.isUpdating = false;
    }

    getState() {
        return this.state;
    }

    dispatch(action) {
        if (this.isUpdating) {
            console.warn('Dispatch during update, queueing...');
            setTimeout(() => this.dispatch(action), 0);
            return;
        }

        this.isUpdating = true;
        const nextState = this.reducer(this.state, action);
        
        if (nextState !== this.state) {
            this.state = nextState;
            this.notify();
        }
        
        this.isUpdating = false;
    }

    subscribe(listener) {
        this.subscribers.add(listener);
        return () => this.subscribers.delete(listener);
    }

    notify() {
        this.subscribers.forEach(listener => listener(this.state));
        this.persistState();
    }

    persistState() {
        try {
            localStorage.setItem('gironimo_state', JSON.stringify({
                theme: this.state.theme,
                selectedPhilosophyStatements: this.state.selectedPhilosophyStatements,
                philosophyFilter: this.state.philosophyFilter,
                selectedModel: this.state.selectedModel,
                sortBy: this.state.sortBy,
                sortDirection: this.state.sortDirection
            }));
        } catch (e) {
            console.error('Failed to persist state:', e);
        }
    }

    loadPersistedState() {
        try {
            const saved = localStorage.getItem('gironimo_state');
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    ...this.state,
                    theme: parsed.theme || this.state.theme,
                    selectedPhilosophyStatements: parsed.selectedPhilosophyStatements || [],
                    philosophyFilter: parsed.philosophyFilter || 'all',
                    selectedModel: parsed.selectedModel || null,
                    sortBy: parsed.sortBy || 'overall_score',
                    sortDirection: parsed.sortDirection || 'desc'
                };
            }
        } catch (e) {
            console.error('Failed to load persisted state:', e);
        }
        return this.state;
    }
}

// Reducer
function rootReducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_THEME:
            return { ...state, theme: action.payload };
        
        case ACTIONS.TOGGLE_PHILOSOPHY: {
            const { statementId, category, text } = action.payload;
            const exists = state.selectedPhilosophyStatements.some(s => s.id === statementId);
            let newSelected;
            
            if (exists) {
                newSelected = state.selectedPhilosophyStatements.filter(s => s.id !== statementId);
            } else {
                newSelected = [...state.selectedPhilosophyStatements, { id: statementId, category, text }];
            }
            
            return { ...state, selectedPhilosophyStatements: newSelected };
        }
        
        case ACTIONS.SET_PHILOSOPHY_FILTER:
            return { ...state, philosophyFilter: action.payload };
        
        case ACTIONS.SELECT_MODEL:
            return { ...state, selectedModel: action.payload };
        
        case ACTIONS.SET_LEADERBOARD:
            return { ...state, leaderboardData: action.payload };
        
        case ACTIONS.SET_SORT: {
            const { sortBy, sortDirection } = action.payload;
            return { ...state, sortBy, sortDirection };
        }
        
        case ACTIONS.SET_WORKFLOW_STAGE: {
            const { completedStages, currentStage, blockedStages } = action.payload;
            return {
                ...state,
                workflowState: { completedStages, currentStage, blockedStages }
            };
        }
        
        case ACTIONS.SHOW_NOTIFICATION: {
            const id = Date.now();
            return {
                ...state,
                notifications: [...state.notifications, { id, message: action.payload.message, type: action.payload.type }]
            };
        }
        
        case ACTIONS.HIDE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            };
        
        case ACTIONS.SET_MASCOT_STATE:
            return { ...state, mascotState: action.payload };
        
        default:
            return state;
    }
}

// Initialize Store
const store = new Store(initialState, rootReducer);
store.state = store.loadPersistedState();

// Philosophy Statements Data
const philosophyStatements = [
    { id: 1, category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { id: 2, category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { id: 3, category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { id: 4, category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { id: 5, category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { id: 6, category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { id: 7, category: 'Technical', text: 'Own your infrastructure. Own your data' }
];

// Workflow Stages
const workflowStages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

// Helper Functions
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : '';
            
            if (header !== 'model' && header !== 'date' && header !== 'video_url' && header !== 'result_url') {
                const num = parseFloat(value);
                row[header] = isNaN(num) ? 0 : num;
            } else {
                row[header] = value;
            }
        });
        
        if (row.model && row.overall_score !== undefined) {
            data.push(row);
        }
    }
    
    return data;
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('/results/leaderboard.csv');
        if (!response.ok) throw new Error('CSV not found');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        store.dispatch({ type: ACTIONS.SET_LEADERBOARD, payload: data });
        
        // Auto-select top performer if no model selected
        if (data.length > 0 && !store.getState().selectedModel) {
            const topModel = [...data].sort((a, b) => b.overall_score - a.overall_score)[0];
            store.dispatch({ type: ACTIONS.SELECT_MODEL, payload: topModel });
            store.dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: { message: `Selected top model: ${topModel.model}`, type: 'info' } });
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        const errorDiv = document.getElementById('leaderboard-error');
        if (errorDiv) {
            errorDiv.textContent = 'Failed to load leaderboard data. Please ensure /results/leaderboard.csv exists.';
            errorDiv.style.display = 'block';
        }
    }
}

function updateWorkflowBasedOnScore(score) {
    let completedStages = [];
    let currentStage = '';
    let blockedStages = [];
    
    if (score >= 90) {
        completedStages = [...workflowStages];
        currentStage = 'ADR';
    } else if (score >= 70) {
        completedStages = workflowStages.slice(0, workflowStages.indexOf('Implementation') + 1);
        currentStage = 'Implementation';
        blockedStages = workflowStages.slice(workflowStages.indexOf('Review'));
    } else {
        completedStages = workflowStages.slice(0, workflowStages.indexOf('Architecture') + 1);
        currentStage = 'Architecture';
        blockedStages = workflowStages.slice(workflowStages.indexOf('Gate', workflowStages.indexOf('Architecture')));
    }
    
    store.dispatch({
        type: ACTIONS.SET_WORKFLOW_STAGE,
        payload: { completedStages, currentStage, blockedStages }
    });
}

function checkPhilosophyHighlights(model) {
    const selected = store.getState().selectedPhilosophyStatements;
    const highlights = [];
    
    for (const statement of selected) {
        if (statement.category === 'Practical' && model.code_quality >= 8 && model.feature_complete >= 8) {
            highlights.push(statement.text);
        } else if (statement.category === 'Philosophical' && model.architecture >= 8) {
            highlights.push(statement.text);
        } else if (statement.category === 'Technical' && model.best_practices >= 8) {
            highlights.push(statement.text);
        }
    }
    
    return highlights;
}

function updateMascotState() {
    const state = store.getState();
    let mascotState = 'idle';
    let message = '';
    
    if (state.selectedPhilosophyStatements.length > 0) {
        mascotState = 'curious';
        message = `I see you're thinking about ${state.selectedPhilosophyStatements.length} philosophical ideas! 🦒`;
    } else if (state.selectedModel) {
        mascotState = 'excited';
        message = `Looking at ${state.selectedModel.model} - fascinating choice! 🦒`;
    }
    
    store.dispatch({ type: ACTIONS.SET_MASCOT_STATE, payload: mascotState });
    
    const messageDiv = document.getElementById('mascot-message');
    if (messageDiv && message) {
        messageDiv.textContent = message;
    }
}

// Render Functions
function renderPhilosophyExplorer() {
    const container = document.getElementById('philosophy-list');
    if (!container) return;
    
    const state = store.getState();
    const filtered = state.philosophyFilter === 'all' 
        ? philosophyStatements 
        : philosophyStatements.filter(p => p.category === state.philosophyFilter);
    
    container.innerHTML = filtered.map(statement => `
        <div class="philosophy-item ${state.selectedPhilosophyStatements.some(s => s.id === statement.id) ? 'selected' : ''}"
             data-id="${statement.id}"
             data-category="${statement.category}"
             data-text="${statement.text.replace(/"/g, '&quot;')}"
             role="button"
             tabindex="0"
             aria-pressed="${state.selectedPhilosophyStatements.some(s => s.id === statement.id)}">
            <div class="philosophy-content">
                <div class="philosophy-category">${statement.category}</div>
                <div class="philosophy-text">${statement.text}</div>
            </div>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.philosophy-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id);
            const category = el.dataset.category;
            const text = el.dataset.text;
            store.dispatch({ type: ACTIONS.TOGGLE_PHILOSOPHY, payload: { statementId: id, category, text } });
            updateMascotState();
            renderLeaderboard();
        });
        
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                el.click();
            }
        });
    });
}

function renderLeaderboard() {
    const state = store.getState();
    let data = [...state.leaderboardData];
    
    // Sort data
    data.sort((a, b) => {
        let aVal = a[state.sortBy];
        let bVal = b[state.sortBy];
        
        if (state.sortBy === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        
        if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    const topPerformer = data.length > 0 ? data[0] : null;
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;
    
    tbody.innerHTML = data.map(model => `
        <tr class="${state.selectedModel?.model === model.model ? 'selected' : ''} ${topPerformer?.model === model.model ? 'top-performer' : ''}"
            data-model='${JSON.stringify(model).replace(/'/g, "&#39;")}'>
            <td>${model.model}</td>
            <td>${model.date || 'N/A'}</td>
            <td class="${model.overall_score >= 90 ? 'score-high' : ''}">${model.overall_score.toFixed(1)}</td>
            <td>${model.design?.toFixed(1) || '0'}</td>
            <td>${model.architecture?.toFixed(1) || '0'}</td>
            <td>${model.code_quality?.toFixed(1) || '0'}</td>
            <td>${model.best_practices?.toFixed(1) || '0'}</td>
        </tr>
    `).join('');
    
    // Add click handlers for rows
    document.querySelectorAll('#leaderboard-body tr').forEach(row => {
        row.addEventListener('click', () => {
            const modelData = JSON.parse(row.dataset.model);
            store.dispatch({ type: ACTIONS.SELECT_MODEL, payload: modelData });
            updateWorkflowBasedOnScore(modelData.overall_score);
            updateMascotState();
            
            const highlights = checkPhilosophyHighlights(modelData);
            if (highlights.length > 0) {
                store.dispatch({ type: ACTIONS.SHOW_NOTIFICATION, payload: { message: `Philosophy highlighted: ${highlights[0]}`, type: 'success' } });
            }
            
            renderLeaderboard();
            renderWorkflow();
        });
    });
}

function renderWorkflow() {
    const container = document.getElementById('workflow-stages');
    if (!container) return;
    
    const state = store.getState();
    const { completedStages, blockedStages, currentStage } = state.workflowState;
    
    container.innerHTML = workflowStages.map(stage => {
        let statusClass = '';
        if (completedStages.includes(stage)) statusClass = 'completed';
        if (blockedStages.includes(stage)) statusClass = 'blocked';
        
        return `
            <div class="workflow-stage ${statusClass}" data-stage="${stage}">
                <div class="stage-name">${stage}</div>
                ${stage === currentStage ? '<div class="stage-indicator">▶</div>' : ''}
            </div>
        `;
    }).join('');
    
    // Add click handlers for stages
    document.querySelectorAll('.workflow-stage:not(.blocked)').forEach(stageEl => {
        stageEl.addEventListener('click', () => {
            const stageName = stageEl.dataset.stage;
            const state = store.getState();
            const model = state.selectedModel;
            
            const modalBody = document.getElementById('modal-body');
            if (modalBody) {
                modalBody.innerHTML = `
                    <h3>${stageName} Stage</h3>
                    ${model ? `<p><strong>Selected Model:</strong> ${model.model}</p>
                               <p><strong>Overall Score:</strong> ${model.overall_score.toFixed(1)}</p>
                               <p><strong>Architecture Score:</strong> ${model.architecture?.toFixed(1) || 'N/A'}</p>` : '<p>No model selected</p>'}
                    ${state.selectedPhilosophyStatements.length > 0 ? 
                        `<p><strong>Applied Philosophy:</strong></p>
                         <ul>${state.selectedPhilosophyStatements.map(s => `<li>${s.text}</li>`).join('')}</ul>` : 
                        '<p>No philosophy selected</p>'}
                `;
            }
            
            const modal = document.getElementById('modal');
            if (modal) modal.style.display = 'flex';
        });
    });
}

function renderNotifications() {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notifications = store.getState().notifications;
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification" data-id="${notif.id}">
            ${notif.message}
        </div>
    `).join('');
    
    notifications.forEach(notif => {
        setTimeout(() => {
            store.dispatch({ type: ACTIONS.HIDE_NOTIFICATION, payload: notif.id });
        }, 3000);
    });
}

function renderTheme() {
    const theme = store.getState().theme;
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

function renderMascot() {
    const mascot = document.getElementById('mascot');
    const state = store.getState();
    if (mascot) mascot.setAttribute('data-state', state.mascotState);
}

// Main Render Function - Single Atomic Update
function render() {
    renderTheme();
    renderPhilosophyExplorer();
    renderLeaderboard();
    renderWorkflow();
    renderNotifications();
    renderMascot();
}

// Subscribe to store updates
store.subscribe(() => {
    render();
});

// Initialize application
async function init() {
    render();
    await fetchLeaderboard();
    
    // Setup theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = store.getState().theme === 'light' ? 'dark' : 'light';
            store.dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
            updateMascotState();
        });
    }
    
    // Setup sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sortBy = btn.dataset.sort;
            const state = store.getState();
            let sortDirection = 'desc';
            
            if (state.sortBy === sortBy) {
                sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc';
            }
            
            store.dispatch({ type: ACTIONS.SET_SORT, payload: { sortBy, sortDirection } });
            renderLeaderboard();
        });
    });
    
    // Setup philosophy filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const category = chip.dataset.category;
            store.dispatch({ type: ACTIONS.SET_PHILOSOPHY_FILTER, payload: category });
            
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
    
    // Modal close handler
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
    
    // Initial mascot state
    updateMascotState();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
