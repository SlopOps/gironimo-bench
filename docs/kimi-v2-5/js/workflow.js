// /docs/gironimo/js/workflow.js

const Workflow = (function() {
    const stages = [
        { name: 'Spec', type: 'stage', icon: '📋' },
        { name: 'Gate', type: 'gate', icon: '⚡' },
        { name: 'Architecture', type: 'stage', icon: '🏗️' },
        { name: 'Gate', type: 'gate', icon: '⚡' },
        { name: 'Implementation', type: 'stage', icon: '💻' },
        { name: 'Review', type: 'stage', icon: '👀' },
        { name: 'ADR', type: 'stage', icon: '📄' }
    ];
    
    function init() {
        render();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        const container = document.getElementById('workflow-stages');
        
        container.addEventListener('mouseover', (e) => {
            const stage = e.target.closest('.workflow-stage');
            if (stage) {
                const index = parseInt(stage.dataset.index);
                Mascot.setWorkflowHover(index);
            }
        });
        
        container.addEventListener('mouseout', () => {
            Mascot.setWorkflowHover(-1);
        });
        
        container.addEventListener('click', (e) => {
            const stage = e.target.closest('.workflow-stage');
            if (stage) {
                const index = parseInt(stage.dataset.index);
                openStageModal(index);
            }
        });
    }
    
    function render() {
        const container = document.getElementById('workflow-stages');
        const state = Store.getState();
        const { workflowState, selectedModel, selectedPhilosophyStatements } = state;
        
        container.innerHTML = '';
        
        stages.forEach((stage, index) => {
            const isReached = index <= workflowState.reachedStage;
            const isActive = index === workflowState.currentStage;
            
            const stageEl = document.createElement('div');
            stageEl.className = `workflow-stage ${isReached ? 'reached' : ''} ${isActive ? 'active' : ''}`;
            stageEl.dataset.index = index;
            stageEl.tabIndex = isReached ? 0 : -1;
            
            const icon = document.createElement('span');
            icon.className = 'stage-icon';
            icon.textContent = stage.icon;
            
            const info = document.createElement('div');
            info.className = 'stage-info';
            
            const name = document.createElement('div');
            name.className = 'stage-name';
            name.textContent = stage.name;
            
            const type = document.createElement('div');
            type.className = 'stage-type';
            type.textContent = stage.type;
            
            info.appendChild(name);
            info.appendChild(type);
            
            stageEl.appendChild(icon);
            stageEl.appendChild(info);
            
            container.appendChild(stageEl);
        });
        
        // Update info text
        const infoEl = document.getElementById('workflow-info');
        if (selectedModel) {
            const score = parseFloat(selectedModel.overall_score) || 0;
            let progression = '';
            if (score >= 90) progression = 'Full progression achieved';
            else if (score >= 70) progression = 'Progression stops at Implementation';
            else progression = 'Progression stops at Architecture';
            
            infoEl.innerHTML = `
                <strong>${selectedModel.model}</strong> (Score: ${score})<br>
                ${progression}<br>
                <small>Click stages to view details</small>
            `;
        } else {
            infoEl.innerHTML = '<p>Select a model to see workflow progression</p>';
        }
    }
    
    function openStageModal(stageIndex) {
        const state = Store.getState();
        const { selectedModel, selectedPhilosophyStatements } = state;
        const stage = stages[stageIndex];
        
        let content = document.createElement('div');
        
        // Stage info
        const stageSection = document.createElement('div');
        stageSection.className = 'modal-section';
        stageSection.innerHTML = `
            <h4>Stage Information</h4>
            <p><strong>${stage.name}</strong> - ${stage.type}</p>
            <p>Stage ${stageIndex + 1} of ${stages.length}</p>
        `;
        content.appendChild(stageSection);
        
        // Model info if selected
        if (selectedModel) {
            const modelSection = document.createElement('div');
            modelSection.className = 'modal-section';
            modelSection.innerHTML = `
                <h4>Selected Model</h4>
                <p><strong>${selectedModel.model}</strong></p>
                <p>Overall Score: ${selectedModel.overall_score}</p>
            `;
            content.appendChild(modelSection);
        }
        
        // Philosophy context if selected
        if (selectedPhilosophyStatements.length > 0) {
            const philSection = document.createElement('div');
            philSection.className = 'modal-section';
            philSection.innerHTML = '<h4>Selected Philosophy</h4>';
            
            selectedPhilosophyStatements.forEach(phil => {
                const p = document.createElement('p');
                p.style.marginBottom = '0.5rem';
                p.innerHTML = `<span class="statement-category ${phil.category.toLowerCase()}">${phil.category}</span><br>${phil.statement}`;
                philSection.appendChild(p);
            });
            
            content.appendChild(philSection);
        }
        
        Components.Modal({
            title: `${stage.icon} ${stage.name}`,
            content: content,
            onClose: () => {
                Store.dispatch({
                    type: Store.ACTIONS.SET_WORKFLOW_STAGE,
                    payload: stageIndex
                });
            }
        });
    }
    
    return {
        init,
        render
    };
})();
