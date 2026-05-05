/**
 * Interactive Giraffe Mascot
 * State machine driven by store state
 * No DOM-driven logic
 */

class MascotStateMachine {
  constructor() {
    this.currentState = 'idle';
    this.previousState = null;
    this.transitionHistory = [];
    this.maxHistory = 10;
  }

  // State machine transition rules
  transition(trigger, context = {}) {
    const prev = this.currentState;
    let next = this.currentState;

    switch (this.currentState) {
      case 'idle':
        if (trigger === 'philosophy_selected') next = 'orient_philosophy';
        else if (trigger === 'model_selected') next = 'orient_leaderboard';
        else if (trigger === 'theme_change') next = 'react_theme';
        else if (trigger === 'workflow_hover') next = 'orient_workflow';
        break;

      case 'orient_philosophy':
        if (trigger === 'idle_timeout') next = 'idle';
        else if (trigger === 'philosophy_deselected') next = 'idle';
        break;

      case 'orient_leaderboard':
        if (trigger === 'idle_timeout') next = 'idle';
        else if (trigger === 'model_deselected') next = 'idle';
        break;

      case 'react_theme':
        if (trigger === 'animation_complete') next = 'idle';
        break;

      case 'orient_workflow':
        if (trigger === 'idle_timeout') next = 'idle';
        break;
    }

    if (next !== prev) {
      this.transitionHistory.push({
        from: prev,
        to: next,
        trigger,
        context,
        timestamp: Date.now()
      });
      
      if (this.transitionHistory.length > this.maxHistory) {
        this.transitionHistory.shift();
      }
      
      this.previousState = prev;
      this.currentState = next;
    }

    return this.currentState;
  }

  getState() {
    return this.currentState;
  }

  getContext() {
    return {
      previousState: this.previousState,
      history: this.transitionHistory
    };
  }
}

class GiraffeMascot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.stateMachine = new MascotStateMachine();
    this.svgElement = null;
    this.currentAnimationClass = null;
    this.idleTimer = null;
    this.orientationTarget = 'center'; // left | center | right
    this.bounceDirection = null; // up | down
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('Mascot container not found');
      return;
    }

    this.render();
    this.subscribeToStore();
    this.startIdleBehavior();
  }

  // Create SVG giraffe
  render() {
    this.container.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 200');
    svg.setAttribute('aria-label', 'Interactive giraffe mascot');
    svg.setAttribute('role', 'img');
    svg.id = 'mascot-svg';
    
    // Giraffe body (simplified geometric style)
    const bodyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    bodyGroup.id = 'mascot-body';
    
    // Body
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    body.setAttribute('cx', '100');
    body.setAttribute('cy', '130');
    body.setAttribute('rx', '35');
    body.setAttribute('ry', '45');
    body.setAttribute('fill', '#f59e0b');
    body.setAttribute('stroke', '#d97706');
    body.setAttribute('stroke-width', '2');
    bodyGroup.appendChild(body);
    
    // Neck
    const neck = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    neck.setAttribute('x', '85');
    neck.setAttribute('y', '60');
    neck.setAttribute('width', '30');
    neck.setAttribute('height', '80');
    neck.setAttribute('rx', '15');
    neck.setAttribute('fill', '#f59e0b');
    neck.setAttribute('stroke', '#d97706');
    neck.setAttribute('stroke-width', '2');
    bodyGroup.appendChild(neck);
    
    // Head
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    head.setAttribute('cx', '100');
    head.setAttribute('cy', '45');
    head.setAttribute('rx', '25');
    head.setAttribute('ry', '20');
    head.setAttribute('fill', '#f59e0b');
    head.setAttribute('stroke', '#d97706');
    head.setAttribute('stroke-width', '2');
    bodyGroup.appendChild(head);
    
    // Ossicones (horns)
    const horn1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horn1.setAttribute('x1', '90');
    horn1.setAttribute('y1', '30');
    horn1.setAttribute('x2', '85');
    horn1.setAttribute('y2', '15');
    horn1.setAttribute('stroke', '#d97706');
    horn1.setAttribute('stroke-width', '3');
    horn1.setAttribute('stroke-linecap', 'round');
    bodyGroup.appendChild(horn1);
    
    const horn2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horn2.setAttribute('x1', '110');
    horn2.setAttribute('y1', '30');
    horn2.setAttribute('x2', '115');
    horn2.setAttribute('y2', '15');
    horn2.setAttribute('stroke', '#d97706');
    horn2.setAttribute('stroke-width', '3');
    horn2.setAttribute('stroke-linecap', 'round');
    bodyGroup.appendChild(horn2);
    
    // Eyes
    const eye1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye1.setAttribute('cx', '90');
    eye1.setAttribute('cy', '42');
    eye1.setAttribute('r', '4');
    eye1.setAttribute('fill', '#1f2937');
    bodyGroup.appendChild(eye1);
    
    const eye2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eye2.setAttribute('cx', '110');
    eye2.setAttribute('cy', '42');
    eye2.setAttribute('r', '4');
    eye2.setAttribute('fill', '#1f2937');
    bodyGroup.appendChild(eye2);
    
    // Spots
    const spots = [
      { cx: 85, cy: 110, r: 6 },
      { cx: 115, cy: 120, r: 5 },
      { cx: 95, cy: 140, r: 7 },
      { cx: 110, cy: 100, r: 4 },
      { cx: 80, cy: 130, r: 5 }
    ];
    
    spots.forEach(spot => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', spot.cx);
      circle.setAttribute('cy', spot.cy);
      circle.setAttribute('r', spot.r);
      circle.setAttribute('fill', '#92400e');
      bodyGroup.appendChild(circle);
    });
    
    // Legs
    const legPositions = [
      { x: 80, y: 165 }, { x: 95, y: 165 },
      { x: 105, y: 165 }, { x: 120, y: 165 }
    ];
    
    legPositions.forEach(pos => {
      const leg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      leg.setAttribute('x', pos.x);
      leg.setAttribute('y', pos.y);
      leg.setAttribute('width', '8');
      leg.setAttribute('height', '25');
      leg.setAttribute('rx', '4');
      leg.setAttribute('fill', '#f59e0b');
      leg.setAttribute('stroke', '#d97706');
      leg.setAttribute('stroke-width', '1');
      bodyGroup.appendChild(leg);
    });
    
    // Tail
    const tail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    tail.setAttribute('d', 'M 135 130 Q 150 125 155 140 Q 160 150 150 145');
    tail.setAttribute('stroke', '#d97706');
    tail.setAttribute('stroke-width', '3');
    tail.setAttribute('fill', 'none');
    tail.setAttribute('stroke-linecap', 'round');
    bodyGroup.appendChild(tail);
    
    svg.appendChild(bodyGroup);
    this.container.appendChild(svg);
    this.svgElement = svg;
  }

  subscribeToStore() {
    this.unsubscribe = store.subscribe((state) => {
      this.handleStateChange(state);
    });
  }

  handleStateChange(state) {
    const prevSelectedModel = this.lastSelectedModel;
    const prevSelectedPhilosophies = this.lastSelectedPhilosophies;
    const prevTheme = this.lastTheme;
    
    this.lastSelectedModel = state.selectedModel;
    this.lastSelectedPhilosophies = state.selectedPhilosophyStatements;
    this.lastTheme = state.theme;

    // Philosophy selection change
    if (state.selectedPhilosophyStatements.length !== (prevSelectedPhilosophies || []).length) {
      if (state.selectedPhilosophyStatements.length > 0) {
        this.triggerBehavior('philosophy_selected', {
          count: state.selectedPhilosophyStatements.length
        });
      } else {
        this.triggerBehavior('philosophy_deselected');
      }
    }

    // Model selection change
    if (state.selectedModel !== prevSelectedModel) {
      if (state.selectedModel) {
        this.triggerBehavior('model_selected', {
          model: state.selectedModel.model,
          score: state.selectedModel.overall_score
        });
      } else {
        this.triggerBehavior('model_deselected');
      }
    }

    // Theme change
    if (state.theme !== prevTheme && prevTheme !== undefined) {
      this.triggerBehavior('theme_change', {
        newTheme: state.theme
      });
    }
  }

  triggerBehavior(trigger, context = {}) {
    // Reset idle timer on any interaction
    this.resetIdleTimer();
    
    // Transition state machine
    const newState = this.stateMachine.transition(trigger, context);
    
    // Apply visual behavior based on state
    this.applyBehavior(newState, context);
  }

  applyBehavior(state, context) {
    // Clear previous animation classes
    this.clearAnimations();

    switch (state) {
      case 'idle':
        this.applyIdleBehavior();
        break;

      case 'orient_philosophy':
        this.applyOrientationBehavior('philosophy', context);
        break;

      case 'orient_leaderboard':
        this.applyOrientationBehavior('leaderboard', context);
        break;

      case 'react_theme':
        this.applyThemeReaction();
        break;

      case 'orient_workflow':
        this.applyOrientationBehavior('workflow', context);
        break;
    }
  }

  applyIdleBehavior() {
    if (this.svgElement) {
      this.svgElement.classList.add('mascot-idle');
      this.currentAnimationClass = 'mascot-idle';
    }
  }

  applyOrientationBehavior(type, context) {
    if (!this.svgElement) return;

    // Determine orientation based on context
    let orientation = 'center';
    
    if (type === 'philosophy') {
      // Orient based on number of selected statements
      const count = context.count || 0;
      if (count === 1) orientation = 'left';
      else if (count === 2) orientation = 'center';
      else orientation = 'right';
    } else if (type === 'leaderboard') {
      // Orient based on model score
      const score = context.score || 0;
      if (score >= 90) orientation = 'up';
      else if (score >= 70) orientation = 'center';
      else orientation = 'down';
    } else if (type === 'workflow') {
      orientation = context.direction || 'center';
    }

    // Apply bounce animation
    if (orientation === 'up' || orientation === 'left') {
      this.svgElement.classList.add('mascot-bounce-up');
      this.bounceDirection = 'up';
    } else if (orientation === 'down' || orientation === 'right') {
      this.svgElement.classList.add('mascot-bounce-down');
      this.bounceDirection = 'down';
    } else {
      this.svgElement.classList.add('mascot-idle');
    }

    this.currentAnimationClass = this.svgElement.classList.contains('mascot-bounce-up') 
      ? 'mascot-bounce-up' 
      : this.svgElement.classList.contains('mascot-bounce-down')
        ? 'mascot-bounce-down'
        : 'mascot-idle';

    // Schedule return to idle
    setTimeout(() => {
      this.stateMachine.transition('idle_timeout');
      this.applyBehavior('idle');
    }, 2000);
  }

  applyThemeReaction() {
    if (!this.svgElement) return;
    
    this.svgElement.classList.add('mascot-theme-transition');
    this.currentAnimationClass = 'mascot-theme-transition';

    // Return to idle after animation
    setTimeout(() => {
      this.stateMachine.transition('animation_complete');
      this.applyBehavior('idle');
    }, 600);
  }

  clearAnimations() {
    if (this.svgElement) {
      const classes = this.svgElement.className.baseVal.split(' ').filter(c => c !== '');
      classes.forEach(c => {
        if (c.startsWith('mascot-')) {
          this.svgElement.classList.remove(c);
        }
      });
    }
    this.currentAnimationClass = null;
  }

  startIdleBehavior() {
    this.applyIdleBehavior();
  }

  resetIdleTimer() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }
    
    this.idleTimer = setTimeout(() => {
      if (this.stateMachine.getState() !== 'idle') {
        this.stateMachine.transition('idle_timeout');
        this.applyBehavior('idle');
      }
    }, 3000);
  }

  // Public API for workflow hover
  respondToWorkflowHover(direction) {
    this.triggerBehavior('workflow_hover', { direction });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.container) this.container.innerHTML = '';
  }
}

// Initialize mascot when DOM is ready
let mascotInstance = null;

function initMascot() {
  if (!mascotInstance) {
    mascotInstance = new GiraffeMascot('mascot-container');
  }
  return mascotInstance;
}

function getMascot() {
  return mascotInstance;
}

// Export for use in app.js
window.GironimoMascot = {
  init: initMascot,
  get: getMascot,
  GiraffeMascot
};
