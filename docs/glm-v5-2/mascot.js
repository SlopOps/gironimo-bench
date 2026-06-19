// mascot.js
// Interactive Mascot System

const Mascot = {
    createSVG() {
        return `
            <svg class="giraffe-svg" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
                <g class="giraffe-head-group">
                    <!-- Head -->
                    <ellipse class="giraffe-body giraffe-head" cx="75" cy="40" rx="15" ry="20" />
                    <!-- Snout -->
                    <ellipse class="giraffe-body" cx="85" cy="45" rx="8" ry="10" />
                    <!-- Eye -->
                    <circle class="giraffe-eye" cx="78" cy="35" r="2" />
                    <!-- Horns -->
                    <line x1="70" y1="22" x2="68" y2="12" stroke="#8b4513" stroke-width="3" stroke-linecap="round"/>
                    <line x1="80" y1="22" x2="82" y2="12" stroke="#8b4513" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="68" cy="11" r="3" fill="#8b4513" />
                    <circle cx="82" cy="11" r="3" fill="#8b4513" />
                </g>
                
                <!-- Neck -->
                <path class="giraffe-body" d="M 65 50 Q 50 80, 55 110 L 70 110 Q 75 80, 85 50 Z" />
                
                <!-- Body -->
                <rect class="giraffe-body" x="45" y="100" width="40" height="35" rx="5" />
                
                <!-- Legs -->
                <rect class="giraffe-body" x="48" y="130" width="8" height="20" />
                <rect class="giraffe-body" x="74" y="130" width="8" height="20" />
                
                <!-- Spots -->
                <circle class="giraffe-spot" cx="55" cy="115" r="4" />
                <circle class="giraffe-spot" cx="70" cy="120" r="5" />
                <circle class="giraffe-spot" cx="60" cy="90" r="4" />
                <circle class="giraffe-spot" cx="72" cy="75" r="3" />
                
                <!-- Tail -->
                <path d="M 45 115 Q 35 125, 40 135" fill="none" stroke="#8b4513" stroke-width="2" />
            </svg>
        `;
    },

    render(container, state) {
        if (!container) return;
        
        // Determine state
        let stateClass = 'mascot-state-idle';
        
        if (state.selectedPhilosophyStatements.length > 0 && !state.selectedModel) {
            stateClass = 'mascot-state-philosophy';
        } else if (state.selectedModel) {
            stateClass = 'mascot-state-model';
        } else if (state.workflowState.hoverStage) {
            stateClass = 'mascot-state-workflow';
        }
        
        // Theme transition reaction
        const isDark = state.theme === 'dark';
        const transitionClass = isDark ? 'theme-dark' : 'theme-light';
        
        container.className = `mascot-state ${stateClass} ${transitionClass}`;
        
        // Only render SVG once or if theme changes drastically
        if (!container.querySelector('svg')) {
            container.innerHTML = this.createSVG();
        }
        
        // Adjust colors based on theme
        const body = container.querySelector('.giraffe-body');
        if (body) {
            body.style.fill = isDark ? '#c97b50' : '#f4a261';
        }
    }
};
