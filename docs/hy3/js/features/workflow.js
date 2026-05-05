// Feature 4: Workflow System
const Workflow = (() => {
  const stages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

  // Calculate Progress from Selected Model Score
  const getProgress = (selectedModel) => {
    if (!selectedModel) return [];
    const score = selectedModel.overall_score;
    if (score >= 90) return stages; // Full Progression
    if (score >= 70) return stages.slice(0, 5); // Stop at Implementation
    return stages.slice(0, 3); // Stop at Architecture
  };

  // Render Workflow Modal
  const renderModal = (stage, selectedModel, selectedPhilosophy) => {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';

    // No Model Selected
    if (!selectedModel) {
      const modal = Components.Modal({
        isOpen: true,
        onClose: () => {
          Store.dispatch({ type: 'SET_WORKFLOW_SELECTED_STAGE', payload: null });
          modalContainer.innerHTML = '';
        },
        title: stage,
        children: document.createTextNode('Please select a model from the leaderboard to view workflow details.')
      });
      modalContainer.appendChild(modal);
      return;
    }

    // Modal Content
    const content = document.createElement('div');
    
    // Model Metadata
    const modelInfo = document.createElement('div');
    modelInfo.innerHTML = `
      <p><strong>Model:</strong> ${selectedModel.model}</p>
      <p><strong>Overall Score:</strong> ${selectedModel.overall_score}</p>
      <p><strong>Current Stage:</strong> ${stage}</p>
    `;

    // Philosophy Context
    const philosophyContext = document.createElement('div');
    philosophyContext.innerHTML = '<h3>Selected Philosophy</h3>';
    if (selectedPhilosophy.length === 0) {
      philosophyContext.innerHTML += '<p>No philosophy statements selected.</p>';
    } else {
      const list = document.createElement('ul');
      selectedPhilosophy.forEach(stmt => {
        const li = document.createElement('li');
        li.textContent = stmt;
        list.appendChild(li);
      });
      philosophyContext.appendChild(list);
    }

    content.appendChild(modelInfo);
    content.appendChild(philosophyContext);

    // Render Modal
    const modal = Components.Modal({
      isOpen: true,
      onClose: () => {
        Store.dispatch({ type: 'SET_WORKFLOW_SELECTED_STAGE', payload: null });
        modalContainer.innerHTML = '';
      },
      title: `Workflow: ${stage}`,
      children: content
    });
    modalContainer.appendChild(modal);
  };

  // Render Workflow
  const render = (container) => {
    container.innerHTML = '';
    const state = Store.getState();
    const { selectedModel, workflowState } = state;
    const progress = getProgress(selectedModel);

    // Section Title
    const title = document.createElement('h2');
    title.textContent = 'Workflow';
    container.appendChild(title);

    // Workflow Container
    const workflowDiv = document.createElement('div');
    workflowDiv.className = 'workflow';

    // Render Stages
    stages.forEach(stage => {
      const isGate = stage === 'Gate';
      const isCompleted = progress.includes(stage);
      const isHovered = workflowState.hoveredStage === stage;

      const stageEl = document.createElement('div');
      stageEl.className = `workflow-stage ${isGate ? 'workflow-gate' : ''} ${
        isCompleted ? 'workflow-stage-completed' : ''
      } ${isHovered ? 'workflow-stage-active' : ''}`;
      stageEl.textContent = isGate ? 'G' : stage;
      stageEl.setAttribute('role', 'button');
      stageEl.setAttribute('tabindex', '0');
      stageEl.setAttribute('aria-label', stage);

      // Click to Open Modal
      stageEl.addEventListener('click', () => {
        Store.dispatch({ type: 'SET_WORKFLOW_SELECTED_STAGE', payload: stage });
        renderModal(stage, selectedModel, state.selectedPhilosophyStatements);
      });

      // Hover to Update Store (For Mascot)
      stageEl.addEventListener('mouseenter', () => {
        Store.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: stage });
      });
      stageEl.addEventListener('mouseleave', () => {
        Store.dispatch({ type: 'SET_WORKFLOW_HOVER', payload: null });
      });

      // Keyboard Support
      stageEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          stageEl.click();
        }
      });

      workflowDiv.appendChild(stageEl);
    });

    container.appendChild(workflowDiv);
  };

  // Initialize
  const init = (container) => {
    Store.subscribe(() => render(container));
    render(container);
  };

  return { init };
})();

window.Workflow = Workflow;
