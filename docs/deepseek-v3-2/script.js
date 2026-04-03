// ============================================
// SINGLE CENTRALIZED STORE
// ============================================

// Initial State
const initialState = {
    theme: 'light',
    selectedPhilosophyStatements: [],
    selectedModel: null,
    workflowState: {
        currentStage: 0,
        maxReachableStage: 0,
        stages: ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'],
        completedStages: []
    },
    leaderboardData: [],
    notifications: []
};

// Action Types
const ACTIONS = {
    SET_THEME: 'SET_THEME',
    TOGGLE_PHILOSOPHY: 'TOGGLE_PHILOSOPHY',
    SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',
    SET_LEADERBOARD_DATA: 'SET_LEADERBOARD_DATA',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
    UPDATE_WORKFLOW: 'UPDATE_WORKFLOW',
    RESTORE_STATE: 'RESTORE_STATE'
};

// Reducer
function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.SET_THEME:
            return { ...state, theme: action.payload };
        
        case ACTIONS.TOGGLE_PHILOSOPHY:
            const statementId = action.payload;
            const newSelection = state.selectedPhilosophyStatements.includes(statementId)
                ? state.selectedPhilosophyStatements.filter(id => id !== statementId)
                : [...state.selectedPhilosophyStatements, statementId];
            return { ...state, selectedPhilosophyStatements: newSelection };
        
        case ACTIONS.SET_SELECTED_MODEL:
            return { ...state, selectedModel: action.payload };
        
        case ACTIONS.SET_LEADERBOARD_DATA:
            return { ...state, leaderboardData: action.payload };
        
        case ACTIONS.ADD_NOTIFICATION:
            const newNotifications = [action.payload, ...state.notifications].slice(0, 10);
            return { ...state, notifications: newNotifications };
        
        case ACTIONS.CLEAR_NOTIFICATIONS:
            return { ...state, notifications: [] };
        
        case ACTIONS.UPDATE_WORKFLOW:
            return { ...state, workflowState: action.payload };
        
        case ACTIONS.RESTORE_STATE:
            return { ...state, ...action.payload };
        
        default:
            return state;
    }
}

// Store implementation
class Store {
    constructor(reducer, initialState) {
        this.reducer = reducer;
        this.state = initialState;
        this.listeners = new Set();
    }
    
    getState() {
        return this.state;
    }
    
    dispatch(action) {
        const newState = this.reducer(this.state, action);
        if (newState !== this.state) {
            this.state = newState;
            this.notify();
        }
    }
    
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    notify() {
        // Atomic update - single render per tick
        requestAnimationFrame(() => {
            this.listeners.forEach(listener => listener(this.state));
        });
    }
}

// Initialize store
const store = new Store(reducer, initialState);

// ============================================
// PHILOSOPHY DATA
// ============================================

const philosophyStatements = [
    { id: 'p1', category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { id: 'p2', category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { id: 'ph1', category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { id: 'ph2', category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { id: 't1', category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { id: 't2', category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { id: 't3', category: 'Technical', text: 'Own your infrastructure. Own your data' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateWorkflowProgress(score) {
    if (!score) return { currentStage: 0, maxReachableStage: 0, completedStages: [] };
    
    let maxReachableStage;
    if (score >= 90) maxReachableStage = 6; // Full progression
    else if (score >= 70) maxReachableStage = 4; // Stops at Implementation
    else maxReachableStage = 2; // Stops at Architecture
    
    const completedStages = [];
    for (let i = 0; i <= maxReachableStage; i++) {
        completedStages.push(i);
    }
    
    return {
        currentStage: maxReachableStage,
        maxReachableStage,
        completedStages
    };
}

function checkPhilosophyHighlights(model, selectedPhilosophies) {
    if (!model || selectedPhilosophies.length === 0) return false;
    
    const highlights = {
        Practical: false,
        Philosophical: false,
        Technical: false
    };
    
    selectedPhilosophies.forEach(philId => {
        const phil = philosophyStatements.find(p => p.id === philId);
        if (!phil) return;
        
        if (phil.category === 'Practical') {
            if (model.code_quality >= 8 && model.feature_complete >= 8) {
                highlights.Practical = true;
            }
        } else if (phil.category === 'Philosophical') {
            if (model.architecture >= 8) {
                highlights.Philosophical = true;
            }
        } else if (phil.category === 'Technical') {
            if (model.best_practices >= 8) {
                highlights.Technical = true;
            }
        }
    });
    
    return Object.values(highlights).some(v => v === true);
}

function addNotification(message, type = 'info') {
    store.dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toLocaleTimeString()
        }
    });
}

// ============================================
// CSV LOADING
// ============================================

async function loadLeaderboardData() {
    try {
        const response = await fetch('/results/leaderboard.csv');
        if (!response.ok) throw new Error('CSV file not found');
        
        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        
        if (parsedData.length === 0) {
            throw new Error('No valid data in CSV');
        }
        
        store.dispatch({ type: ACTIONS.SET_LEADERBOARD_DATA, payload: parsedData });
        addNotification('Leaderboard data loaded successfully', 'success');
        
        // Auto-select top performer
        if (parsedData.length > 0) {
            const topPerformer = [...parsedData].sort((a, b) => b.overall_score - a.overall_score)[0];
            store.dispatch({ type: ACTIONS.SET_SELECTED_MODEL, payload: topPerformer });
            addNotification(`Top performer selected: ${topPerformer.model}`, 'info');
        }
    } catch (error) {
        console.error('Error loading CSV:', error);
        addNotification('Failed to load leaderboard data. Please check CSV file.', 'error');
        store.dispatch({ type: ACTIONS.SET_LEADERBOARD_DATA, payload: [] });
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) continue;
        
        const row = {};
        headers.forEach((header, idx) => {
            let value = values[idx] || '0';
            if (header !== 'model' && header !== 'date' && header !== 'video_url' && header !== 'result_url') {
                row[header] = parseFloat(value) || 0;
            } else {
                row[header] = value.trim();
            }
        });
        
        // Ensure required fields exist
        if (row.model && row.overall_score !== undefined) {
            data.push(row);
        }
    }
    
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    result.push(currentValue);
    
    return result;
}

// ============================================
// UI RENDERING (Derived State Computed Here)
// ============================================

let currentRenderState = null;

function renderApp(state) {
    // Prevent duplicate renders
    if (currentRenderState === state) return;
    currentRenderState = state;
    
    renderTheme(state.theme);
    renderPhilosophyList(state);
    renderLeaderboard(state);
    renderWorkflow(state);
    renderNotifications(state);
    renderMascot(state);
}

function renderTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

function renderPhilosophyList(state) {
    const container = document.getElementById('philosophyList');
    if (!container) return;
    
    const activeFilter = document.querySelector('.filter-chip.active')?.dataset.category || 'all';
    
    const filteredPhilosophies = activeFilter === 'all' 
        ? philosophyStatements 
        : philosophyStatements.filter(p => p.category === activeFilter);
    
    container.innerHTML = filteredPhilosophies.map(phil => `
        <div class="philosophy-item ${state.selectedPhilosophyStatements.includes(phil.id) ? 'selected' : ''}"
             data-philosophy-id="${phil.id}">
            <div class="philosophy-category">${phil.category}</div>
            <div class="philosophy-text">${phil.text}</div>
        </div>
    `).join('');
    
    // Attach event listeners
    container.querySelectorAll('.philosophy-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.dataset.philosophyId;
            store.dispatch({ type: ACTIONS.TOGGLE_PHILOSOPHY, payload: id });
            
            const isSelected = !state.selectedPhilosophyStatements.includes(id);
            addNotification(`${isSelected ? 'Selected' : 'Deselected'} philosophy: ${philosophyStatements.find(p => p.id === id).text.substring(0, 50)}...`);
        });
    });
}

function renderLeaderboard(state) {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;
    
    if (!state.leaderboardData || state.leaderboardData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No data available</td></tr>';
        return;
    }
    
    const sortBy = document.getElementById('sortBy')?.value || 'overall_score';
    const sortedData = [...state.leaderboardData].sort((a, b) => {
        if (sortBy === 'overall_score') return b.overall_score - a.overall_score;
        if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
        return a.model.localeCompare(b.model);
    });
    
    const topScore = Math.max(...sortedData.map(m => m.overall_score));
    
    tbody.innerHTML = sortedData.map((model, idx) => {
        const isSelected = state.selectedModel?.model === model.model;
        const isTopPerformer = model.overall_score === topScore;
        const isHighlighted = checkPhilosophyHighlights(model, state.selectedPhilosophyStatements);
        
        return `
            <tr class="${isSelected ? 'selected' : ''} ${isTopPerformer ? 'top-performer' : ''}" 
                data-model-idx="${idx}"
                style="${isHighlighted ? 'border-left: 3px solid #f39c12;' : ''}">
                <td>${idx + 1}</td>
                <td><strong>${model.model}</strong></td>
                <td>${model.date || 'N/A'}</td>
                <td><strong>${model.overall_score?.toFixed(1) || '0'}</strong></td>
                <td>${model.design?.toFixed(1) || '0'}</td>
                <td>${model.architecture?.toFixed(1) || '0'}</td>
                <td>${model.code_quality?.toFixed(1) || '0'}</td>
                <td>${model.best_practices?.toFixed(1) || '0'}</td>
            </tr>
        `;
    }).join('');
    
    // Attach row click handlers
    tbody.querySelectorAll('tr').forEach((row, idx) => {
        row.addEventListener('click', () => {
            const selectedModel = sortedData[idx];
            store.dispatch({ type: ACTIONS.SET_SELECTED_MODEL, payload: selectedModel });
            
            // Update workflow based on model score
            const workflow = calculateWorkflowProgress(selectedModel.overall_score);
            store.dispatch({ type: ACTIONS.UPDATE_WORKFLOW, payload: workflow });
            
            addNotification(`Selected model: ${selectedModel.model} (Score: ${selectedModel.overall_score})`);
        });
    });
}

function renderWorkflow(state) {
    const container = document.getElementById('workflowStages');
    if (!container) return;
    
    const stages = state.workflowState.stages;
    const maxReachable = state.workflowState.maxReachableStage;
    const completedStages = state.workflowState.completedStages;
    
    container.innerHTML = stages.map((stage, idx) => {
        const isCompleted = completedStages.includes(idx);
        const isActive = idx === state.workflowState.currentStage;
        const isDisabled = idx > maxReachable;
        
        let statusClass = '';
        if (isDisabled) statusClass = 'disabled';
        else if (isCompleted) statusClass = 'completed';
        else if (isActive) statusClass = 'active';
        
        const gateText = (stage === 'Gate') ? '🚦' : '';
        
        return `
            <div class="workflow-stage ${statusClass}" data-stage-idx="${idx}" data-stage-name="${stage}">
                <div class="stage-name">${stage} ${gateText}</div>
                ${isCompleted ? '<div class="stage-gate">✓</div>' : ''}
            </div>
        `;
    }).join('');
    
    // Calculate progress percentage
    const progressPercent = (state.workflowState.currentStage / (stages.length - 1)) * 100;
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // Attach stage click handlers
    container.querySelectorAll('.workflow-stage:not(.disabled)').forEach(el => {
        el.addEventListener('click', () => {
            const stageIdx = parseInt(el.dataset.stageIdx);
            const stageName = el.dataset.stageName;
            openModal(stageName, state);
        });
    });
}

function openModal(stageName, state) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = `${stageName} Stage Details`;
    
    let content = `<h4>Stage: ${stageName}</h4>`;
    
    if (state.selectedModel) {
        content += `
            <div style="margin-top: 16px;">
                <h5>Selected Model: ${state.selectedModel.model}</h5>
                <p>Overall Score: ${state.selectedModel.overall_score?.toFixed(1) || 'N/A'}</p>
                <p>Architecture: ${state.selectedModel.architecture?.toFixed(1) || 'N/A'}</p>
                <p>Code Quality: ${state.selectedModel.code_quality?.toFixed(1) || 'N/A'}</p>
            </div>
        `;
    }
    
    if (state.selectedPhilosophyStatements.length > 0) {
        content += `
            <div style="margin-top: 16px;">
                <h5>Active Philosophies:</h5>
                <ul>
                    ${state.selectedPhilosophyStatements.map(id => {
                        const phil = philosophyStatements.find(p => p.id === id);
                        return `<li>${phil ? phil.text : ''}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }
    
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
}

function renderNotifications(state) {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    if (state.notifications.length === 0) {
        container.innerHTML = '<div class="notification-placeholder">Select a model to begin</div>';
        return;
    }
    
    container.innerHTML = state.notifications.map(notif => `
        <div class="notification notification-${notif.type}">
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${notif.timestamp}</div>
            <div>${notif.message}</div>
        </div>
    `).join('');
}

function renderMascot(state) {
    const container = document.getElementById('mascotContainer');
    const messageEl = document.getElementById('mascotMessage');
    if (!container || !messageEl) return;
    
    // Determine mascot behavior based on state
    let behavior = 'idle';
    let message = '🦒 Standing tall...';
    
    if (state.selectedPhilosophyStatements.length > 0) {
        behavior = 'orient-left';
        message = `🦒 Pondering ${state.selectedPhilosophyStatements.length} philosophy(ies)...`;
    } else if (state.selectedModel) {
        behavior = 'orient-right';
        message = `🦒 Analyzing ${state.selectedModel.model} (Score: ${state.selectedModel.overall_score})`;
    }
    
    // Apply behavior class
    container.className = `mascot-container ${behavior}`;
    messageEl.textContent = message;
    
    // Theme change reaction
    const currentTheme = state.theme;
    if (currentTheme === 'dark') {
        messageEl.style.animation = 'none';
        messageEl.offsetHeight; // Trigger reflow
        messageEl.style.animation = 'subtleMotion 0.5s ease';
        setTimeout(() => {
            messageEl.style.animation = '';
        }, 500);
    }
}

// ============================================
// PERSISTENCE
// ============================================

function saveToLocalStorage(state) {
    try {
        const toSave = {
            theme: state.theme,
            selectedPhilosophyStatements: state.selectedPhilosophyStatements,
            selectedModel: state.selectedModel,
            workflowState: state.workflowState
        };
        localStorage.setItem('gironimo_state', JSON.stringify(toSave));
    } catch (error) {
        console.error('Failed to save state:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('gironimo_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            store.dispatch({ type: ACTIONS.RESTORE_STATE, payload: parsed });
        }
    } catch (error) {
        console.error('Failed to load saved state:', error);
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = store.getState().theme === 'light' ? 'dark' : 'light';
            store.dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
            addNotification(`Theme changed to ${newTheme} mode`);
        });
    }
    
    // Sort select
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            renderLeaderboard(store.getState());
        });
    }
    
    // Category filters
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            renderPhilosophyList(store.getState());
        });
    });
    
    // Modal close
    const modal = document.getElementById('modal');
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Close modal on outside click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Tooltip setup
    setupTooltips();
}

function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    const tooltip = document.getElementById('tooltip');
    
    tooltipElements.forEach(el => {
        el.addEventListener('mouseenter', (e) => {
            const text = el.dataset.tooltip;
            if (text && tooltip) {
                tooltip.textContent = text;
                tooltip.classList.remove('hidden');
                const rect = el.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - 30}px`;
            }
        });
        
        el.addEventListener('mouseleave', () => {
            if (tooltip) tooltip.classList.add('hidden');
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

async function init() {
    // Load persisted state
    loadFromLocalStorage();
    
    // Subscribe to store updates
    store.subscribe((state) => {
        renderApp(state);
        saveToLocalStorage(state);
    });
    
    // Setup event listeners
    setupEventListeners();
    
    // Load CSV data
    await loadLeaderboardData();
    
    // Initial render
    renderApp(store.getState());
    
    addNotification('Gironimo system initialized', 'success');
}

// Start the application
init();
