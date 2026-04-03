// /docs/gironimo/js/leaderboard.js

const Leaderboard = (function() {
    const CSV_URL = '/results/leaderboard.csv';
    
    function init() {
        loadData();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Sort select
        document.getElementById('sort-select').addEventListener('change', (e) => {
            Store.dispatch({
                type: Store.ACTIONS.SET_LEADERBOARD_SORT,
                payload: e.target.value
            });
            render();
        });
        
        // Row selection
        document.getElementById('leaderboard-body').addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row && row.dataset.model) {
                const state = Store.getState();
                const model = state.leaderboardData.find(m => m.model === row.dataset.model);
                if (model) {
                    Store.dispatch({
                        type: Store.ACTIONS.SELECT_MODEL,
                        payload: model
                    });
                    
                    // Show notification
                    Store.dispatch({
                        type: Store.ACTIONS.SHOW_NOTIFICATION,
                        payload: {
                            title: 'Model Selected',
                            message: `${model.model} selected with score ${model.overall_score}`,
                            type: 'success'
                        }
                    });
                    
                    // Auto-clear notification
                    setTimeout(() => {
                        Store.dispatch({
                            type: Store.ACTIONS.CLEAR_NOTIFICATION
                        });
                    }, 3000);
                }
            }
        });
    }
    
    async function loadData() {
        try {
            const response = await fetch(CSV_URL);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            const data = parseCSV(csvText);
            
            Store.dispatch({
                type: Store.ACTIONS.SET_LEADERBOARD_DATA,
                payload: data
            });
            
            render();
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            Store.dispatch({
                type: Store.ACTIONS.SET_LEADERBOARD_ERROR,
                payload: error.message
            });
            renderError(error.message);
        }
    }
    
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length !== headers.length) continue; // Skip invalid rows
            
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index]?.trim();
                // Parse numbers, default to 0 for missing numeric values
                if (['speed', 'one_shot_attempts', 'design', 'architecture', 
                     'code_quality', 'feature_complete', 'performance', 
                     'accessibility', 'best_practices', 'value', 'overall_score'].includes(header)) {
                    row[header] = value ? parseFloat(value) : 0;
                } else {
                    row[header] = value || '';
                }
            });
            
            data.push(row);
        }
        
        return data;
    }
    
    function getSortedData() {
        const state = Store.getState();
        const { leaderboardData, leaderboardSort } = state;
        
        return [...leaderboardData].sort((a, b) => {
            switch (leaderboardSort) {
                case 'overall_score':
                    return (b.overall_score || 0) - (a.overall_score || 0);
                case 'date':
                    return new Date(b.date || 0) - new Date(a.date || 0);
                case 'model':
                    return (a.model || '').localeCompare(b.model || '');
                default:
                    return 0;
            }
        });
    }
    
    function render() {
        const tbody = document.getElementById('leaderboard-body');
        const errorEl = document.getElementById('leaderboard-error');
        const state = Store.getState();
        
        // Hide error
        errorEl.classList.add('hidden');
        
        const data = getSortedData();
        const { selectedModel, selectedPhilosophyStatements } = state;
        
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="4" style="text-align: center; color: var(--color-text-secondary);">No data available</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Find top performer
        const topPerformer = data.reduce((max, m) => 
            (m.overall_score || 0) > (max.overall_score || 0) ? m : max, data[0]);
        
        data.forEach((model, index) => {
            const isSelected = selectedModel && selectedModel.model === model.model;
            const isTopPerformer = model.model === topPerformer.model;
            
            // Check philosophy highlighting
            const highlight = Philosophy.checkHighlight(model, selectedPhilosophyStatements);
            
            const row = document.createElement('tr');
            row.className = `
                ${isSelected ? 'selected' : ''} 
                ${isTopPerformer ? 'top-performer' : ''}
                ${highlight ? `highlight-${highlight}` : ''}
            `.trim();
            row.dataset.model = model.model;
            row.tabIndex = 0;
            
            row.innerHTML = `
                <td class="rank-cell">${index + 1}</td>
                <td>${model.model}</td>
                <td class="score-cell">${model.overall_score.toFixed(1)}</td>
                <td>${model.date || 'N/A'}</td>
            `;
            
            tbody.appendChild(row);
        });
    }
    
    function renderError(message) {
        const tbody = document.getElementById('leaderboard-body');
        const errorEl = document.getElementById('leaderboard-error');
        
        tbody.innerHTML = '';
        errorEl.textContent = `Failed to load leaderboard: ${message}. Please ensure the CSV file is available at ${CSV_URL}`;
        errorEl.classList.remove('hidden');
    }
    
    return {
        init,
        loadData,
        render
    };
})();
