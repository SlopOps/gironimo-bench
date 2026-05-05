// Feature 3: Interactive Giraffe Mascot (State Machine Driven)
const Mascot = (() => {
  // Mascot State Machine
  const stateMachine = {
    currentState: 'idle',
    prevTheme: null,

    // Determine Next State from Store
    transition: (storeState) => {
      const { selectedModel, selectedPhilosophyStatements, workflowState } = storeState;

      if (workflowState.hoveredStage) return 'workflowHover';
      if (selectedModel) return 'modelSelected';
      if (selectedPhilosophyStatements.length > 0) return 'philosophySelected';
      return 'idle';
    }
  };

  // Render Mascot SVG
  const renderMascot = (container, mascotState, storeState) => {
    container.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 150');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-label', 'Giraffe mascot');

    // Theme-Aware Colors
    const mascotColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-mascot-color').trim() || '#8b4513';

    // Giraffe Parts
    const createPart = (tag, attrs) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attrs).forEach(([key, val]) => el.setAttribute(key, val));
      return el;
    };

    // Body
    const body = createPart('rect', {
      x: '30', y: '50', width: '40', height: '60',
      fill: mascotColor, rx: '8'
    });

    // Neck
    const neck = createPart('rect', {
      x: '40', y: '20', width: '20', height: '30',
      fill: mascotColor, rx: '4'
    });

    // Head
    const head = createPart('circle', {
      cx: '50', cy: '15', r: '10', fill: mascotColor
    });

    // Legs
    const legs = [
      { x: '35', y: '110' },
      { x: '45', y: '110' },
      { x: '55', y: '110' },
      { x: '65', y: '110' }
    ].map(pos => createPart('rect', {
      ...pos, width: '5', height: '30', fill: mascotColor, rx: '2'
    }));

    // Eyes
    const eyes = [
      { cx: '45', cy: '12' },
      { cx: '55', cy: '12' }
    ].map(pos => createPart('circle', {
      ...pos, r: '2', fill: 'white'
    }));

    // State-Specific Behavior
    switch (mascotState) {
      case 'idle':
        // Subtle Neck Bobbing
        const bob = createPart('animate', {
          attributeName: 'y',
          values: '20;22;20',
          dur: '2s',
          repeatCount: 'indefinite'
        });
        neck.appendChild(bob);
        break;

      case 'philosophySelected':
        // Orient Toward Statements (Turn Head Right)
        head.setAttribute('cx', '55');
        break;

      case 'modelSelected':
        // Orient Toward Leaderboard (Turn Head Left)
        head.setAttribute('cx', '45');
        break;

      case 'workflowHover':
        // Bounce Animation
        const bounce = createPart('animateTransform', {
          attributeName: 'transform',
          type: 'translate',
          values: '0,0; 0,-5; 0,0',
          dur: '0.5s',
          repeatCount: 'indefinite'
        });
        body.appendChild(bounce);
        break;
    }

    // Theme Change Reaction (Pulse)
    if (stateMachine.prevTheme && stateMachine.prevTheme !== storeState.theme) {
      const pulse = createPart('animate', {
        attributeName: 'opacity',
        values: '1;0.5;1',
        dur: '0.5s',
        repeatCount: '1'
      });
      body.appendChild(pulse);
    }

    // Assemble SVG
    [body, neck, head, ...legs, ...eyes].forEach(part => svg.appendChild(part));
    container.appendChild(svg);

    // Update State Machine
    stateMachine.prevTheme = storeState.theme;
    stateMachine.currentState = mascotState;
  };

  // Initialize
  const init = () => {
    const container = document.getElementById('mascot-container');
    if (!container) return;

    // Subscribe to Store Updates
    Store.subscribe((state) => {
      const newState = stateMachine.transition(state);
      renderMascot(container, newState, state);
    });

    // Initial Render
    const initialState = Store.getState();
    const initialMascotState = stateMachine.transition(initialState);
    renderMascot(container, initialMascotState, initialState);
    stateMachine.prevTheme = initialState.theme;
  };

  return { init };
})();

window.Mascot = Mascot;
