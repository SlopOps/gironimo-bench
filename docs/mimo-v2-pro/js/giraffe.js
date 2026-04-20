/**
 * Gironimo — Interactive Giraffe Mascot
 * SVG-based. State-machine driven behaviors.
 */

const Giraffe = (() => {
  let container = null;
  let svgEl = null;
  let speechEl = null;
  let currentState = 'idle';
  let animTimeout = null;

  const SPEECHES = {
    idle: [
      'Standing tall, seeing far...',
      'Every long neck starts with a single vertebra.',
      'Patience is a tall order.',
    ],
    philosophy: [
      'Ah, wisdom to chew on.',
      'That resonates — from head to hooves.',
      'A fine philosophy indeed.',
    ],
    themeChange: [
      'New coat, who dis?',
      'Spot check: still stylish.',
      'A change of scenery!',
    ],
    modelSelected: [
      'Let me get a better look...',
      'Interesting specimen!',
      'Score noted, filed under "tall".',
    ],
    workflowHover: [
      'Which way now?',
      'The path unfolds...',
      'Onward, one step at a time.',
    ],
  };

  function randomSpeech(key) {
    const arr = SPEECHES[key] || SPEECHES.idle;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function createSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 160 220');
    svg.setAttribute('class', 'giraffe-svg idle');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Giraffe mascot');
    svg.innerHTML = `
      <!-- Tail -->
      <path d="M 35 155 Q 20 165 18 180 Q 17 188 22 186 Q 26 183 30 175" fill="none" stroke="var(--giraffe-body)" stroke-width="3" stroke-linecap="round"/>
      <circle cx="20" cy="185" r="3" fill="var(--spot-fill)"/>
      <!-- Back legs -->
      <rect x="42" y="168" width="10" height="42" rx="4" fill="var(--giraffe-body)"/>
      <rect x="56" y="170" width="10" height="40" rx="4" fill="var(--giraffe-body)"/>
      <!-- Body -->
      <ellipse cx="78" cy="150" rx="48" ry="28" fill="var(--giraffe-body)"/>
      <!-- Body spots -->
      <ellipse cx="55" cy="142" rx="9" ry="7" fill="var(--spot-fill)" opacity="0.7"/>
      <ellipse cx="78" cy="148" rx="10" ry="7" fill="var(--spot-fill)" opacity="0.7"/>
      <ellipse cx="98" cy="140" rx="8" ry="6" fill="var(--spot-fill)" opacity="0.7"/>
      <ellipse cx="68" cy="158" rx="7" ry="5" fill="var(--spot-fill)" opacity="0.5"/>
      <ellipse cx="90" cy="156" rx="8" ry="5" fill="var(--spot-fill)" opacity="0.5"/>
      <!-- Belly highlight -->
      <ellipse cx="78" cy="160" rx="30" ry="8" fill="var(--giraffe-light)" opacity="0.25"/>
      <!-- Front legs -->
      <rect x="92" y="168" width="10" height="42" rx="4" fill="var(--giraffe-body)"/>
      <rect x="106" y="170" width="10" height="40" rx="4" fill="var(--giraffe-body)"/>
      <!-- Hooves -->
      <rect x="40" y="206" width="14" height="6" rx="3" fill="var(--spot-stroke)"/>
      <rect x="54" y="206" width="14" height="6" rx="3" fill="var(--spot-stroke)"/>
      <rect x="90" y="206" width="14" height="6" rx="3" fill="var(--spot-stroke)"/>
      <rect x="104" y="206" width="14" height="6" rx="3" fill="var(--spot-stroke)"/>
      <!-- Neck -->
      <path d="M 100 135 Q 108 100 112 65 Q 114 50 112 40" fill="none" stroke="var(--giraffe-body)" stroke-width="16" stroke-linecap="round"/>
      <!-- Neck spots -->
      <ellipse cx="110" cy="95" rx="5" ry="6" fill="var(--spot-fill)" opacity="0.6"/>
      <ellipse cx="108" cy="115" rx="5" ry="5" fill="var(--spot-fill)" opacity="0.5"/>
      <!-- Head -->
      <g class="giraffe-head">
        <ellipse cx="118" cy="32" rx="20" ry="16" fill="var(--giraffe-body)"/>
        <!-- Muzzle -->
        <ellipse cx="132" cy="36" rx="11" ry="9" fill="var(--giraffe-light)"/>
        <!-- Nostrils -->
        <ellipse cx="137" cy="34" rx="2" ry="1.5" fill="var(--spot-stroke)" opacity="0.6"/>
        <ellipse cx="140" cy="35" rx="2" ry="1.5" fill="var(--spot-stroke)" opacity="0.6"/>
        <!-- Eye -->
        <circle cx="118" cy="28" r="4.5" fill="white"/>
        <circle cx="119" cy="28" r="2.8" fill="#2a1a00"/>
        <circle cx="120" cy="27" r="1" fill="white"/>
        <!-- Eyelash -->
        <line x1="114" y1="24" x2="112" y2="21" stroke="var(--spot-stroke)" stroke-width="1" stroke-linecap="round"/>
        <!-- Ear -->
        <path d="M 108 20 Q 104 12 108 10 Q 112 12 112 20" fill="var(--giraffe-body)" stroke="var(--spot-fill)" stroke-width="0.5"/>
        <!-- Horns (ossicones) -->
        <line x1="112" y1="18" x2="110" y2="6" stroke="var(--giraffe-body)" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="110" cy="5" r="2.5" fill="var(--spot-fill)"/>
        <line x1="120" y1="17" x2="122" y2="5" stroke="var(--giraffe-body)" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="122" cy="4" r="2.5" fill="var(--spot-fill)"/>
        <!-- Smile -->
        <path d="M 128 40 Q 133 43 138 40" fill="none" stroke="var(--spot-stroke)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
      </g>
      <!-- Mane -->
      <path d="M 105 18 Q 102 28 103 38 Q 101 48 103 58 Q 101 70 104 82 Q 102 95 105 108 Q 103 120 106 130" fill="none" stroke="var(--spot-fill)" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
    `;
    return svg;
  }

  function setBehavior(key) {
    if (currentState === key && key !== 'idle') return;
    clearTimeout(animTimeout);
    currentState = key;
    if (!svgEl) return;

    svgEl.className.baseVal = 'giraffe-svg';
    void svgEl.offsetWidth;
    switch (key) {
      case 'idle': svgEl.classList.add('idle'); break;
      case 'philosophy': svgEl.classList.add('philosophy-selected'); break;
      case 'themeChange': svgEl.classList.add('theme-change'); break;
      case 'modelSelected': svgEl.classList.add('model-selected'); break;
      case 'workflowHover': svgEl.classList.add('workflow-hover'); break;
    }

    if (speechEl) {
      speechEl.style.opacity = '0';
      setTimeout(() => {
        speechEl.textContent = `"${randomSpeech(key)}"`;
        speechEl.style.opacity = '1';
      }, 150);
    }

    if (key !== 'idle') {
      animTimeout = setTimeout(() => setBehavior('idle'), 3000);
    }
  }

  function render() {
    container = document.createElement('div');
    container.className = 'giraffe-container';
    svgEl = createSvg();
    speechEl = document.createElement('div');
    speechEl.className = 'giraffe-speech';
    speechEl.textContent = `"${randomSpeech('idle')}"`;
    container.appendChild(svgEl);
    container.appendChild(speechEl);
    return container;
  }

  function handleStateChange(state, prev) {
    if (state.theme !== prev.theme) {
      setBehavior('themeChange');
      return;
    }
    if (state.selectedPhilosophyStatements.length !== prev.selectedPhilosophyStatements.length) {
      if (state.selectedPhilosophyStatements.length > 0) {
        setBehavior('philosophy');
      } else {
        setBehavior('idle');
      }
      return;
    }
    if (state.selectedModel !== prev.selectedModel) {
      if (state.selectedModel) {
        setBehavior('modelSelected');
      } else {
        setBehavior('idle');
      }
      return;
    }
    if (state.workflowState.hoveredStage !== prev.workflowState.hoveredStage) {
      if (state.workflowState.hoveredStage) {
        setBehavior('workflowHover');
      }
      return;
    }
  }

  return { render, handleStateChange, setBehavior };
})();
