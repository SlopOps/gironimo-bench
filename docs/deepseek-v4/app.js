// Main Application Controller
const GironimoApp = (function() {
    'use strict';
    
    let unsubscribe = null;
    
    // Initialize application
    async function init() {
        try {
            // Apply theme
            const initialTheme = GironimoStore.getState().theme;
            GironimoComponents.applyTheme(initialTheme);
            
            // Setup theme toggle
            setupThemeToggle();
            
            // Initialize mascot
            const mascotContainer = document.getElementById('mascotContainer');
            GironimoMascot.init(mascotContainer);
            
            // Render initial components
            renderAll();
            
            // Subscribe to store changes
            unsubscribe = GironimoStore.subscribe((state, action) => {
                // Atomic update - re-render all affected components in one tick
                requestAnimationFrame(() => {
                    renderAll();
                });
            });
            
            // Fetch leaderboard data
            await GironimoLeaderboard.fetchLeaderboardData();
            
        } catch (error) {
            console.error('Application initialization error:', error);
            showErrorNotification('Failed to initialize application');
        }
    }
    
    // Render all components
    function renderAll() {
        try {
            // Render philosophy explorer
            const philosophyContainer = document.getElementById('philosophyExplorer');
            if (philosophyContainer) {
                GironimoPhilosophy.render(philosophyContainer);
            }
            
            // Render workflow
            const workflowContainer = document.getElementById('workflowSystem');
            if (workflowContainer) {
                GironimoWorkflow.render(workflowContainer);
            }
            
            // Render leaderboard
            const leaderboardContainer = document.getElementById('leaderboard');
            if (leaderboardContainer) {
                GironimoLeaderboard.render(leaderboardContainer);
            }
            
            // Render notifications
            renderNotifications();
            
        } catch (error) {
            console.error('Render error:', error);
        }
    }
    
    // Setup theme toggle
    function setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentState = GironimoStore.getState();
                const newTheme = currentState.theme === 'light' ? 'dark' : 'light';
                
                GironimoStore.dispatch({
                    type: 'SET_THEME',
                    payload: newTheme
                });
                
                GironimoComponents.applyTheme(newTheme);
            });
        }
    }
    
    // Render notifications
    function renderNotifications() {
        const container = document.getElementById('notificationContainer');
        const state = GironimoStore.getState();
        
        if (!container) return;
        
        // Clear expired notifications
        const activeNotifications = state.notifications.filter(n => {
            const age = Date.now() - n.id;
            return age < 5000; // 5 seconds
        });
        
        // Render active notifications
        activeNotifications.forEach(notification => {
            // Check if already rendered
            const existingEl = document.getElementById(`notification-${notification.id}`);
            if (existingEl) return;
            
            const notificationEl = GironimoComponents.createNotification({
                message: notification.message,
                type: notification.type,
                onDismiss: () => {
                    GironimoStore.dispatch({
                        type: 'REMOVE_NOTIFICATION',
                        payload: notification.id
                    });
                }
            });
            
            notificationEl.id = `notification-${notification.id}`;
            container.appendChild(notificationEl);
        });
    }
    
    // Show error notification
    function showErrorNotification(message) {
        GironimoStore.dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
                message: message,
                type: 'error'
            }
        });
    }
    
    // Cleanup
    function destroy() {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Cleanup on page unload
    window.addEventListener('unload', destroy);
    
    return {
        init,
        destroy,
        showErrorNotification
    };
})();
