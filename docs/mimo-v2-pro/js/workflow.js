/**
 * Gironimo — Workflow System
 */

const Workflow = (() => {
  const STAGES = [
    { id: 'spec', label: 'Spec', icon: '📋' },
    { id: 'gate1', label: 'Gate', icon: '🚪' },
    { id: 'architecture', label: 'Architecture', icon: '🏗' },
    { id: 'gate2', label: 'Gate', icon: '🚪' },
    { id: 'implementation', label: 'Implementation', icon: '⚙' },
    { id: 'review', label: 'Review', icon: '🔍' },
    { id: 'adr', label: 'ADR', icon: '📝' },
  ];

  function getMaxStageIndex(score) {
    if (score >= 90) return STAGES.length - 1;
    if (score >= 70) return 4; // stops at Implementation (index 4)
    return 2; // stops at Architecture (index 2)
  }

  function getStageStates(state) {
    const model = state.selectedModel;
    if (!model) {
      return STAGES.map(() => 'default');
    }
    const maxIdx = getMaxStageIndex(model.overall_score);
    return STAGES.map((_, i) => {
      if (i < maxIdx) return 'completed';
      if (i === maxIdx) return 'active';
      return 'blocked';
    });
  }

  function getModalContent(stage, state) {
    const model = state.selectedModel;
    const modelInfo = model
      ? `<p><strong>Model:</strong> ${Components.escHtml(model.model)}</p>
         <p><strong>Overall Score:</strong> ${model.overall_score.toFixed(1)}</p>
         <p><strong>Date:</strong> ${Components.escHtml(model.date || 'N/A')}</p>
         <hr style="border-color:var(--border);margin:12px 0">`
      : '<p><em>No model selected.</em></p>';

    let philoContext = '';
    const selected = state.selectedPhilosophyStatements;
    if (selected.length > 0) {
      const related = selected.filter(s => {
        const cat = Philosophy.getCategory(s);
        if (stage.id === 'architecture' && cat === 'Philosophical') return true;
        if (['implementation','review'].includes(stage.id) && cat === 'Practical') return true;
        if (['gate1','gate2','adr'].includes(stage.id) && cat === 'Technical') return true;
        return false;
      });
      if (related.length > 0) {
        philoContext = `<hr style="border-color:var(--border);margin:12px 0">
          <p><strong>Related Philosophy:</strong></p>
          ${related.map(s => `<p style="font-style:italic;color:var(--text-secondary);margin:4px 0">"${Components.escHtml(s)}"</p>`).join('')}`;
      }
    }

    const descriptions = {
      spec: 'Define requirements, constraints, and acceptance criteria. The foundation of correct work.',
      gate1: 'Review specification completeness. Human judgment catches what assumptions miss.',
      architecture: 'Design system structure, data flow, and integration points. Think before you build.',
      gate2: 'Validate architectural decisions against requirements. The last cheap change point.',
      implementation: 'Build the solution. Code quality and feature completeness matter here.',
      review: 'Verify correctness, performance, and adherence to best practices.',
      adr: 'Document architectural decisions. Future-you will thank present-you.',
    };

    return `<p>${descriptions[stage.id] || ''}</p>${modelInfo}${philoContext}`;
  }

  function render() {
    const state = AppStore.getState();
    const container = document.createElement('div');
    container.className = 'workflow-container';

    const title = document.createElement('h2');
    title.className = 'panel-title';
    title.textContent = 'Workflow';
    container.appendChild(title);

    const stagesEl = document.createElement('div');
    stagesEl.className = 'workflow-stages';
    stagesEl.setAttribute('role', 'navigation');
    stagesEl.setAttribute('aria-label', 'Workflow stages');

    const stageStates = getStageStates(state);

    STAGES.forEach((stage, idx) => {
      if (idx > 0) {
        const conn = document.createElement('div');
        conn.className = 'workflow-connector';
        if (stageStates[idx - 1] === 'completed') conn.classList.add('completed');
        if (stageStates[idx] === 'active') conn.classList.add('active');
        stagesEl.appendChild(conn);
      }

      const el = document.createElement('div');
      el.className = `workflow-stage ${stageStates[idx]}`;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${stage.label} stage${stageStates[idx] === 'blocked' ? ' (locked)' : ''}`);
      el.setAttribute('data-tooltip', stage.label);

      const dot = document.createElement('div');
      dot.className = 'workflow-stage__dot';
      dot.textContent = stageStates[idx] === 'completed' ? '✓' : stage.icon;
      el.appendChild(dot);

      const label = document.createElement('div');
      label.className = 'workflow-stage__label';
      label.textContent = stage.label;
      el.appendChild(label);

      const openModal = () => {
        AppStore.dispatch({ type: 'SET_WORKFLOW_STAGE', payload: stage.id });
        const overlay = Components.Modal({
          title: stage.label,
          body: getModalContent(stage, state),
          onClose: () => {
            AppStore.dispatch({ type: 'SET_WORKFLOW_MODAL', payload: false });
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 250);
          },
        });
        document.body.appendChild(overlay);
        AppStore.dispatch({ type: 'SET_WORKFLOW_MODAL', payload: true });
      };

      el.addEventListener('click', openModal);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); } });
      el.addEventListener('mouseenter', () => AppStore.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: stage.id }));
      el.addEventListener('mouseleave', () => AppStore.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: null }));

      stagesEl.appendChild(el);
    });

    container.appendChild(stagesEl);
    return container;
  }

  return { render, STAGES };
})();
