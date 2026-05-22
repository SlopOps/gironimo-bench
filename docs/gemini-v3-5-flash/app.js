/**
 * 🦒 Gironimo Engine — Pure Architecture Core Script
 * Fully Reducer-Driven, Client-Side Only Data Architecture System.
 */

// Philosophy Archetype Definition Dataset Map Matrix
const PHILOSOPHY_STATEMENTS = [
    { id: 'p1', category: 'Practical', statement: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { id: 'p2', category: 'Practical', statement: 'Human gates at specification and architecture catch expensive mistakes early' },
    { id: 'p3', category: 'Philosophical', statement: 'AI amplifies human judgment; it doesn\'t replace it' },
    { id: 'p4', category: 'Philosophical', statement: 'Stand tall. See far. Move deliberately' },
    { id: 'p5', category: 'Technical', statement: 'Two-model critique catches what single-model confidence misses' },
    { id: 'p6', category: 'Technical', statement: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { id: 'p7', category: 'Technical', statement: 'Own your infrastructure. Own your data' }
];

const WORKFLOW_STAGES = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

// Default Fallback Baseline Configuration Matrix Space
const INITIAL_STATE = {
    theme: 'dark',
    selectedPhilosophyStatements: [], // Array matching ID strings
    philosophyFilter: 'All',          // UI Derived Filter Condition flag
    selectedModel: null,              // Selected Object Model Metadata Entity
    workflowState: { activeStage: null },
    leaderboardData: { status: 'LOADING', data: [], error: null },
    activeModal: null                 // Active stage modal configuration reference data
};

/**
 * Global Pure Store State Core Architecture Class
 */
class CentralizedStore {
    constructor(reducer, initialState) {
        this.reducer = reducer;
        this.state = this.loadPersistedState(initialState);
        this.listeners = [];
        this.isTicking = false;
    }

    getState() {
        return this.state;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    dispatch(action) {
        // Reducer updates state deterministically
        const nextState = this.reducer(this.state, action);
        if (nextState !== this.state) {
            this.state = nextState;
            this.persistState();
            this.requestAtomicRender();
        }
    }

    requestAtomicRender() {
        if (!this.isTicking) {
            this.isTicking = true;
            // Atomic update rule enforcement across current frame tick execution space
            window.requestAnimationFrame(() => {
                this.listeners.forEach(listener => listener(this.state));
                this.isTicking = false;
            });
        }
    }

    loadPersistedState(fallback) {
        try {
            const saved = localStorage.getItem('gironimo_production_state');
            if (!saved) return fallback;
            const parsed = JSON.parse(saved);
            
            // Re-bind architecture boundaries cleanly to verify schemas integrity safely
            return {
                ...fallback,
                theme: parsed.theme === 'light' ? 'light' : 'dark',
                selectedPhilosophyStatements: Array.isArray(parsed.selectedPhilosophyStatements) ? parsed.selectedPhilosophyStatements : [],
                selectedModel: parsed.selectedModel || null
            };
        } catch (e) {
            console.error("Corrupted operational state matrix context detected. Purging invalid structural elements.", e);
            return fallback;
        }
    }

    persistState() {
        try {
            const stateToSave = {
                theme: this.state.theme,
                selectedPhilosophyStatements: this.state.selectedPhilosophyStatements,
                selectedModel: this.state.selectedModel
            };
            localStorage.setItem('gironimo_production_state', JSON.stringify(stateToSave));
        } catch (e) {
            console.error("Failed to commit global core state telemetry mapping bounds inside LocalStorage scope.", e);
        }
    }
}

/**
 * Core Orchestration Action Action-Type Reducer Engine Process Tree Mapping
 */
function applicationReducer(state, action) {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };

        case 'TOGGLE_PHILOSOPHY': {
            const current = state.selectedPhilosophyStatements;
            const next = current.includes(action.payload) 
                ? current.filter(id => id !== action.payload) 
                : [...current, action.payload];
            return { ...state, selectedPhilosophyStatements: next };
        }

        case 'SET_PHILOSOPHY_FILTER':
            return { ...state, philosophyFilter: action.payload };

        case 'SELECT_MODEL':
            return { ...state, selectedModel: action.payload };

        case 'SET_LEADERBOARD_DATA':
            return { ...state, leaderboardData: { status: action.status, data: action.data || [], error: action.error || null } };

        case 'OPEN_STAGE_MODAL':
            return { ...state, activeModal: action.payload };

        case 'CLOSE_MODAL':
            return { ...state, activeModal: null };

        default:
            return state;
    }
}

// Global Core State Allocation Process Hook
const store = new CentralizedStore(applicationReducer, INITIAL_STATE);

/**
 * DERIVED DATA RULE ENGINE
 * Pure dynamic evaluation runtime. Zero structural duplication.
 */
function computeDerivedState(state) {
    const rawData = state.leaderboardData.data;
    
    // 1. Process active filters and highlighting contexts dynamically
    const selectedPhilosophies = PHILOSOPHY_STATEMENTS.filter(p => state.selectedPhilosophyStatements.includes(p.id));
    const activeCategories = [...new Set(selectedPhilosophies.map(p => p.category))];
    
    // Evaluate operational checklist highlights configuration maps dynamically
    const dynamicHighlightMap = {};
    rawData.forEach(row => {
        let matchesHighlight = false;
        if (activeCategories.length > 0) {
            matchesHighlight = activeCategories.every(cat => {
                if (cat === 'Practical') return (row.code_quality >= 8 && row.feature_complete >= 8);
                if (cat === 'Philosophical') return row.architecture >= 8;
                if (cat === 'Technical') return row.best_practices >= 8;
                return false;
            });
        }
        dynamicHighlightMap[row.model] = matchesHighlight && activeCategories.length > 0;
    });

    // 2. Compute dynamic operational maximum ranking tracking matrix bounds
    let topModelName = null;
    if (rawData.length > 0) {
        const sortedByScore = [...rawData].sort((a, b) => b.overall_score - a.overall_score);
        topModelName = sortedByScore[0]?.model;
    }

    // 3. Workflow Progression Bounds Limits Resolution Logic Engine
    let workflowLimitIndex = WORKFLOW_STAGES.length; // No limits by default
    if (state.selectedModel) {
        const score = state.selectedModel.overall_score;
        if (score < 70) {
            workflowLimitIndex = WORKFLOW_STAGES.indexOf('Architecture') + 1; // Terminates at Architecture stage index limits boundary safely
        } else if (score >= 70 && score < 90) {
            workflowLimitIndex = WORKFLOW_STAGES.indexOf('Implementation') + 1; // Terminates at Implementation bounds execution context safely
        }
    } else {
        workflowLimitIndex = 0; // Lock structural progression completely whenever an active verification context object hasn't been instantiated yet
    }

    // 4. Finite Behavior State Machine Mascot Vector Tracker Engine Matrix Resolution
    let mascotState = 'IDLE';
    let mascotSpeech = '';
    if (state.activeModal) {
        mascotState = 'WORKFLOW_HOVER';
        mascotSpeech = `Analyzing workflow parameters at the ${state.activeModal} environment checkpoint layer.`;
    } else if (state.selectedModel) {
        mascotState = 'MODEL_SELECTED';
        mascotSpeech = `Tracking metrics for ${state.selectedModel.model}. Overall Index score hits ${state.selectedModel.overall_score} tier bounds.`;
    } else if (state.selectedPhilosophyStatements.length > 0) {
        mascotState = 'PHILOSOPHY_SELECTED';
        mascotSpeech = `Aligning processing cores with active configuration philosophies vector constraints.`;
    }

    return {
        highlightedModelsMap: dynamicHighlightMap,
        topModelName,
        workflowLimitIndex,
        mascotState,
        mascotSpeech,
        filteredPhilosophies: PHILOSOPHY_STATEMENTS.filter(p => state.philosophyFilter === 'All' || p.category === state.philosophyFilter)
    };
}

/**
 * CLIENT SIDE ASYNC NETWORK COMMS LOGIC VECTOR
 * Runtime parsing infrastructure mapped explicitly targeting local CSV nodes pipelines.
 */
async function fetchAndParseLeaderboard() {
    const RUNTIME_CSV_URL = '/results/leaderboard.csv';
    try {
        const response = await fetch(RUNTIME_CSV_URL);
        if (!response.ok) throw new Error(`HTTP network degradation event occurred: Status ${response.status}`);
        
        const text = await response.text();
        const parsedRows = parseCSV(text);
        
        store.dispatch({ type: 'SET_LEADERBOARD_DATA', status: 'SUCCESS', data: parsedRows });
    } catch (err) {
        console.error("Critical remote fetch failure context execution tracking event logged.", err);
        store.dispatch({ type: 'SET_LEADERBOARD_DATA', status: 'ERROR', error: err.message });
        createNotification('danger', 'Failed to retrieve core metrics leaderboard resource safely from runtime repository routes.');
    }
}

function parseCSV(csvText) {
    if (!csvText || csvText.trim() === '') return [];
    
    const lines = csvText.split(/\r?\n/);
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        if (values.length !== headers.length) continue; // Malformed verification line boundary checks
        
        const rowObj = {};
        headers.forEach((header, index) => {
            const rawVal = values[index];
            // Numerical structural cast layers mappings definitions configurations validation gates
            if (['speed', 'one_shot_attempts', 'design', 'architecture', 'code_quality', 'feature_complete', 'performance', 'accessibility', 'best_practices', 'value', 'overall_score'].includes(header)) {
                const parsedNum = parseFloat(rawVal);
                rowObj[header] = isNaN(parsedNum) ? 0 : parsedNum;
            } else {
                rowObj[header] = rawVal || '';
            }
        });
        results.push(rowObj);
    }
    return results;
}

/**
 * UI NOTIFICATION ENGINE
 */
function createNotification(type, message) {
    const zone = document.getElementById('notification-zone');
    if (!zone) return;
    
    const alert = document.createElement('div');
    alert.className = `p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm bg-white dark:bg-gray-800 ${
        type === 'danger' ? 'border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400' : 'border-brand-200 dark:border-brand-900/50 text-brand-600 dark:text-brand-400'
    }`;
    alert.innerHTML = `<span>${type === 'danger' ? '🚨' : '⚡'}</span><div>${message}</div>`;
    
    zone.appendChild(alert);
    // Force DOM layout thrashing avoidance cycle context
    setTimeout(() => { alert.classList.remove('translate-y-2', 'opacity-0'); }, 10);
    
    setTimeout(() => {
        alert.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => alert.remove(), 300);
    }, 4000);
}

/**
 * SYSTEM UI ATOMIC RENDERING COMMITS ENGINE
 * Zero structural mutation triggers except via pure state updates pipelines.
 */
function renderApplication(state) {
    const derived = computeDerivedState(state);

    // 1. Theme Configuration Tree Reconciliation
    const htmlElement = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    if (state.theme === 'dark') {
        htmlElement.classList.add('dark');
        if (themeIcon) themeIcon.textContent = '🌙';
    } else {
        htmlElement.classList.remove('dark');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    // 2. Mascot Rendering Matrix State Machine Updates Engine Hook
    const mascotLbl = document.getElementById('mascot-state-lbl');
    const neckTransformNode = document.getElementById('giraffe-neck');
    const bubbleNode = document.getElementById('mascot-speech-bubble');
    
    if (mascotLbl) mascotLbl.textContent = derived.mascotState.replace('_', ' ');
    if (bubbleNode) {
        if (derived.mascotSpeech) {
            bubbleNode.textContent = derived.mascotSpeech;
            bubbleNode.classList.remove('opacity-0');
        } else {
            bubbleNode.classList.add('opacity-0');
        }
    }
    
    if (neckTransformNode) {
        // Execute coordinate system geometric transforms depending entirely on structural execution environments state paths
        if (derived.mascotState === 'PHILOSOPHY_SELECTED') {
            neckTransformNode.style.transform = 'rotate(-12deg)';
        } else if (derived.mascotState === 'MODEL_SELECTED') {
            neckTransformNode.style.transform = 'rotate(10deg)';
        } else if (derived.mascotState === 'WORKFLOW_HOVER') {
            neckTransformNode.style.transform = 'rotate(-5deg) scaleY(1.05)';
        } else {
            neckTransformNode.style.transform = 'rotate(0deg)';
        }
    }

    // 3. Render Philosophy Component Explorer
    const philosophyContainer = document.getElementById('philosophy-list');
    if (philosophyContainer) {
        philosophyContainer.innerHTML = derived.filteredPhilosophies.map(item => {
            const isSelected = state.selectedPhilosophyStatements.includes(item.id);
            return `
                <button data-id="${item.id}" class="w-full text-left p-3.5 rounded-xl border text-xs font-medium smooth-transition flex items-start gap-3 focus:outline-none ${
                    isSelected 
                        ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-500 text-brand-900 dark:text-brand-300 shadow-sm' 
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }" aria-pressed="${isSelected}">
                    <span class="mt-0.5 text-base">${isSelected ? '✅' : '⬜'}</span>
                    <div class="flex-1">
                        <span class="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider font-bold mb-1.5 ${
                            item.category === 'Practical' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' :
                            item.category === 'Technical' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                            'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
                        }">${item.category}</span>
                        <p class="leading-relaxed text-gray-700 dark:text-gray-200 font-medium">${item.statement}</p>
                    </div>
                </button>
            `;
        }).join('');
    }

    // Update Filter tabs visualization parameters dynamically
    ['All', 'Practical', 'Philosophical', 'Technical'].forEach(cat => {
        const btn = document.getElementById(`filter-${cat.toLowerCase()}`);
        if (btn) {
            const isActive = state.philosophyFilter === cat;
            btn.className = `px-2.5 py-1 rounded-md transition-colors ${isActive ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`;
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        }
    });

    // 4. Render Operational Workflows Systems Line Tracking Matrix Pipeline Track Card Components
    const workflowModelBadge = document.getElementById('workflow-model-badge');
    const workflowTrack = document.getElementById('workflow-track');
    
    if (workflowModelBadge) {
        workflowModelBadge.textContent = state.selectedModel ? `${state.selectedModel.model} (${state.selectedModel.overall_score})` : 'No Model Selected';
    }

    if (workflowTrack) {
        workflowTrack.innerHTML = WORKFLOW_STAGES.map((stage, index) => {
            const isAccessible = index < derived.workflowLimitIndex;
            const isGate = stage === 'Gate';
            
            return `
                <button data-stage="${stage}" data-index="${index}" ${!isAccessible ? 'disabled' : ''} class="flex-1 min-w-[70px] smooth-transition p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1 focus:outline-none ${
                    isGate ? 'border-dashed' : ''
                } ${
                    isAccessible 
                        ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-brand-500 cursor-pointer shadow-sm hover:shadow text-gray-900 dark:text-gray-100' 
                        : 'bg-gray-100 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 opacity-40 cursor-not-allowed text-gray-400 dark:text-gray-600'
                }">
                    <span class="text-xs font-bold block">${stage}</span>
                    <span class="text-[9px] block font-mono ${isAccessible ? 'text-emerald-500' : 'text-gray-400'}">${isAccessible ? '🔓 Active' : '🔒 Locked'}</span>
                </button>
            `;
        }).join('');
    }

    // 5. Render Core Datagrid Stream Matrix Tables
    const stateContainer = document.getElementById('leaderboard-state-container');
    const tableWrapper = document.getElementById('leaderboard-table-wrapper');
    const tbody = document.getElementById('leaderboard-tbody');
    const sortSelect = document.getElementById('sort-select');

    if (sortSelect) sortSelect.value = sortSelect.value; // Keeps user interactive state aligned across dynamic render cycles

    if (state.leaderboardData.status === 'LOADING') {
        if (stateContainer) {
            stateContainer.classList.remove('hidden');
            document.getElementById('leaderboard-state-icon').textContent = '⏳';
            document.getElementById('leaderboard-state-title').textContent = 'Querying Remote Core CSV Array Data...';
        }
        if (tableWrapper) tableWrapper.classList.add('hidden');
    } else if (state.leaderboardData.status === 'ERROR') {
        if (stateContainer) {
            stateContainer.classList.remove('hidden');
            document.getElementById('leaderboard-state-icon').textContent = '❌';
            document.getElementById('leaderboard-state-title').textContent = 'Failed to Load Grid Context Telemetry';
            document.getElementById('leaderboard-state-desc').textContent = state.leaderboardData.error;
        }
        if (tableWrapper) tableWrapper.classList.add('hidden');
    } else {
        if (stateContainer) stateContainer.classList.add('hidden');
        if (tableWrapper) tableWrapper.classList.remove('hidden');
        
        if (tbody) {
            // Read direct configurations targeting sort indices safely inside render context allocations
            const currentSortKey = sortSelect ? sortSelect.value : 'overall_score';
            const renderRows = [...state.leaderboardData.data].sort((a, b) => {
                if (currentSortKey === 'model') return a.model.localeCompare(b.model);
                if (currentSortKey === 'date') return new Date(b.date) - new Date(a.date);
                return b.overall_score - a.overall_score; // Default baseline fallback sorting
            });

            if (renderRows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-gray-400 italic">Dataset is parsed clean but contains zero valid record vectors inside layout boundaries.</td></tr>`;
            } else {
                tbody.innerHTML = renderRows.map(row => {
                    const isSelected = state.selectedModel && state.selectedModel.model === row.model;
                    const isTopPerformer = row.model === derived.topModelName;
                    const isHighlighted = derived.highlightedModelsMap[row.model];

                    let rowClass = 'smooth-transition cursor-pointer ';
                    if (isSelected) {
                        rowClass += 'bg-brand-50 dark:bg-brand-900/30 text-brand-900 dark:text-brand-200 border-l-4 border-l-brand-500';
                    } else if (isHighlighted) {
                        rowClass += 'bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200';
                    } else if (isTopPerformer) {
                        rowClass += 'bg-blue-50/40 dark:bg-blue-950/10';
                    } else {
                        rowClass += 'hover:bg-gray-50 dark:hover:bg-gray-800/60';
                    }

                    return `
                        <tr class="${rowClass}" data-model-name="${row.model}">
                            <td class="py-3 px-4 font-semibold">
                                <div class="flex items-center gap-2">
                                    <span>${row.model}</span>
                                    ${isTopPerformer ? '<span class="text-[10px] px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 font-bold rounded">🏆 Top</span>' : ''}
                                    ${isHighlighted ? '<span class="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold rounded">🎯 Aligned</span>' : ''}
                                </div>
                                <span class="text-[10px] text-gray-400 dark:text-gray-500 font-normal block mt-0.5">Eval: ${row.date}</span>
                            </td>
                            <td class="py-3 px-3 text-center">
                                <span class="inline-block px-2 py-0.5 rounded font-mono font-bold ${
                                    row.overall_score >= 90 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' :
                                    row.overall_score >= 70 ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' :
                                    'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                                }">${row.overall_score}</span>
                            </td>
                            <td class="py-3 px-2 text-center font-mono text-gray-500 dark:text-gray-400">${row.speed}s</td>
                            <td class="py-3 px-2 text-center font-mono text-gray-500 dark:text-gray-400">${row.one_shot_attempts}</td>
                            <td class="py-3 px-4 text-right space-x-2">
                                <a href="${row.video_url || '#'}" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline text-[11px] font-bold inline-flex items-center gap-0.5 stop-prop">Media Link ↗</a>
                                <span class="text-gray-300 dark:text-gray-700">|</span>
                                <a href="${row.result_url || '#'}" target="_blank" rel="noopener noreferrer" class="text-brand-500 hover:underline text-[11px] font-bold inline-flex items-center gap-0.5 stop-prop">Artifacts ↗</a>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    // 6. Dialogue Window Modal Systems Updates Frame Handler
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalStageBadge = document.getElementById('modal-stage-badge');
    const modalContentZone = document.getElementById('modal-content-zone');
    const modalBodyCard = document.getElementById('modal-body-card');

    if (state.activeModal) {
        if (modalTitle) modalTitle.textContent = `Stage Environment: ${state.activeModal}`;
        if (modalStageBadge) modalStageBadge.textContent = `Checkpoint Tracker Platform`;
        
        if (modalContentZone) {
            const activePhilosophies = PHILOSOPHY_STATEMENTS.filter(p => state.selectedPhilosophyStatements.includes(p.id));
            const modelMeta = state.selectedModel;
            
            modalContentZone.innerHTML = `
                <div class="space-y-3">
                    <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h4 class="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] mb-1">Target Assessment Telemetry</h4>
                        ${modelMeta ? `
                            <div class="flex justify-between items-center text-sm font-bold">
                                <span>${modelMeta.model}</span>
                                <span class="font-mono text-brand-500">${modelMeta.overall_score} Pts</span>
                            </div>
                            <div class="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px] text-gray-500">
                                <div>Architecture Tier: ${modelMeta.architecture}/10</div>
                                <div>Code Quality Score: ${modelMeta.code_quality}/10</div>
                                <div>Best Practices: ${modelMeta.best_practices}/10</div>
                                <div>Completeness: ${modelMeta.feature_complete}/10</div>
                            </div>
                        ` : '<span class="text-gray-400 italic">No evaluated data-model active across context stream hooks.</span>'}
                    </div>

                    <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h4 class="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] mb-1.5">Enforced System Philosophy Alignment</h4>
                        ${activePhilosophies.length > 0 ? `
                            <ul class="space-y-1.5 list-disc pl-4 text-gray-700 dark:text-gray-300">
                                ${activePhilosophies.map(p => `<li><strong>[${p.category}]</strong> ${p.statement}</li>`).join('')}
                            </ul>
                        ` : '<span class="text-gray-400 italic">Zero telemetry constraints activated. Pipeline progressing via default bounds.</span>'}
                    </div>
                </div>
            `;
        }

        if (modalContainer) {
            modalContainer.classList.remove('hidden');
            // Allow native paint loop execution safely to trigger hardware-accelerated animations smoothly
            setTimeout(() => {
                modalContainer.classList.remove('opacity-0');
                if (modalBodyCard) modalBodyCard.classList.remove('scale-95');
            }, 10);
        }
    } else {
        if (modalContainer) {
            modalContainer.classList.add('opacity-0');
            if (modalBodyCard) modalBodyCard.classList.add('scale-95');
            setTimeout(() => modalContainer.classList.add('hidden'), 300);
        }
    }
}

/**
 * INITIAL BINDINGS & SURFACE EVENT CAPTURE INTERFACES
 */
document.addEventListener('DOMContentLoaded', () => {
    // Connect application core state subscribers array pipelines safely
    store.subscribe(renderApplication);

    // Initial Trigger Processing Pipeline Elements
    store.requestAtomicRender();
    fetchAndParseLeaderboard();

    // 1. Unified Event Delegation Architecture for Interactive Layout Containers
    document.addEventListener('click', (e) => {
        // Prevent event propagation over anchor resource reference endpoints
        if (e.target.closest('.stop-prop')) return;

        // Theme Toggling Logic Interface Trigger Element
        if (e.target.closest('#theme-toggle')) {
            const nextTheme = store.getState().theme === 'dark' ? 'light' : 'dark';
            store.dispatch({ type: 'SET_THEME', payload: nextTheme });
            return;
        }

        // Philosophy Multi-Select Activation Checks Hooks
        const philBtn = e.target.closest('#philosophy-list button');
        if (philBtn) {
            const id = philBtn.getAttribute('data-id');
            store.dispatch({ type: 'TOGGLE_PHILOSOPHY', payload: id });
            return;
        }

        // Category Filter Tabs Selections Action Map Triggers
        const filterBtn = e.target.closest('[id^="filter-"]');
        if (filterBtn && filterBtn.parentElement.getAttribute('role') === 'tablist') {
            const category = filterBtn.id.replace('filter-', '');
            const normalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
            store.dispatch({ type: 'SET_PHILOSOPHY_FILTER', payload: normalizedCategory });
            return;
        }

        // Grid Metric Row Data Selector Hook Action Binding Process
        const tableRow = e.target.closest('#leaderboard-tbody tr');
        if (tableRow) {
            const modelName = tableRow.getAttribute('data-model-name');
            const targetModelObj = store.getState().leaderboardData.data.find(r => r.model === modelName);
            if (targetModelObj) {
                store.dispatch({ type: 'SELECT_MODEL', payload: targetModelObj });
                createNotification('success', `Active deployment evaluation context bound to telemetry row: ${modelName}`);
            }
            return;
        }

        // Pipeline Process Workflow Item Elements Activation Handler
        const workflowBtn = e.target.closest('#workflow-track button');
        if (workflowBtn) {
            const stageName = workflowBtn.getAttribute('data-stage');
            store.dispatch({ type: 'OPEN_STAGE_MODAL', payload: stageName });
            return;
        }

        // Dialog Modal Overlay Exits System Closes Processing Triggers
        if (e.target.id === 'modal-backdrop-close' || e.target.closest('#modal-close-btn')) {
            store.dispatch({ type: 'CLOSE_MODAL' });
        }
    });

    // 2. Direct Dropdown Sort Selection Change Action Listener Interface Hook
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            // Trigger local reactive state pipeline loop flush explicitly
            store.requestAtomicRender();
        });
    }

    // 3. Native Accessibility Escape Key Window Modal Controller Closes System
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && store.getState().activeModal) {
            store.dispatch({ type: 'CLOSE_MODAL' });
        }
    });
});
