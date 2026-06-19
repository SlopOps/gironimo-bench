// app.js
// Main Application Logic and Store Integration

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme
    document.documentElement.setAttribute('data-theme', GironimoStore.getState().theme);
    
    // Fetch CSV Data
    fetchLeaderboard();
    
    // Subscribe render to store
    GironimoStore.subscribe(render);
    
    // Initial render
    render();
});

async function fetchLeaderboard() {
    try {
        // Runtime CSV URL as per spec
        const response = await fetch('/results/leaderboard.csv');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const text = await response.text();
        const data = parseCSV(text);
        
        if (data.length === 0) {
            GironimoStore.dispatch({ type: 'LOAD_CSV_FAIL' });
        } else {
            GironimoStore.dispatch({ type: 'LOAD_CSV_SUCCESS', payload: data });
        }
    } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        GironimoStore.dispatch({ type: 'LOAD_CSV_FAIL' });
    }
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    const numericFields = ['speed', 'one_shot_attempts', 'design', 'architecture', 'code_quality', 'feature_complete', 'performance', 'accessibility', 'best_practices', 'value', 'overall_score'];
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        if (values.length !== headers.length) return null;
        
        const row = {};
        headers.forEach((h, i) => {
            if (numericFields.includes(h)) {
                row[h] = parseFloat(values[i]) || 0;
            } else {
                row[h] = values[i] || '';
            }
        });
        
        return row;
    }).filter(Boolean);
}

function render() {
    const state = GironimoStore.getState();
    
    // Theme application
    document.documentElement.setAttribute('data-theme', state.theme);
    
    // Render all sections
    renderHeader(state);
    renderMascot(state);
    renderWorkflow(state);
    renderLeaderboard(state);
    renderPhilosophy(state);
    renderModal(state);
    renderNotifications(state);
}

function renderHeader(state) {
    const container = document.getElementById('theme-toggle-container');
    container.innerHTML = '';
    container.appendChild(
        Components.ThemeToggle(state.theme, () => {
            GironimoStore.dispatch({
                type: 'SET_THEME',
                payload: state.theme === 'light' ? 'dark' : 'light'
            });
        })
    );
}

function renderMascot(state) {
    const container = document.getElementById('mascot-container');
    Mascot.render(container, state);
}

function renderWorkflow(state) {
    const container = document.getElementById('workflow-container');
    container.innerHTML = '';
    
    const stages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];
    const maxStage = getWorkflowMaxStage(state.selectedModel);
    
    const stagesDiv = document.createElement('div');
    stagesDiv.className = 'workflow-stages';
    
    stages.forEach((stage, index) => {
        const stageDiv = document.createElement('div');
        stageDiv.className = 'workflow-stage';
        
        if (state.selectedModel) {
            if (index <= maxStage) {
                stageDiv.classList.add('completed');
            } else {
                stageDiv.classList.add('blocked');
            }
        } else {
            stageDiv.classList.add('blocked');
        }
        
        stageDiv.innerHTML = `<strong>${stage}</strong><br><small>Stage ${index + 1}</small>`;
        
        if (index <= maxStage && state.selectedModel) {
            stageDiv.addEventListener('click', () => {
                GironimoStore.dispatch({
                    type: 'OPEN_MODAL',
                    payload: { type: 'workflow', data: { stage, index, model: state.selectedModel } }
                });
            });
        }
        
        stageDiv.addEventListener('mouseenter', () => {
            GironimoStore.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: index });
        });
        
        stageDiv.addEventListener('mouseleave', () => {
            GironimoStore.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: null });
        });
        
        stagesDiv.appendChild(stageDiv);
    });
    
    container.appendChild(stagesDiv);
    
    if (!state.selectedModel) {
        const hint = document.createElement('p');
        hint.style.color = 'var(--text-secondary)';
        hint.style.fontSize = '0.9rem';
        hint.style.marginTop = '1rem';
        hint.textContent = 'Select a model to view workflow progression.';
        container.appendChild(hint);
    }
}

function getWorkflowMaxStage(model) {
    if (!model) return -1;
    const score = model.overall_score;
    if (score >= 90) return 6; // ADR
    if (score >= 70) return 4; // Implementation
    return 2; // Architecture
}

function renderLeaderboard(state) {
    const container = document.getElementById('leaderboard-container');
    const controls = document.getElementById('leaderboard-controls');
    container.innerHTML = '';
    controls.innerHTML = '';
    
    if (state.leaderboardStatus === 'error') {
        container.innerHTML = '<p style="color: var(--danger-color);">Failed to load leaderboard data. Please ensure the CSV is available.</p>';
        return;
    }
    
    if (state.leaderboardData.length === 0) {
        container.innerHTML = '<p>Loading leaderboard...</p>';
        return;
    }
    
    // Sorting controls
    const sortBtnContainer = document.createElement('div');
    sortBtnContainer.style.display = 'flex';
    sortBtnContainer.style.gap = '0.5rem';
    
    const sortOptions = [
        { key: 'overall_score', label: 'Sort by Score' },
        { key: 'date', label: 'Sort by Date' },
        { key: 'model', label: 'Sort Alphabetically' }
    ];
    
    sortOptions.forEach(opt => {
        const btn = Components.Button({
            text: opt.label,
            variant: state.sortConfig.key === opt.key ? 'primary' : 'secondary',
            onClick: () => {
                GironimoStore.dispatch({
                    type: 'SET_SORT',
                    payload: { key: opt.key, direction: state.sortConfig.key === opt.key && state.sortConfig.direction === 'desc' ? 'asc' : 'desc' }
                });
            }
        });
        sortBtnContainer.appendChild(btn);
    });
    
    controls.appendChild(sortBtnContainer);
    
    // Derived sorting (not stored in state)
    const sortedData = [...state.leaderboardData].sort((a, b) => {
        let valA = a[state.sortConfig.key];
        let valB = b[state.sortConfig.key];
        
        if (state.sortConfig.key === 'date') {
            valA = new Date(valA);
            valB = new Date(valB);
        } else if (state.sortConfig.key === 'model') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return state.sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return state.sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    // Find top performer
    const topScore = Math.max(...state.leaderboardData.map(m => m.overall_score));
    
    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Model</th>
                <th>Date</th>
                <th>Score</th>
                <th>Speed</th>
                <th>Quality</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    
    const tbody = table.querySelector('tbody');
    
    sortedData.forEach(model => {
        const tr = document.createElement('tr');
        
        if (state.selectedModel && state.selectedModel.model === model.model) {
            tr.classList.add('selected');
        }
        
        if (model.overall_score === topScore) {
            tr.classList.add('top-performer');
        }
        
        // Philosophy highlighting logic
        const isHighlighted = checkPhilosophyHighlight(model, state.selectedPhilosophyStatements);
        if (isHighlighted) {
            tr.style.backgroundColor = 'var(--bg-accent)';
            tr.style.borderLeft = '4px solid var(--success-color)';
        }
        
        tr.innerHTML = `
            <td>${model.model}</td>
            <td>${model.date}</td>
            <td><strong>${model.overall_score}</strong></td>
            <td>${model.speed}</td>
            <td>${model.code_quality}</td>
        `;
        
        tr.addEventListener('click', () => {
            GironimoStore.dispatch({ type: 'SELECT_MODEL', payload: model });
        });
        
        tbody.appendChild(tr);
    });
    
    container.appendChild(table);
}

function checkPhilosophyHighlight(model, selectedPhilosophies) {
    if (!selectedPhilosophies || selectedPhilosophies.length === 0) return false;
    
    // Check categories
    const hasPractical = selectedPhilosophies.some(s => s.includes('Five minutes') || s.includes('Human gates'));
    const hasPhilosophical = selectedPhilosophies.some(s => s.includes('AI amplifies') || s.includes('Stand tall'));
    const hasTechnical = selectedPhilosophies.some(s => s.includes('Two-model') || s.includes('Documentation') || s.includes('Own your'));
    
    if (hasPractical && model.code_quality >= 8 && model.feature_complete >= 8) return true;
    if (hasPhilosophical && model.architecture >= 8) return true;
    if (hasTechnical && model.best_practices >= 8) return true;
    
    return false;
}

function renderPhilosophy(state) {
    const container = document.getElementById('philosophy-container');
    const filters = document.getElementById('philosophy-filters');
    container.innerHTML = '';
    filters.innerHTML = '';
    
    const categories = ['all', 'Practical', 'Philosophical', 'Technical'];
    
    categories.forEach(cat => {
        const btn = Components.Button({
            text: cat.charAt(0).toUpperCase() + cat.slice(1),
            variant: state.philosophyFilter === cat ? 'primary' : 'secondary',
            onClick: () => {
                GironimoStore.dispatch({ type: 'SET_PHILOSOPHY_FILTER', payload: cat });
            }
        });
        filters.appendChild(btn);
    });
    
    const statements = [
        { category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
        { category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
        { category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
        { category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
        { category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
        { category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
        { category: 'Technical', text: 'Own your infrastructure. Own your data' }
    ];
    
    const filteredStatements = state.philosophyFilter === 'all' 
        ? statements 
        : statements.filter(s => s.category === state.philosophyFilter);
    
    filteredStatements.forEach(stmt => {
        const isSelected = state.selectedPhilosophyStatements.includes(stmt.text);
        
        const item = document.createElement('div');
        item.className = 'philosophy-item';
        
        item.innerHTML = `
            <input type="checkbox" id="phil-${stmt.text.replace(/\s/g, '')}" ${isSelected ? 'checked' : ''}>
            <div>
                <strong>${stmt.category}</strong><br>
                <label for="phil-${stmt.text.replace(/\s/g, '')}">${stmt.text}</label>
            </div>
        `;
        
        item.querySelector('input').addEventListener('change', (e) => {
            GironimoStore.dispatch({
                type: 'TOGGLE_PHILOSOPHY',
                payload: stmt.text
            });
        });
        
        container.appendChild(item);
    });
}

function renderModal(state) {
    const root = document.getElementById('modal-root');
    root.innerHTML = '';
    
    if (!state.modalState.isOpen) return;
    
    if (state.modalState.type === 'workflow') {
        const { stage, index, model } = state.modalState.payload;
        const content = `
            <p><strong>Stage:</strong> ${stage} (${index + 1}/7)</p>
            <p><strong>Model:</strong> ${model.model}</p>
            <p><strong>Overall Score:</strong> ${model.overall_score}</p>
            <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
            <h4>Philosophy Context</h4>
            ${GironimoStore.getState().selectedPhilosophyStatements.length > 0 
                ? `<ul>${GironimoStore.getState().selectedPhilosophyStatements.map(p => `<li>${p}</li>`).join('')}</ul>`
                : '<p>No philosophy statements selected.</p>'}
        `;
        
        const modal = Components.Modal({
            title: `Workflow Stage: ${stage}`,
            content: content,
            onClose: () => GironimoStore.dispatch({ type: 'CLOSE_MODAL' })
        });
        
        root.appendChild(modal);
    }
}

function renderNotifications(state) {
    const container = document.getElementById('notification-container');
    container.innerHTML = '';
    
    if (state.notification.visible) {
        const notif = Components.Notification({
            message: state.notification.message,
            onClose: () => GironimoStore.dispatch({ type: 'HIDE_NOTIFICATION' })
        });
        container.appendChild(notif);
    }
}
