// /docs/gironimo/js/philosophy.js

const Philosophy = (function() {
    const statements = [
        {
            statement: "Five minutes of correct work beats thirty seconds of plausible garbage",
            category: "Practical"
        },
        {
            statement: "Human gates at specification and architecture catch expensive mistakes early",
            category: "Practical"
        },
        {
            statement: "AI amplifies human judgment; it doesn't replace it",
            category: "Philosophical"
        },
        {
            statement: "Stand tall. See far. Move deliberately",
            category: "Philosophical"
        },
        {
            statement: "Two-model critique catches what single-model confidence misses",
            category: "Technical"
        },
        {
            statement: "Documentation is auto-drafted because it fails when it's optional",
            category: "Technical"
        },
        {
            statement: "Own your infrastructure. Own your data",
            category: "Technical"
        }
    ];
    
    let currentFilter = 'all';
    
    function init() {
        render();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Category filters
        document.getElementById('category-filters').addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const category = e.target.dataset.category;
                currentFilter = category;
                
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.category === category);
                });
                
                render();
            }
        });
    }
    
    function render() {
        const container = document.getElementById('statements-list');
        container.innerHTML = '';
        
        const filtered = currentFilter === 'all' 
            ? statements 
            : statements.filter(s => s.category === currentFilter);
        
        const state = Store.getState();
        const selectedStatements = state.selectedPhilosophyStatements;
        
        filtered.forEach((item, index) => {
            const isSelected = selectedStatements.some(s => s.statement === item.statement);
            
            const card = document.createElement('div');
            card.className = `statement-card ${isSelected ? 'selected' : ''}`;
            card.tabIndex = 0;
            card.setAttribute('role', 'checkbox');
            card.setAttribute('aria-checked', isSelected);
            
            const category = document.createElement('span');
            category.className = `statement-category ${item.category.toLowerCase()}`;
            category.textContent = item.category;
            
            const text = document.createElement('p');
            text.className = 'statement-text';
            text.textContent = item.statement;
            
            card.appendChild(category);
            card.appendChild(text);
            
            // Click to toggle
            const toggleHandler = () => {
                Store.dispatch({
                    type: Store.ACTIONS.TOGGLE_PHILOSOPHY_STATEMENT,
                    payload: item
                });
            };
            
            card.addEventListener('click', toggleHandler);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleHandler();
                }
            });
            
            container.appendChild(card);
        });
    }
    
    function getStatements() {
        return statements;
    }
    
    function checkHighlight(model, selectedPhilosophies) {
        if (!model || selectedPhilosophies.length === 0) return null;
        
        const codeQuality = parseFloat(model.code_quality) || 0;
        const featureComplete = parseFloat(model.feature_complete) || 0;
        const architecture = parseFloat(model.architecture) || 0;
        const bestPractices = parseFloat(model.best_practices) || 0;
        
        for (const phil of selectedPhilosophies) {
            switch (phil.category) {
                case 'Practical':
                    if (codeQuality >= 8 && featureComplete >= 8) return 'practical';
                    break;
                case 'Philosophical':
                    if (architecture >= 8) return 'philosophical';
                    break;
                case 'Technical':
                    if (bestPractices >= 8) return 'technical';
                    break;
            }
        }
        return null;
    }
    
    return {
        init,
        render,
        getStatements,
        checkHighlight
    };
})();
