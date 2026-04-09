/**
 * MAIN APPLICATION CONTROLLER
 * Orchestrates all features through the Store.
 */
document.addEventListener('DOMContentLoaded', () => {
    const leaderboardMgr = new LeaderboardManager(store);
    const mascot = new Mascot('mascot-container');
    
    // --- UI Selectors ---
    const workflowContainer = document.getElementById('workflow-container');
    const leaderboardContainer = document.getElementById('leaderboard-container');
    const philosophyNav = document.querySelector('.philosophy-nav');
    const modalRoot = document.getElementById('modal-root');
    const notificationHost = document.getElementById('notification-host');

    // --- Philosophy Data ---
    const PHILOSOPHY_STATEMENTS = [
        { id: 'p1', category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
        { id: 'p2', category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
        { id: 'ph1', category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
        { id: 'ph2', category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
        { id: 't1', category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
        { id: 't2', category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
        { id: 't3', category: 'Technical', text: 'Own your infrastructure. Own your data' },
    ];

    // --- Render Function (The single UI commit per tick) ---
    function render(state) {
        renderPhilosophy(state);
        renderWorkflow(state);
        renderLeaderboard(state);
        renderNotifications(state);
        
        // Component behaviors
        mascot.update(state);
        document.body.setAttribute('data-theme', state.theme);
        
        // Modal handling
        if (state.workflowState === 'modal-open') {
            showModal(state);
        } else {
            modalRoot.classList.add('hidden');
        }
    }

    // --- Feature Renderers ---

    function renderPhilosophy(state) {
        philosophyNav.innerHTML = '';
        PHILOSOPHY_STATEMENTS.forEach(p => {
            const isSelected = state.selectedPhilosophyStatements.some(s => s.id === p.id);
            const btn = Components.Button({
                label: p.text,
                variant: isSelected ? 'btn-primary' : 'btn-outline',
                onClick: () => store.dispatch({ type: 'TOGGLE_PHILOSOPHY', payload: p })
            });
            btn.style.marginRight = '10px';
            philosophyNav.appendChild(btn);
        });
    }

    function renderWorkflow(state) {
        workflowContainer.innerHTML = '';
        const allowed = getAvailableStages(state.selectedModel);

        STAGES.forEach((stage, idx) => {
            const isLocked = idx > 0 && !allowed.includes(stage) && !allowed.includes(STAGES[idx-1]);
            const isActive = allowed.includes(stage) && idx <= allowed.indexOf(stage);
            
            const el = document.createElement('div');
            el.className = `workflow-stage ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`;
            el.textContent = stage;
            
            if (!isLocked) {
                el.onclick = () => {
                    store.dispatch({ type: 'SET_WORKFLOW_STATE', payload: 'modal-open' });
                    // Note: In a real app, we'd pass the specific stage index in action payload
                };
            }
            workflowContainer.appendChild(el);
        });
    }

    function renderLeaderboard(state) {
        const data = leaderboardMgr.getProcessedData(state);
        
        let html = `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Score</th>
                        <th>Qualities</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach(row => {
            const isSelected = state.selectedModel?.model === row.model;
            const isTop = row.overall_score === Math.max(...data.map(d => d.overall_score));
            const meetsPhilosophy = leaderboardMgr.checkPhilosophyMatch(row, state.selectedPhilosophyStatements);
            
            const highlightClass = isSelected ? 'row-selected' : '';
            const topClass = isTop ? 'row-top' : '';
            const philClass = (!meetsPhilosophy && state.selectedPhilosophyStatements.length > 0) ? 'style="opacity:0.4"' : '';

            html += `
                <tr class="${highlightClass} ${topClass}" ${philClass} style="cursor:pointer" onclick="handleModelClick('${row.model}')">
                    <td>${row.model}</td>
                    <td>${row.overall_score}</td>
                    <td>${row.code_quality} / ${row.architecture}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        leaderboardContainer.innerHTML = html;
    }

    function renderNotifications(state) {
        notificationHost.innerHTML = '';
        state.notifications.forEach(n => {
            const note = Components.Notification({ message: n.message });
            notificationHost.appendChild(note);
        });
    }

    // --- Interaction Handlers ---

    window.handleModelClick = (modelName) => {
        const model = store.getState().leaderboardData.find(m => m.model === modelName);
        store.dispatch({ type: 'SELECT_MODEL', payload: modelName });
        store.dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: { message: `Selected ${modelName}` } 
        });
    };

    function showModal(state) {
        modalRoot.classList.remove('hidden');
        modalRoot.innerHTML = '';
        
        const content = document.createElement('div');
        content.className = 'modal-content';
        
        const closeBtn = Components.Button({
            label: 'Close',
            onClick: () => store.dispatch({ type: 'SET_WORKFLOW_STATE', payload: 'idle' })
        });

        const title = document.createElement('h2');
        title.textContent = state.selectedModel ? `Model: ${state.selectedModel.model}` : "Workflow Detail";

        const info = document.createElement('p');
        if (state.selectedModel) {
            info.textContent = `Current Score: ${state.selectedModel.overall_score}`;
        }

        content.appendChild(closeBtn);
        content.appendChild(title);
        content.appendChild(info);
        modalRoot.appendChild(content);
    }

    // --- Bootstrap ---
    store.subscribe(render);
    leaderboardMgr.fetchAll();
});
