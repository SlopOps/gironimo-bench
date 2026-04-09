/**
 * INTERACTIVE MASCOT (GIRAFFE)
 * Uses a behavior state machine driven by the store.
 */
class Mascot {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = 'idle'; // idle | excited | focused | curious
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <svg class="giraffe-svg" width="50" height="50" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#f4d35e" />
                <circle cx="70" cy="35" r="5" fill="black" /> <!-- Eye -->
                <path d="M 40 70 Q 50 80 60 70" stroke="black" fill="transparent" /> <!-- Smile -->
            </svg>
        `;
        this.el = this.container.querySelector('.giraffe-svg');
    }

    // React to store changes
    update(state) {
        this.applyBehavior(state);
    }

    applyBehavior(state) {
        // Behavior Tree logic
        let transform = 'scale(1) rotate(0deg)';
        
        // 1. Theme change reaction
        const scale = state.theme === 'dark' ? 0.9 : 1.0;

        // 2. Philosophy selection (Focus/Curious)
        const philosophyCount = state.selectedPhilosophyStatements.length;
        let rotation = 0;

        if (philosophyCount > 0) {
            rotation = 10; // "Orients" toward selection
        }

        // 3. Model selection (Excited)
        let bounce = 0;
        if (state.selectedModel) {
            bounce = 5;
        }

        // Apply atomic transformation
        this.el.style.transform = `scale(${scale}) rotate(${rotation}deg) translateY(${-bounce}px)`;
    }
}
