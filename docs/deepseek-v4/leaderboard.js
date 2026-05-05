// Leaderboard Feature (CSV-driven)
const GironimoLeaderboard = (function() {
    'use strict';
    
    let csvData = [];
    let sortConfig = { field: 'overall_score', direction: 'desc' };
    
    // Parse CSV data
    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            
            // Skip empty or invalid rows
            if (values.length < headers.length) continue;
            
            const row = {};
            let isValid = true;
            
            headers.forEach((header, index) => {
                const value = values[index] || '0';
                
                // Convert numeric fields
                const numericFields = ['speed', 'one_shot_attempts', 'design', 'architecture', 
                                     'code_quality', 'feature_complete', 'performance', 
                                     'accessibility', 'best_practices', 'value', 'overall_score'];
                
                if (numericFields.includes(header)) {
                    const num = parseFloat(value);
                    row[header] = isNaN(num) ? 0 : num;
                } else {
                    row[header] = value;
                }
            });
            
            // Only add if model name exists
            if (row.model) {
                data.push(row);
            }
        }
        
        return data;
    }
    
    // Fetch leaderboard data
    async function fetchLeaderboardData() {
        try {
            const response = await fetch('/results/leaderboard.csv');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            const parsedData = parseCSV(csvText);
            
            if (parsedData.length === 0) {
                throw new Error('No valid data found in CSV');
            }
            
            GironimoStore.dispatch({
                type: 'SET_LEADERBOARD_DATA',
                payload: parsedData
            });
            
            return parsedData;
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            
            // Dispatch empty data on error
            GironimoStore.dispatch({
                type: 'SET_LEADERBOARD_DATA',
                payload: []
            });
            
            // Show notification
            GironimoStore.dispatch({
                type: 'ADD_NOTIFICATION',
                payload: {
                    message: 'Failed to load leaderboard data. Please try again later.',
                    type: 'error'
                }
            });
            
            return [];
        }
    }
    
    // Get derived leaderboard data (sorted, filtered)
    function getDerivedData(state) {
        const data = state.leaderboardData;
        const selectedPhilosophy = state.selectedPhilosophyStatements;
        const selectedModel = state.selectedModel;
        
        // Apply sorting
        let sortedData = [...data].sort((a, b) => {
            let aVal, bVal;
            
            switch (sortConfig.field) {
                case 'overall_score':
                    aVal = a.overall_score || 0;
                    bVal = b.overall_score || 0;
                    break;
                case 'date':
                    aVal = new Date(a.date || 0).getTime();
                    bVal = new Date(b.date || 0).getTime();
                    break;
                case 'model':
                    aVal = (a.model || '').toLowerCase();
                    bVal = (b.model || '').toLowerCase();
                    break;
                default:
                    aVal = a[sortConfig.field] || 0;
                    bVal = b[sortConfig.field] || 0;
            }
            
            if (sortConfig.direction === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
        
        // Find top performer
        const topPerformer = sortedData.length > 0 ? sortedData[0] : null;
        
        // Determine highlighted rows based on philosophy
        const highlightedModels = new Set();
        
        if (selectedPhilosophy.length > 0) {
            sortedData.forEach(model => {
                let shouldHighlight = false;
                
                selectedPhilosophy.forEach(statement => {
                    const category = getStatementCategory(statement);
                    
                    switch (category) {
                        case 'Practical':
                            if ((model.code_quality || 0) >= 8 && (model.feature_complete || 0) >= 8) {
                                shouldHighlight = true;
                            }
                            break;
                        case 'Philosophical':
                            if ((model.architecture || 0) >= 8) {
                                shouldHighlight = true;
                            }
                            break;
                        case 'Technical':
                            if ((model.best_practices || 0) >= 8) {
                                shouldHighlight = true;
                            }
                            break;
                    }
                });
                
                if (shouldHighlight) {
                    highlightedModels.add(model.model);
                }
            });
        }
        
        return {
            sortedData,
            topPerformer,
            highlightedModels: Array.from(highlightedModels),
            selectedModel: selectedModel ? selectedModel.model : null
        };
    }
    
    // Get category for a philosophy statement
    function getStatementCategory(statement) {
        const statements = GironimoPhilosophy.philosophyStatements;
        const found = statements.find(s => s.statement === statement);
        return found ? found.category : null;
    }
    
    // Render leaderboard
    function render(container) {
        const state = GironimoStore.getState();
        const derivedData = getDerivedData(state);
        
        container.innerHTML = '';
        
        // Create sort controls
        const controlsEl = document.createElement('div');
        controlsEl.className = 'leaderboard-controls';
        
        const sortButtons = [
            { label: 'Score', field: 'overall_score' },
            { label: 'Date', field: 'date' },
            { label: 'Name', field: 'model' }
        ];
        
        sortButtons.forEach(btn => {
            const isActive = sortConfig.field === btn.field;
            const button = GironimoComponents.createButton({
                text: `${btn.label} ${isActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}`,
                variant: isActive ? 'primary' : 'secondary',
                size: 'small',
                onClick: () => {
                    if (sortConfig.field === btn.field) {
                        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortConfig.field = btn.field;
                        sortConfig.direction = 'desc';
                    }
                    render(container);
                }
            });
            controlsEl.appendChild(button);
        });
        
        // Create table
        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';
        
        if (derivedData.sortedData.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No leaderboard data available';
            tableContainer.appendChild(emptyState);
        } else {
            const table = document.createElement('table');
            table.className = 'leaderboard-table';
            table.setAttribute('role', 'grid');
            
            // Table header
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            const headers = ['Model', 'Date', 'Score', 'Speed', 'Design', 'Architecture', 
                           'Code Quality', 'Feature Complete', 'Performance', 'Accessibility', 
                           'Best Practices', 'Value'];
            
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.setAttribute('scope', 'col');
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Table body
            const tbody = document.createElement('tbody');
            
            derivedData.sortedData.forEach((model, index) => {
                const row = document.createElement('tr');
                row.setAttribute('role', 'row');
                row.setAttribute('tabindex', '0');
                
                // Highlight top performer
                if (index === 0) {
                    row.classList.add('top-performer');
                }
                
                // Highlight selected model
                if (model.model === derivedData.selectedModel) {
                    row.classList.add('selected');
                }
                
                // Highlight philosophy matches
                if (derivedData.highlightedModels.includes(model.model)) {
                    row.classList.add('philosophy-highlight');
                }
                
                // Add data cells
                const cells = [
                    model.model,
                    model.date,
                    model.overall_score,
                    model.speed,
                    model.design,
                    model.architecture,
                    model.code_quality,
                    model.feature_complete,
                    model.performance,
                    model.accessibility,
                    model.best_practices,
                    model.value
                ];
                
                cells.forEach(cell => {
                    const td = document.createElement('td');
                    td.textContent = cell || 'N/A';
                    row.appendChild(td);
                });
                
                // Row click handler
                row.addEventListener('click', () => {
                    GironimoStore.dispatch({
                        type: 'SELECT_MODEL',
                        payload: model
                    });
                    
                    // Show notification
                    GironimoStore.dispatch({
                        type: 'ADD_NOTIFICATION',
                        payload: {
                            message: `Selected model: ${model.model}`,
                            type: 'info'
                        }
                    });
                    
                    // Update workflow state based on score
                    const workflowState = GironimoWorkflow.getWorkflowState(model.overall_score);
                    GironimoStore.dispatch({
                        type: 'SET_WORKFLOW_STATE',
                        payload: workflowState
                    });
                });
                
                row.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        row.click();
                    }
                });
                
                tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            tableContainer.appendChild(table);
        }
        
        const card = GironimoComponents.createCard({
            title: 'Leaderboard',
            content: tableContainer,
            headerActions: controlsEl
        });
        
        container.appendChild(card);
    }
    
    return {
        render,
        fetchLeaderboardData,
        parseCSV,
        getDerivedData
    };
})();
