/**
 * Gironimo - AI Quality Benchmark
 * Centralized Store Implementation
 */

// ================================
// STATE MANAGEMENT SYSTEM
// ================================

// Initial State
const initialState = {
    theme: localStorage.getItem('gironimo-theme') || 'light',
    selectedPhilosophyStatements: [],
    selectedModel: null,
    workflowState: 'spec',
    leaderboardData: [],
    loading: false,
    error: null
};

// Action Types
const actionTypes = {
    SET_THEME: 'SET_THEME',
    SELECT_PHILOSOPHY_STATEMENT: 'SELECT_PHILOSOPHY_STATEMENT',
    DESELECT_PHILOSOPHY_STATEMENT: 'DESELECT_PHILOSOPHY_STATEMENT',
    SET_SELECTED_MODEL: 'SET_SELECTED_MODEL',
    SET_WORKFLOW_STATE: 'SET_WORKFLOW_STATE',
    SET_LEADERBOARD_DATA: 'SET_LEADERBOARD_DATA',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function reducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_THEME:
            return {
                ...state,
                theme: action.payload
            };
        
        case actionTypes.SELECT_PHILOSOPHY_STATEMENT:
            return {
                ...state,
                selectedPhilosophyStatements: [...state.selectedPhilosophyStatements, action.payload]
            };
        
        case actionTypes.DESELECT_PHILOSOPHY_STATEMENT:
            return {
                ...state,
                selectedPhilosophyStatements: state.selectedPhilosophyStatements.filter(id => id !== action.payload)
            };
        
        case actionTypes.SET_SELECTED_MODEL:
            return {
                ...state,
                selectedModel: action.payload
            };
        
        case actionTypes.SET_WORKFLOW_STATE:
            return {
                ...state,
                workflowState: action.payload
            };
        
        case actionTypes.SET_LEADERBOARD_DATA:
            return {
                ...state,
                leaderboardData: action.payload,
                error: null
            };
        
        case actionTypes.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        
        case actionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        
        case actionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };
        
        default:
            return state;
    }
}

// Store Implementation
class Store {
    constructor(reducer, initialState) {
        this.reducer = reducer;
        this.state = reducer(initialState, { type: '@@INIT' });
        this.listeners = [];
    }
    
    getState() {
        return this.state;
    }
    
    dispatch(action) {
        // Apply the reducer to get the new state
        this.state = this.reducer(this.state, action);
        
        // Notify all listeners
        this.listeners.forEach(listener => listener(this.state));
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
}

// Create store instance
const store = new Store(reducer, initialState);

// ================================
// COMPONENTS
// ================================

// Component: Button
function Button({ id, text, onClick, variant = 'primary', disabled = false, className = '' }) {
    const variants = {
        primary: 'background-color: var(--accent-primary); color: var(--bg-primary);',
        secondary: 'background-color: var(--bg-secondary); color: var(--text-primary); border: 1px solid var(--border-color);',
        outline: 'background-color: transparent; color: var(--accent-primary); border: 1px solid var(--accent-primary);'
    };
    
    const style = variants[variant] || variants.primary;
    
    const button = document.createElement('button');
    button.id = id;
    button.className = `button ${className}`;
    button.style.cssText = style;
    button.innerHTML = text;
    button.disabled = disabled;
    button.onclick = onClick;
    
    return button;
}

// Component: Card
function Card({ children, className = '' }) {
    const card = document.createElement('div');
    card.className = `card ${className}`;
    card.style.cssText = `
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        box-shadow: var(--shadow-sm);
    `;
    card.innerHTML = children;
    return card;
}

// Component: Modal
function Modal({ title, children, onClose }) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
    
    // Set content
    modalTitle.textContent = title;
    modalBody.innerHTML = children;
    
    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    
    // Close handlers
    const closeModal = () => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        if (onClose) onClose();
    };
    
    modalCloseButtons.forEach(btn => {
        btn.onclick = closeModal;
    });
    
    // Close on overlay click
    document.querySelector('.modal-overlay').onclick = closeModal;
    
    return modal;
}

// Component: Tooltip
function Tooltip({ element, text }) {
    const tooltip = document.getElementById('mascot-tooltip');
    const tooltipText = document.getElementById('mascot-tooltip-text');
    
    tooltipText.textContent = text;
    
    element.addEventListener('mouseenter', () => {
        tooltip.classList.add('visible');
    });
    
    element.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
    
    return tooltip;
}

// Component: Notification
function Notification({ message, type = 'info' }) {
    const notification = document.getElementById('notification');
    const colors = {
        info: 'var(--accent-primary)',
        success: '#28a745',
        error: '#dc3545'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 3000);
    
    return notification;
}

// Component: ThemeProvider
function ThemeProvider({ children }) {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        const newTheme = store.getState().theme === 'light' ? 'dark' : 'light';
        store.dispatch({ type: actionTypes.SET_THEME, payload: newTheme });
    });
    
    return children;
}

// ================================
// FEATURE: PHILOSOPHY EXPLORER
// ================================

const philosophyStatements = [
    { id: 1, category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { id: 2, category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { id: 3, category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { id: 4, category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { id: 5, category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { id: 6, category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { id: 7, category: 'Technical', text: 'Own your infrastructure. Own your data' }
];

function renderPhilosophyExplorer() {
    const state = store.getState();
    const philosophyList = document.getElementById('philosophy-list');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    
    // Filter categories
    const activeCategories = Array.from(categoryCheckboxes)
        .filter(cb => cb.checked && cb.dataset.category !== 'all')
        .map(cb => cb.dataset.category);
    
    // Filter statements
    const filteredStatements = state.selectedModel && state.selectedModel.score !== undefined 
        ? philosophyStatements.filter(statement => 
            activeCategories.includes(statement.category) || 
            (activeCategories.length === 0 && statement.category === 'all')
          )
        : philosophyStatements;
    
    // Render statements
    philosophyList.innerHTML = '';
    
    filteredStatements.forEach(statement => {
        const isSelected = state.selectedPhilosophyStatements.includes(statement.id);
        const statementElement = document.createElement('div');
        statementElement.className = `philosophy-item ${isSelected ? 'selected' : ''}`;
        statementElement.onclick = () => {
            if (isSelected) {
                store.dispatch({ type: actionTypes.DESELECT_PHILOSOPHY_STATEMENT, payload: statement.id });
            } else {
                store.dispatch({ type: actionTypes.SELECT_PHILOSOPHY_STATEMENT, payload: statement.id });
            }
        };
        
        const categoryClass = `category-${statement.category.toLowerCase()}`;
        
        statementElement.innerHTML = `
            <span class="philosophy-category ${categoryClass}">${statement.category}</span>
            <p class="philosophy-text">${statement.text}</p>
        `;
        
        philosophyList.appendChild(statementElement);
    });
}

function setupPhilosophyFilters() {
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allCheckbox = document.querySelector('.category-checkbox[data-category="all"]');
            
            if (checkbox.dataset.category === 'all') {
                categoryCheckboxes.forEach(cb => {
                    cb.checked = checkbox.checked;
                });
            } else {
                const anySelected = Array.from(categoryCheckboxes)
                    .slice(1)
                    .some(cb => cb.checked);
                
                if (!anySelected) {
                    allCheckbox.checked = true;
                } else {
                    allCheckbox.checked = false;
                }
            }
            
            renderPhilosophyExplorer();
        });
    });
}

// ================================
// FEATURE: INTERACTIVE MASCOT (GIRAFFE)
// ================================

function createGiraffeSVG() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", "200");
    svg.setAttribute("height", "300");
    svg.setAttribute("viewBox", "0 0 200 300");
    svg.style.overflow = "visible";
    
    // Giraffe body
    const body = document.createElementNS(svgNS, "ellipse");
    body.setAttribute("cx", "100");
    body.setAttribute("cy", "200");
    body.setAttribute("rx", "60");
    body.setAttribute("ry", "70");
    body.setAttribute("fill", "#FFD54F");
    body.setAttribute("stroke", "#F57F17");
    body.setAttribute("stroke-width", "2");
    
    // Giraffe head
    const head = document.createElementNS(svgNS, "ellipse");
    head.setAttribute("cx", "100");
    head.setAttribute("cy", "110");
    head.setAttribute("rx", "40");
    head.setAttribute("ry", "50");
    head.setAttribute("fill", "#FFD54F");
    head.setAttribute("stroke", "#F57F17");
    head.setAttribute("stroke-width", "2");
    
    // Giraffe ears
    const leftEar = document.createElementNS(svgNS, "ellipse");
    leftEar.setAttribute("cx", "60");
    leftEar.setAttribute("cy", "90");
    leftEar.setAttribute("rx", "15");
    leftEar.setAttribute("ry", "20");
    leftEar.setAttribute("fill", "#FFD54F");
    leftEar.setAttribute("stroke", "#F57F17");
    leftEar.setAttribute("stroke-width", "2");
    leftEar.setAttribute("transform", "rotate(-30 60 90)");
    
    const rightEar = document.createElementNS(svgNS, "ellipse");
    rightEar.setAttribute("cx", "140");
    rightEar.setAttribute("cy", "90");
    rightEar.setAttribute("rx", "15");
    rightEar.setAttribute("ry", "20");
    rightEar.setAttribute("fill", "#FFD54F");
    rightEar.setAttribute("stroke", "#F57F17");
    rightEar.setAttribute("stroke-width", "2");
    rightEar.setAttribute("transform", "rotate(30 140 90)");
    
    // Giraffe ossicones (horns)
    const leftOssicone = document.createElementNS(svgNS, "ellipse");
    leftOssicone.setAttribute("cx", "70");
    leftOssicone.setAttribute("cy", "95");
    leftOssicone.setAttribute("rx", "8");
    leftOssicone.setAttribute("ry", "25");
    leftOssicone.setAttribute("fill", "#8D6E63");
    leftOssicone.setAttribute("stroke", "#5D4037");
    leftOssicone.setAttribute("stroke-width", "2");
    
    const rightOssicone = document.createElementNS(svgNS, "ellipse");
    rightOssicone.setAttribute("cx", "130");
    rightOssicone.setAttribute("cy", "95");
    rightOssicone.setAttribute("rx", "8");
    rightOssicone.setAttribute("ry", "25");
    rightOssicone.setAttribute("fill", "#8D6E63");
    rightOssicone.setAttribute("stroke", "#5D4037");
    rightOssicone.setAttribute("stroke-width", "2");
    
    // Giraffe eyes
    const leftEye = document.createElementNS(svgNS, "circle");
    leftEye.setAttribute("cx", "85");
    leftEye.setAttribute("cy", "110");
    leftEye.setAttribute("r", "5");
    leftEye.setAttribute("fill", "#000");
    
    const rightEye = document.createElementNS(svgNS, "circle");
    rightEye.setAttribute("cx", "115");
    rightEye.setAttribute("cy", "110");
    rightEye.setAttribute("r", "5");
    rightEye.setAttribute("fill", "#000");
    
    // Giraffe smile
    const smile = document.createElementNS(svgNS, "path");
    smile.setAttribute("d", "M 70 130 Q 100 150 130 130");
    smile.setAttribute("stroke", "#000");
    smile.setAttribute("stroke-width", "2");
    smile.setAttribute("fill", "none");
    
    // Giraffe neck
    const neck = document.createElementNS(svgNS, "ellipse");
    neck.setAttribute("cx", "100");
    neck.setAttribute("cy", "160");
    neck.setAttribute("rx", "30");
    neck.setAttribute("ry", "80");
    neck.setAttribute("fill", "#FFD54F");
    neck.setAttribute("stroke", "#F57F17");
    neck.setAttribute("stroke-width", "2");
    neck.setAttribute("transform", "rotate(10 100 160)");
    
    // Giraffe tail
    const tail = document.createElementNS(svgNS, "path");
    tail.setAttribute("d", "M 140 190 Q 160 180 150 200 Q 160 220 140 210");
    tail.setAttribute("stroke", "#8D6E63");
    tail.setAttribute("stroke-width", "3");
    tail.setAttribute("fill", "none");
    
    // Group for giraffe
    const giraffeGroup = document.createElementNS(svgNS, "g");
    giraffeGroup.setAttribute("id", "giraffe");
    
    // Add all parts to group
    giraffeGroup.appendChild(body);
    giraffeGroup.appendChild(neck);
    giraffeGroup.appendChild(head);
    giraffeGroup.appendChild(leftEar);
    giraffeGroup.appendChild(rightEar);
    giraffeGroup.appendChild(leftOssicone);
    giraffeGroup.appendChild(rightOssicone);
    giraffeGroup.appendChild(leftEye);
    giraffeGroup.appendChild(rightEye);
    giraffeGroup.appendChild(smile);
    giraffeGroup.appendChild(tail);
    
    // Add group to SVG
    svg.appendChild(giraffeGroup);
    
    return svg;
}

function updateMascotBehavior() {
    const state = store.getState();
    const mascot = document.getElementById('giraffe');
    const tooltip = document.getElementById('mascot-tooltip');
    const tooltipText = document.getElementById('mascot-tooltip-text');
    
    if (!mascot) return;
    
    // Reset all transformations
    mascot.style.transition = 'all 0.5s ease';
    mascot.style.transform = 'none';
    
    let tooltipMessage = "I'm your friendly Gironimo giraffe!";
    
    // Determine behavior based on state
    if (state.selectedPhilosophyStatements.length > 0) {
        // Orient toward selected statements
        mascot.style.transform = 'rotate(15deg) scale(1.1)';
        tooltipMessage = `${state.selectedPhilosophyStatements.length} philosophy statement(s) selected`;
    } else if (state.selectedModel) {
        // Orient toward leaderboard position
        const score = state.selectedModel.overall_score || 0;
        const angle = (score / 100) * 30 - 15; // -15 to 15 degrees
        mascot.style.transform = `rotate(${angle}deg)`;
        tooltipMessage = `Model: ${state.selectedModel.model} - Score: ${score}`;
    } else if (state.theme === 'dark') {
        // Visual transition reaction for theme change
        mascot.style.filter = 'invert(1)';
        setTimeout(() => {
            mascot.style.filter = 'none';
        }, 500);
        tooltipMessage = "Theme changed to dark mode";
    } else {
        // Idle subtle motion
        mascot.style.animation = 'none';
        setTimeout(() => {
            mascot.style.animation = 'idleBounce 3s infinite ease-in-out';
        }, 10);
        tooltipMessage = "Gironimo is ready!";
    }
    
    // Update tooltip
    tooltipText.textContent = tooltipMessage;
    tooltip.classList.add('visible');
    
    // Hide tooltip after 3 seconds
    setTimeout(() => {
        tooltip.classList.remove('visible');
    }, 3000);
}

// Add idle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes idleBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);

// ================================
// FEATURE: WORKFLOW SYSTEM
// ================================

function updateWorkflow() {
    const state = store.getState();
    const workflowStages = document.querySelectorAll('.workflow-stage');
    const statusText = document.getElementById('workflow-status-text');
    
    // Determine current workflow state based on selected model score
    let currentStage = 'spec';
    let nextStage = 'gate1';
    let statusMessage = 'Start by selecting a model from the leaderboard.';
    
    if (state.selectedModel && state.selectedModel.overall_score !== undefined) {
        const score = parseFloat(state.selectedModel.overall_score) || 0;
        
        if (score >= 90) {
            currentStage = 'spec';
            nextStage = 'gate1';
            statusMessage = `Excellent score! Full workflow unlocked.`;
        } else if (score >= 70) {
            currentStage = 'spec';
            nextStage = 'gate1';
            statusMessage = `Good score! Workflow stops at Implementation stage.`;
        } else {
            currentStage = 'spec';
            nextStage = 'gate1';
            statusMessage = `Needs improvement. Workflow stops at Architecture stage.`;
        }
    }
    
    // Update stages
    workflowStages.forEach(stage => {
        const stageName = stage.dataset.stage;
        const icon = stage.querySelector('.stage-icon');
        const label = stage.querySelector('.stage-label');
        const status = stage.querySelector('.stage-status');
        
        // Reset classes
        stage.classList.remove('completed', 'active');
        
        // Determine stage status
        if (stageName === currentStage) {
            stage.classList.add('active');
            status.textContent = 'Current';
            status.style.color = 'var(--accent-primary)';
        } else if (stageName === nextStage) {
            status.textContent = 'Next';
            status.style.color = 'var(--text-tertiary)';
        } else if (getStageOrder(stageName) < getStageOrder(currentStage)) {
            stage.classList.add('completed');
            status.textContent = 'Completed';
            status.style.color = 'var(--text-secondary)';
        } else {
            status.textContent = '';
        }
    });
    
    // Update status text
    statusText.textContent = statusMessage;
    
    // Store workflow state
    store.dispatch({ type: actionTypes.SET_WORKFLOW_STATE, payload: currentStage });
}

function getStageOrder(stage) {
    const order = {
        'spec': 1,
        'gate1': 2,
        'architecture': 3,
        'gate2': 4,
        'implementation': 5,
        'review': 6,
        'adr': 7
    };
    return order[stage] || 0;
}

function setupWorkflowInteractions() {
    const stages = document.querySelectorAll('.workflow-stage');
    
    stages.forEach(stage => {
        stage.addEventListener('click', () => {
            const stageName = stage.dataset.stage;
            const state = store.getState();
            
            if (state.selectedModel) {
                showWorkflowModal(state.selectedModel, stageName);
            } else {
                Notification({ message: 'Please select a model from the leaderboard first.', type: 'error' });
            }
        });
    });
}

function showWorkflowModal(model, stage) {
    const title = `Workflow Stage: ${stage.charAt(0).toUpperCase() + stage.slice(1)}`;
    const children = `
        <div class="modal-section">
            <h4>Selected Model</h4>
            <p>${model.model}</p>
        </div>
        <div class="modal-section">
            <h4>Overall Score</h4>
            <p>${model.overall_score || 'N/A'}</p>
        </div>
        <div class="modal-section">
            <h4>Stage Information</h4>
            <p>This stage represents ${getStageDescription(stage)}.</p>
        </div>
        ${state.selectedPhilosophyStatements.length > 0 ? `
        <div class="modal-section">
            <h4>Philosophy Context</h4>
            <p>Selected statements: ${state.selectedPhilosophyStatements.length}</p>
        </div>
        ` : ''}
    `;
    
    Modal({ title, children, onClose: () => {} });
}

function getStageDescription(stage) {
    const descriptions = {
        'spec': 'the initial specification phase where requirements are defined',
        'gate1': 'the first quality gate where initial specifications are reviewed',
        'architecture': 'the system architecture design phase',
        'gate2': 'the second quality gate where architecture is reviewed',
        'implementation': 'the actual coding and implementation phase',
        'review': 'the code review and quality assurance phase',
        'adr': 'the architecture decision record documentation phase'
    };
    return descriptions[stage] || 'an unspecified workflow stage';
}

// ================================
// FEATURE: LEADERBOARD (CSV-DRIVEN)
// ================================

async function fetchLeaderboardData() {
    const state = store.getState();
    store.dispatch({ type: actionTypes.SET_LOADING, payload: true });
    store.dispatch({ type: actionTypes.CLEAR_ERROR });
    
    try {
        const response = await fetch('/results/leaderboard.csv');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        // Sort by overall score descending
        data.sort((a, b) => (parseFloat(b.overall_score) || 0) - (parseFloat(a.overall_score) || 0));
        
        store.dispatch({ type: actionTypes.SET_LEADERBOARD_DATA, payload: data });
        
        // Select top model by default
        if (data.length > 0) {
            store.dispatch({ type: actionTypes.SET_SELECTED_MODEL, payload: data[0] });
        }
        
    } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
        store.dispatch({ 
            type: actionTypes.SET_ERROR, 
            payload: 'Failed to load leaderboard data. Please check the CSV file exists at /results/leaderboard.csv' 
        });
    } finally {
        store.dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length !== headers.length) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            let value = values[index].trim();
            
            // Handle empty values
            if (value === '') {
                value = 0;
            }
            // Parse numbers
            else if (!isNaN(value) && value !== '') {
                value = parseFloat(value);
            }
            // Remove quotes
            else if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            
            row[header] = value;
        });
        
        data.push(row);
    }
    
    return data;
}

function renderLeaderboard() {
    const state = store.getState();
    const leaderboardBody = document.getElementById('leaderboard-body');
    const loadingElement = document.getElementById('leaderboard-loading');
    const errorElement = document.getElementById('leaderboard-error');
    const sortSelect = document.getElementById('sort-select');
    
    // Clear existing rows
    leaderboardBody.innerHTML = '';
    
    if (state.loading) {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        return;
    }
    
    if (state.error) {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        errorElement.textContent = state.error;
        return;
    }
    
    loadingElement.style.display = 'none';
    errorElement.style.display = 'none';
    
    if (state.leaderboardData.length === 0) {
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem;">
                    No leaderboard data available.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort data based on selection
    const sortValue = sortSelect.value;
    let sortedData = [...state.leaderboardData];
    
    sortedData.sort((a, b) => {
        let valA = a[sortValue];
        let valB = b[sortValue];
        
        // Handle numeric sorting
        if (sortValue === 'overall_score' || sortValue === 'date') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
            return valB - valA;
        }
        // Handle string sorting
        else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
            return valA.localeCompare(valB);
        }
    });
    
    // Render rows
    sortedData.forEach((row, index) => {
        const rank = index + 1;
        const isSelected = state.selectedModel && state.selectedModel.model === row.model;
        const isTopPerformer = index < 3;
        
        const tr = document.createElement('tr');
        tr.className = `leaderboard-row ${isSelected ? 'selected-model' : ''}`;
        tr.onclick = () => {
            store.dispatch({ type: actionTypes.SET_SELECTED_MODEL, payload: row });
        };
        
        tr.innerHTML = `
            <td class="table-column-rank">
                <span class="rank-badge ${rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : ''}">
                    #${rank}
                </span>
            </td>
            <td class="table-column-model">
                <div style="font-weight: ${isTopPerformer ? '600' : '500'};">
                    ${row.model}
                </div>
                ${isTopPerformer ? '<div style="font-size: 0.75rem; color: var(--accent-secondary);">Top Performer</div>' : ''}
            </td>
            <td class="table-column-score">
                ${parseFloat(row.overall_score).toFixed(2)}
            </td>
            <td class="table-column-date">
                ${row.date || 'N/A'}
            </td>
            <td class="table-column-actions">
                <button class="view-details-btn" onclick="event.stopPropagation(); showModelDetails('${row.model}')">
                    View
                </button>
            </td>
        `;
        
        leaderboardBody.appendChild(tr);
    });
}

function showModelDetails(modelName) {
    const state = store.getState();
    const model = state.leaderboardData.find(m => m.model === modelName);
    
    if (model) {
        const title = `Model Details: ${modelName}`;
        const children = `
            <div class="modal-section">
                <h4>Overall Score</h4>
                <p>${parseFloat(model.overall_score).toFixed(2)}/100</p>
            </div>
            <div class="modal-section">
                <h4>Breakdown</h4>
                <ul style="margin: 0; padding: 0;">
                    <li style="margin-bottom: 0.5rem;">Design: ${model.design || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Architecture: ${model.architecture || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Code Quality: ${model.code_quality || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Feature Complete: ${model.feature_complete || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Performance: ${model.performance || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Accessibility: ${model.accessibility || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Best Practices: ${model.best_practices || 0}</li>
                    <li style="margin-bottom: 0.5rem;">Value: ${model.value || 0}</li>
                </ul>
            </div>
            <div class="modal-section">
                <h4>Additional Info</h4>
                <p>Date: ${model.date || 'N/A'}</p>
                <p>Speed: ${model.speed || 'N/A'}</p>
            </div>
        `;
        
        Modal({ title, children, onClose: () => {} });
    }
}

// ================================
// FEATURE: PHILOSOPHY HIGHLIGHTING
// ================================

function updatePhilosophyHighlighting() {
    const state = store.getState();
    
    if (state.selectedPhilosophyStatements.length === 0 || !state.selectedModel) {
        return;
    }
    
    const model = state.selectedModel;
    
    state.selectedPhilosophyStatements.forEach(statementId => {
        const statement = philosophyStatements.find(s => s.id === statementId);
        if (!statement) return;
        
        let criteriaMet = false;
        
        switch (statement.category) {
            case 'Practical':
                criteriaMet = (model.code_quality >= 8) && (model.feature_complete >= 8);
                break;
            case 'Philosophical':
                criteriaMet = (model.architecture >= 8);
                break;
            case 'Technical':
                criteriaMet = (model.best_practices >= 8);
                break;
        }
        
        if (criteriaMet) {
            // Could highlight something in the UI
            console.log(`Philosophy criteria met for: ${statement.text}`);
        }
    });
}

// ================================
// INITIALIZATION & SUBSCRIPTIONS
// ================================

function initializeStoreSubscriptions() {
    store.subscribe((state) => {
        // Update theme
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('gironimo-theme', state.theme);
        
        // Render components
        renderPhilosophyExplorer();
        renderLeaderboard();
        updateWorkflow();
        updateMascotBehavior();
        updatePhilosophyHighlighting();
    });
}

function setupEventListeners() {
    // Sort select
    document.getElementById('sort-select').addEventListener('change', () => {
        renderLeaderboard();
    });
    
    // Initial CSV fetch
    fetchLeaderboardData();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeStoreSubscriptions();
    setupPhilosophyFilters();
    setupWorkflowInteractions();
    setupEventListeners();
    
    // Initial render
    renderPhilosophyExplorer();
    renderLeaderboard();
    updateWorkflow();
    updateMascotBehavior();
    
    // Show welcome notification
    setTimeout(() => {
        Notification({ 
            message: 'Welcome to Gironimo! Select a model from the leaderboard to begin.',
            type: 'info'
        });
    }, 500);
});

// ================================
// GLOBAL FUNCTIONS
// ================================

// Make global functions available for onclick handlers
window.showModelDetails = showModelDetails;
