// /docs/gironimo/js/mascot.js

const Mascot = (function() {
    const canvas = document.getElementById('giraffe-canvas');
    const ctx = canvas.getContext('2d');
    
    // State machine states
    const STATES = {
        IDLE: 'IDLE',
        ORIENT_PHILOSOPHY: 'ORIENT_PHILOSOPHY',
        ORIENT_MODEL: 'ORIENT_MODEL',
        THEME_TRANSITION: 'THEME_TRANSITION',
        WORKFLOW_RESPONSE: 'WORKFLOW_RESPONSE'
    };
    
    let currentState = STATES.IDLE;
    let stateTimer = 0;
    let animationFrame = 0;
    
    // Giraffe properties
    const giraffe = {
        x: 100,
        y: 250,
        neckAngle: 0,
        headAngle: 0,
        targetNeckAngle: 0,
        targetHeadAngle: 0,
        blinkTimer: 0,
        isBlinking: false,
        spotColor: '#d97706',
        bodyColor: '#f59e0b',
        eyeColor: '#1e293b'
    };
    
    // Particles for effects
    let particles = [];
    
    function init() {
        resize();
        animate();
    }
    
    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }
    
    function createParticle(x, y, color) {
        return {
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            life: 1,
            color
        };
    }
    
    function updateParticles() {
        particles = particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.05; // gravity
            return p.life > 0;
        });
    }
    
    function drawParticles() {
        particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    function drawGiraffe() {
        const { x, y, neckAngle, headAngle, spotColor, bodyColor, eyeColor, isBlinking } = giraffe;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Body
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spots on body
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(-15, -5, 8, 0, Math.PI * 2);
        ctx.arc(10, 5, 6, 0, Math.PI * 2);
        ctx.arc(0, -10, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Legs
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        
        // Back legs
        ctx.beginPath();
        ctx.moveTo(-25, 20);
        ctx.lineTo(-30, 60);
        ctx.moveTo(25, 20);
        ctx.lineTo(30, 60);
        ctx.stroke();
        
        // Front legs
        ctx.beginPath();
        ctx.moveTo(-15, 25);
        ctx.lineTo(-20, 65);
        ctx.moveTo(15, 25);
        ctx.lineTo(20, 65);
        ctx.stroke();
        
        // Hooves
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(-30, 60, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(30, 60, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(-20, 65, 6, 3, 0, 0, Math.PI * 2);
        ctx.ellipse(20, 65, 6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Neck (animated)
        ctx.save();
        ctx.rotate(neckAngle);
        
        // Neck
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(-12, -20);
        ctx.lineTo(-8, -100);
        ctx.lineTo(8, -100);
        ctx.lineTo(12, -20);
        ctx.closePath();
        ctx.fill();
        
        // Neck spots
        ctx.fillStyle = spotColor;
        ctx.beginPath();
        ctx.arc(0, -40, 5, 0, Math.PI * 2);
        ctx.arc(-3, -70, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Mane
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const my = -30 - i * 15;
            ctx.moveTo(-10, my);
            ctx.lineTo(-15, my - 5);
        }
        ctx.stroke();
        
        // Head
        ctx.save();
        ctx.translate(0, -100);
        ctx.rotate(headAngle);
        
        // Head shape
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(0, -15, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Snout
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(0, -5, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nostrils
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        ctx.arc(5, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        if (!isBlinking) {
            ctx.fillStyle = eyeColor;
            ctx.beginPath();
            ctx.arc(-8, -20, 4, 0, Math.PI * 2);
            ctx.arc(8, -20, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Eye shine
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-9, -21, 1.5, 0, Math.PI * 2);
            ctx.arc(7, -21, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Closed eyes
            ctx.strokeStyle = eyeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-12, -20);
            ctx.lineTo(-4, -20);
            ctx.moveTo(4, -20);
            ctx.lineTo(12, -20);
            ctx.stroke();
        }
        
        // Ossicones (horns)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.rect(-10, -38, 4, 10);
        ctx.rect(6, -38, 4, 10);
        ctx.fill();
        
        // Horn tips
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-8, -40, 3, 0, Math.PI * 2);
        ctx.arc(8, -40, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.ellipse(-20, -25, 6, 4, -0.5, 0, Math.PI * 2);
        ctx.ellipse(20, -25, 6, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore(); // End head
        ctx.restore(); // End neck
        ctx.restore(); // End body
        
        drawParticles();
    }
    
    function updateState(state, prevState) {
        const { selectedPhilosophyStatements, selectedModel, theme } = state;
        const prevTheme = prevState.theme;
        
        // Determine new mascot state
        let newState = STATES.IDLE;
        
        if (theme !== prevTheme) {
            newState = STATES.THEME_TRANSITION;
            // Create particles for theme change
            for (let i = 0; i < 10; i++) {
                particles.push(createParticle(
                    100 + (Math.random() - 0.5) * 60,
                    150 + (Math.random() - 0.5) * 100,
                    theme === 'dark' ? '#f59e0b' : '#3b82f6'
                ));
            }
        } else if (selectedModel) {
            newState = STATES.ORIENT_MODEL;
            // Calculate target angles based on model score
            const score = parseFloat(selectedModel.overall_score) || 0;
            giraffe.targetNeckAngle = (score - 50) / 500; // Subtle tilt based on score
            giraffe.targetHeadAngle = score > 80 ? -0.2 : 0.1;
        } else if (selectedPhilosophyStatements.length > 0) {
            newState = STATES.ORIENT_PHILOSOPHY;
            // Orient toward philosophy panel
            giraffe.targetNeckAngle = -0.1;
            giraffe.targetHeadAngle = -0.15;
        } else {
            giraffe.targetNeckAngle = 0;
            giraffe.targetHeadAngle = 0;
        }
        
        currentState = newState;
        stateTimer++;
    }
    
    function animate() {
        animationFrame++;
        
        // Smooth angle interpolation
        giraffe.neckAngle += (giraffe.targetNeckAngle - giraffe.neckAngle) * 0.05;
        giraffe.headAngle += (giraffe.targetHeadAngle - giraffe.headAngle) * 0.05;
        
        // Idle animation
        if (currentState === STATES.IDLE) {
            giraffe.neckAngle += Math.sin(animationFrame * 0.02) * 0.002;
            giraffe.headAngle += Math.cos(animationFrame * 0.03) * 0.003;
        }
        
        // Blinking
        giraffe.blinkTimer++;
        if (giraffe.blinkTimer > 150 + Math.random() * 100) {
            giraffe.isBlinking = true;
            if (giraffe.blinkTimer > 155 + Math.random() * 100) {
                giraffe.isBlinking = false;
                giraffe.blinkTimer = 0;
            }
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        updateParticles();
        drawGiraffe();
        
        requestAnimationFrame(animate);
    }
    
    // Handle workflow hover
    function setWorkflowHover(stageIndex) {
        if (stageIndex >= 0) {
            currentState = STATES.WORKFLOW_RESPONSE;
            giraffe.targetNeckAngle = 0.1;
            giraffe.targetHeadAngle = 0.1 + (stageIndex * 0.02);
        }
    }
    
    return {
        init,
        updateState,
        setWorkflowHover,
        resize
    };
})();
