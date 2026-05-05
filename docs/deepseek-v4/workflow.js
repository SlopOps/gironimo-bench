// Workflow System Feature
const GironimoWorkflow = (function() {
    'use strict';
    
    const stages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];
    
    // Calculate workflow progress based on model score
    function calculateProgress(score) {
        if (!score && score !== 0) return 0;
        
        if (score >= 90) return stages.length;
        if (score >= 70) return 5; // Stops at Implementation
        if (score >= 0) return 3; // Stops at Architecture
        return 0;
    }
    
    // Get workflow state based on model score
    function getWorkflowState(score) {
        const progress = calculateProgress(score);
        let currentStage = 'Spec';
        
        if (progress > 0) currentStage = stages[Math.min(progress - 1, stages.length - 1)];
        
        return {
            currentStage,
            stages,
            progress
        };
    }
    
    // Render workflow system
    function render(container) {
        const state = GironimoStore.getState();
        const workflowState = state.workflowState;
        const selectedModel = state.selectedModel;
        
        container.innerHTML = '';
        
        // Create workflow visualization
        const workflowEl = document.createElement('div');
        workflowEl.className = 'workflow-container';
        workflowEl.setAttribute('role', 'navigation');
        workflowEl.setAttribute('aria-label', 'Workflow stages');
        
        stages.forEach((stage, index) => {
            const stageEl = document.createElement('div');
            stageEl.className = 'workflow-stage';
            
            const isActive = index < workflowState.progress;
            const isCurrent = index === workflowState.progress - 1 || 
                            (index === 0 && workflowState.progress === 0);
            
            if (isActive) stageEl.classList.add('active');
            if (isCurrent) stageEl.classList.add('current');
            
            // Stage number/indicator
            const indicator = document.createElement('div');
            indicator.className = 'stage-indicator';
            indicator.textContent = isActive ? '✓' : (index + 1);
            
            // Stage label
            const label = document.createElement('span');
            label.className = 'stage-label';
            label.textContent = stage;
            
            stageEl.appendChild(indicator);
            stageEl.appendChild(label);
            
            // Make clickable if active or current
            if (isActive || isCurrent) {
                stageEl.setAttribute('tabindex', '0');
                stageEl.setAttribute('role', 'button');
                stageEl.setAttribute('aria-label', `Open ${stage} details`);
                
                stageEl.addEventListener('click', () => openStageModal(stage, selectedModel, state));
                stageEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openStageModal(stage, selectedModel, state);
                    }
                });
            } else {
                stageEl.setAttribute('aria-disabled', 'true');
            }
            
            // Add connector line between stages
            if (index < stages.length - 1) {
                const connector = document.createElement('div');
                connector.className = 'stage-connector';
                if (index < workflowState.progress - 1) {
                    connector.classList.add('active');
                }
                workflowEl.appendChild(stageEl);
                workflowEl.appendChild(connector);
            } else {
                workflowEl.appendChild(stageEl);
            }
        });
        
        // Model info if selected
        if (selectedModel) {
            const modelInfo = document.createElement('div');
            modelInfo.className = 'workflow-model-info';
            modelInfo.innerHTML = `
                <p><strong>Current Model:</strong> ${selectedModel.model}</p>
                <p><strong>Score:</strong> ${selectedModel.overall_score || 'N/A'}</p>
            `;
            workflowEl.appendChild(modelInfo);
        }
        
        const card = GironimoComponents.createCard({
            title: 'Workflow System',
            content: workflowEl
        });
        
        container.appendChild(card);
    }
    
    // Open stage modal
    function openStageModal(stage, model, state) {
        const modalContainer = document.getElementById('modalContainer');
        
        let content = `<div class="stage-details">
            <h4>Stage: ${stage}</h4>`;
        
        if (model) {
            content += `
                <div class="model-metadata">
                    <h5>Model Information</h5>
                    <p><strong>Name:</strong> ${model.model}</p>
                    <p><strong>Date:</strong> ${model.date || 'N/A'}</p>
                    <p><strong>Overall Score:</strong> ${model.overall_score || 'N/A'}</p>
                    <p><strong>Speed:</strong> ${model.speed || 'N/A'}</p>
                </div>`;
        }
        
        // Add philosophy context if selected
        if (state.selectedPhilosophyStatements.length > 0) {
            content += `<div class="philosophy-context">
                <h5>Related Philosophy</h5>
                <ul>`;
            
            state.selectedPhilosophyStatements.forEach(statement => {
                content += `<li>${statement}</li>`;
            });
            
            content += `</ul></div>`;
        }
        
        content += '</div>';
        
        const modal = GironimoComponents.createModal({
            id: `stage-${stage.toLowerCase()}`,
            title: `Workflow Stage: ${stage}`,
            content: content,
            onClose: () => {
                // Focus back to the stage element
                const stageEl = document.querySelector(`.workflow-stage[aria-label="Open ${stage} details"]`);
                if (stageEl) stageEl.focus();
            }
        });
        
        modalContainer.appendChild(modal.element);
    }
    
    return {
        render,
        calculateProgress,
        getWorkflowState,
        stages
    };
})();
