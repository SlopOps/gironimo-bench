// /docs/gironimo/js/app.js

const App = (function() {
    function init() {
        // Initialize theme
        const state = Store.getState();
        Components.ThemeProvider(state.theme);
        
        // Initialize all modules
        Mascot.init();
        Philosophy.init();
        Workflow.init();
        Leaderboard.init();
        
        // Setup global event listeners
        setupEventListeners();
        
        // Subscribe to store updates
        Store.subscribe(handleStateChange);
    }
    
    function setupEventListeners() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            Store.dispatch({ type: Store.ACTIONS.TOGGLE_THEME });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // ESC to close modal
            if (e.key === 'Escape') {
                const overlay = document.getElementById('modal-overlay');
                if (!overlay.classList.contains('hidden')) {
                    overlay.classList.add('hidden');
                }
            }
        });
        
        // Window resize for canvas
        window.addEventListener('resize', () => {
            Mascot.resize();
        });
        
        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause expensive operations
            } else {
                // Resume
            }
        });
    }
    
    function handleStateChange(state, prevState) {
        // Theme changes
        if (state.theme !== prevState.theme) {
            Components.ThemeProvider(state.theme);
            const icon = document.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
            }
        }
        
        // Philosophy selection changes
        if (state.selectedPhilosophyStatements !== prevState.selectedPhilosophyStatements) {
            Philosophy.render();
            Leaderboard.render(); // Re-render for highlighting
        }
        
        // Model selection changes
        if (state.selectedModel !== prevState.selectedModel) {
            Workflow.render();
            Leaderboard.render(); // Update selection highlight
        }
        
        // Workflow state changes
        if (state.workflowState !== prevState.workflowState) {
            Workflow.render();
        }
        
        // Notification changes
        if (state.notification !== prevState.notification) {
            const container = document.getElementById('notification-container');
            container.innerHTML = '';
            
            if (state.notification) {
                Components.Notification(state.notification);
            }
        }
        
        // Mascot state update
        Mascot.updateState(state, prevState);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    return {
        init
    };
})();
