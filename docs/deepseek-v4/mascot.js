// Interactive Mascot (Giraffe) Implementation
const GironimoMascot = (function() {
    'use strict';
    
    // State machine for mascot behavior
    const MascotStates = {
        IDLE: 'idle',
        ORIENTING_PHILOSOPHY: 'orienting_philosophy',
        ORIENTING_MODEL: 'orienting_model',
        REACTING_THEME: 'reacting_theme',
        INTERACTING_WORKFLOW: 'interacting_workflow'
    };
    
    let currentState = MascotStates.IDLE;
    let animationFrame = null;
    let lastUpdate = 0;
    
    // Create mascot SVG
    function createMascotSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 200 300');
        svg.setAttribute('width', '200');
        svg.setAttribute('height', '300');
        svg.setAttribute('aria-label', 'Gironimo giraffe mascot');
        svg.setAttribute('role', 'img');
        svg.id = 'mascot-svg';
        
        // Giraffe body
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        body.setAttribute('cx', '100');
        body.setAttribute('cy', '200');
        body.setAttribute('rx', '50');
        body.setAttribute('ry', '70');
        body.setAttribute('fill', 'var(--mascot-body)');
        body.setAttribute('stroke', 'var(--mascot-outline)');
        body.setAttribute('stroke-width', '2');
        body.id = 'mascot-body';
        
        // Giraffe neck
        const neck = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        neck.setAttribute('d', 'M 120 180 Q 150 120 140 80');
        neck.setAttribute('stroke', 'var(--mascot-outline)');
        neck.setAttribute('stroke-width', '8');
        neck.setAttribute('fill', 'none');
        neck.setAttribute('stroke-linecap', 'round');
        neck.id = 'mascot-neck';
        
        // Giraffe head
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        head.setAttribute('cx', '138');
        head.setAttribute('cy', '72');
        head.setAttribute('rx', '20');
        head.setAttribute('ry', '15');
        head.setAttribute('fill', 'var(--mascot-head)');
        head.setAttribute('stroke', 'var(--mascot-outline)');
        head.setAttribute('stroke-width', '2');
        head.id = 'mascot-head';
        
        // Eyes
        const leftEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        leftEye.setAttribute('cx', '145');
        leftEye.setAttribute('cy', '70');
        leftEye.setAttribute('r', '3');
        leftEye.setAttribute('fill', 'var(--mascot-eyes)');
        leftEye.id = 'mascot-left-eye';
        
        const rightEye = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rightEye.setAttribute('cx', '135');
        rightEye.setAttribute('cy', '70');
        rightEye.setAttribute('r', '3');
        rightEye.setAttribute('fill', 'var(--mascot-eyes)');
        rightEye.id = 'mascot-right-eye';
        
        // Ossicones (horns)
        const leftHorn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftHorn.setAttribute('x1', '130');
        leftHorn.setAttribute('y1', '62');
        leftHorn.setAttribute('x2', '125');
        leftHorn.setAttribute('y2', '45');
        leftHorn.setAttribute('stroke', 'var(--mascot-outline)');
        leftHorn.setAttribute('stroke-width', '3');
        leftHorn.setAttribute('stroke-linecap', 'round');
        leftHorn.id = 'mascot-left-horn';
        
        const rightHorn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightHorn.setAttribute('x1', '145');
        rightHorn.setAttribute('y1', '62');
        rightHorn.setAttribute('x2', '150');
        rightHorn.setAttribute('y2', '45');
        rightHorn.setAttribute('stroke', 'var(--mascot-outline)');
        rightHorn.setAttribute('stroke-width', '3');
        rightHorn.setAttribute('stroke-linecap', 'round');
        rightHorn.id = 'mascot-right-horn';
        
        // Legs
        const legs = [
            { x1: 75, y1: 250, x2: 70, y2: 280 },
            { x1: 95, y1: 255, x2: 90, y2: 285 },
            { x1: 115, y1: 255, x2: 120, y2: 285 },
            { x1: 130, y1: 250, x2: 135, y2: 280 }
        ];
        
        const legElements = legs.map((leg, index) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', leg.x1);
            line.setAttribute('y1', leg.y1);
            line.setAttribute('x2', leg.x2);
            line.setAttribute('y2', leg.y2);
            line.setAttribute('stroke', 'var(--mascot-outline)');
            line.setAttribute('stroke-width', '6');
            line.setAttribute('stroke-linecap', 'round');
            line.id = `mascot-leg-${index}`;
            return line;
        });
        
        // Spots
        const spots = [
            { cx: 90, cy: 180, rx: 8, ry: 6 },
            { cx: 110, cy: 190, rx: 10, ry: 7 },
            { cx: 85, cy: 210, rx: 7, ry: 5 },
            { cx: 105, cy: 220, rx: 9, ry: 6 },
            { cx: 95, cy: 240, rx: 6, ry: 4 }
        ];
        
        const spotElements = spots.map((spot, index) => {
            const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            ellipse.setAttribute('cx', spot.cx);
            ellipse.setAttribute('cy', spot.cy);
            ellipse.setAttribute('rx', spot.rx);
            ellipse.setAttribute('ry', spot.ry);
            ellipse.setAttribute('fill', 'var(--mascot-spots)');
            ellipse.setAttribute('opacity', '0.3');
            ellipse.id = `mascot-spot-${index}`;
            return ellipse;
        });
        
        // Assemble SVG
        svg.appendChild(body);
        svg.appendChild(neck);
        spotElements.forEach(spot => svg.appendChild(spot));
        legElements.forEach(leg => svg.appendChild(leg));
        svg.appendChild(head);
        svg.appendChild(leftEye);
        svg.appendChild(rightEye);
        svg.appendChild(leftHorn);
        svg.appendChild(rightHorn);
        
        return svg;
    }
    
    // Animation functions for different states
    function animateIdle(timestamp) {
        if (!lastUpdate) lastUpdate = timestamp;
        const delta = timestamp - lastUpdate;
        
        const body = document.getElementById('mascot-body');
        const head = document.getElementById('mascot-head');
        
        if (body && head && delta > 50) {
            const bobAmount = Math.sin(timestamp * 0.002) * 3;
            body.setAttribute('transform', `translate(0, ${bobAmount})`);
            head.setAttribute('transform', `translate(0, ${bobAmount * 1.5})`);
            lastUpdate = timestamp;
        }
    }
    
    function animateOrientingPhilosophy(timestamp) {
        const head = document.getElementById('mascot-head');
        const neck = document.getElementById('mascot-neck');
        
        if (head && neck) {
            const angle = Math.sin(timestamp * 0.001) * 10;
            head.setAttribute('transform', `rotate(${angle}, 138, 72)`);
            neck.setAttribute('transform', `rotate(${angle * 0.5}, 120, 180)`);
        }
    }
    
    function animateOrientingModel(timestamp) {
        const eyes = [
            document.getElementById('mascot-left-eye'),
            document.getElementById('mascot-right-eye')
        ];
        
        eyes.forEach(eye => {
            if (eye) {
                eye.setAttribute('r', Math.abs(Math.sin(timestamp * 0.003)) * 3 + 1);
            }
        });
    }
    
    function animateReactingTheme(timestamp) {
        const body = document.getElementById('mascot-body');
        const spots = document.querySelectorAll('[id^="mascot-spot"]');
        
        if (body) {
            const scale = 1 + Math.sin(timestamp * 0.005) * 0.05;
            body.setAttribute('transform', `scale(${scale})`);
        }
        
        spots.forEach(spot => {
            spot.setAttribute('opacity', Math.abs(Math.sin(timestamp * 0.004)) * 0.5 + 0.2);
        });
    }
    
    function animateInteractingWorkflow(timestamp) {
        const head = document.getElementById('mascot-head');
        const neck = document.getElementById('mascot-neck');
        
        if (head && neck) {
            const nod = Math.sin(timestamp * 0.008) * 5;
            head.setAttribute('transform', `translate(0, ${nod})`);
            neck.setAttribute('transform', `scale(1, ${1 + nod * 0.01})`);
        }
    }
    
    // Main animation loop
    function animate(timestamp) {
        switch (currentState) {
            case MascotStates.IDLE:
                animateIdle(timestamp);
                break;
            case MascotStates.ORIENTING_PHILOSOPHY:
                animateOrientingPhilosophy(timestamp);
                break;
            case MascotStates.ORIENTING_MODEL:
                animateOrientingModel(timestamp);
                break;
            case MascotStates.REACTING_THEME:
                animateReactingTheme(timestamp);
                break;
            case MascotStates.INTERACTING_WORKFLOW:
                animateInteractingWorkflow(timestamp);
                break;
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    // Update mascot state based on store
    function updateMascotState(storeState) {
        let newState = MascotStates.IDLE;
        
        if (storeState.selectedModel) {
            newState = MascotStates.ORIENTING_MODEL;
        } else if (storeState.selectedPhilosophyStatements.length > 0) {
            newState = MascotStates.ORIENTING_PHILOSOPHY;
        }
        
        if (newState !== currentState) {
            currentState = newState;
            
            // Reset transforms when changing states
            const elements = ['body', 'head', 'neck', 'left-eye', 'right-eye'];
            elements.forEach(id => {
                const el = document.getElementById(`mascot-${id}`);
                if (el) el.removeAttribute('transform');
            });
        }
    }
    
    // Initialize mascot
    function init(container) {
        const svg = createMascotSVG();
        container.innerHTML = '';
        container.appendChild(svg);
        
        // Start animation
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        animationFrame = requestAnimationFrame(animate);
        
        // Subscribe to store updates
        GironimoStore.subscribe((state) => {
            updateMascotState(state);
        });
        
        // Initial state update
        updateMascotState(GironimoStore.getState());
        
        // Add hover interaction for workflow
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('#workflowSystem')) {
                currentState = MascotStates.INTERACTING_WORKFLOW;
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('#workflowSystem')) {
                updateMascotState(GironimoStore.getState());
            }
        });
    }
    
    return {
        init,
        MascotStates
    };
})();
