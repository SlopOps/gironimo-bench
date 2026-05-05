// Philosophy Explorer Feature
const GironimoPhilosophy = (function() {
    'use strict';
    
    const philosophyStatements = [
        { category: 'Practical', statement: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
        { category: 'Practical', statement: 'Human gates at specification and architecture catch expensive mistakes early' },
        { category: 'Philosophical', statement: 'AI amplifies human judgment; it doesn\'t replace it' },
        { category: 'Philosophical', statement: 'Stand tall. See far. Move deliberately' },
        { category: 'Technical', statement: 'Two-model critique catches what single-model confidence misses' },
        { category: 'Technical', statement: 'Documentation is auto-drafted because it fails when it\'s optional' },
        { category: 'Technical', statement: 'Own your infrastructure. Own your data' }
    ];
    
    // Get unique categories
    function getCategories() {
        return [...new Set(philosophyStatements.map(s => s.category))];
    }
    
    // Render philosophy explorer
    function render(container) {
        const state = GironimoStore.getState();
        const selected = state.selectedPhilosophyStatements;
        const categories = getCategories();
        
        container.innerHTML = '';
        
        // Create category filter buttons
        const filterContainer = document.createElement('div');
        filterContainer.className = 'philosophy-filters';
        filterContainer.setAttribute('role', 'group');
        filterContainer.setAttribute('aria-label', 'Filter by category');
        
        const allButton = GironimoComponents.createButton({
            text: 'All',
            variant: 'secondary',
            size: 'small',
            onClick: () => showAllCategories(container)
        });
        filterContainer.appendChild(allButton);
        
        categories.forEach(category => {
            const button = GironimoComponents.createButton({
                text: category,
                variant: 'secondary',
                size: 'small',
                onClick: () => filterByCategory(container, category)
            });
            filterContainer.appendChild(button);
        });
        
        // Create statements list
        const statementsContainer = document.createElement('div');
        statementsContainer.className = 'philosophy-statements';
        statementsContainer.setAttribute('role', 'listbox');
        statementsContainer.setAttribute('aria-label', 'Philosophy statements');
        statementsContainer.setAttribute('aria-multiselectable', 'true');
        
        philosophyStatements.forEach((item, index) => {
            const statementEl = document.createElement('div');
            statementEl.className = 'philosophy-statement';
            statementEl.setAttribute('role', 'option');
            statementEl.setAttribute('aria-selected', selected.includes(item.statement));
            
            const isSelected = selected.includes(item.statement);
            if (isSelected) {
                statementEl.classList.add('selected');
            }
            
            const categoryBadge = document.createElement('span');
            categoryBadge.className = `badge badge-${item.category.toLowerCase()}`;
            categoryBadge.textContent = item.category;
            
            const text = document.createElement('p');
            text.className = 'statement-text';
            text.textContent = item.statement;
            
            statementEl.appendChild(categoryBadge);
            statementEl.appendChild(text);
            
            statementEl.addEventListener('click', () => {
                GironimoStore.dispatch({
                    type: 'TOGGLE_PHILOSOPHY_STATEMENT',
                    payload: item.statement
                });
                render(container); // Re-render
            });
            
            statementEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    GironimoStore.dispatch({
                        type: 'TOGGLE_PHILOSOPHY_STATEMENT',
                        payload: item.statement
                    });
                    render(container);
                }
            });
            
            statementsContainer.appendChild(statementEl);
        });
        
        const card = GironimoComponents.createCard({
            title: 'Philosophy Explorer',
            content: statementsContainer,
            headerActions: filterContainer
        });
        
        container.appendChild(card);
    }
    
    function showAllCategories(container) {
        const statements = container.querySelectorAll('.philosophy-statement');
        statements.forEach(s => s.style.display = '');
    }
    
    function filterByCategory(container, category) {
        const statements = container.querySelectorAll('.philosophy-statement');
        statements.forEach(s => {
            const badge = s.querySelector('.badge');
            if (badge && badge.textContent === category) {
                s.style.display = '';
            } else {
                s.style.display = 'none';
            }
        });
    }
    
    return {
        render,
        philosophyStatements,
        getCategories
    };
})();
