/* ============================================================
 * Gironimo 🦒
 * Single-file client-side application.
 *
 * Architecture:
 *  - One global store (single source of truth).
 *  - Reducer-based state transitions.
 *  - Subscription-based render: all state updates within a tick
 *    are coalesced into a single render commit (atomic).
 *  - No derived state is stored; all sorting/filtering/highlight
 *    flags are computed at render time.
 *  - Features NEVER touch each other's DOM; they only dispatch
 *    store actions and subscribe to state.
 *  - Persistence via localStorage with safe fallbacks.
 * ============================================================ */
(() => {
  'use strict';

  /* ---------- Static philosophy data (not CSV; the spec hard-codes these) ---------- */
  const PHILOSOPHY = [
    { id: 'p1', category: 'Practical',     text: "Five minutes of correct work beats thirty seconds of plausible garbage" },
    { id: 'p2', category: 'Practical',     text: "Human gates at specification and architecture catch expensive mistakes early" },
    { id: 'p3', category: 'Philosophical', text: "AI amplifies human judgment; it doesn't replace it" },
    { id: 'p4', category: 'Philosophical', text: "Stand tall. See far. Move deliberately" },
    { id: 'p5', category: 'Technical',     text: "Two-model critique catches what single-model confidence misses" },
    { id: 'p6', category: 'Technical',     text: "Documentation is auto-drafted because it fails when it's optional" },
    { id: 'p7', category: 'Technical',     text: "Own your infrastructure. Own your data" },
  ];

  /* ---------- Workflow stages (static) ---------- */
  const WORKFLOW_STAGES = [
    { id: 'spec',          label: 'Spec',          desc: 'Clear, testable specification of intent and acceptance.' },
    { id: 'gate-1',        label: 'Gate',          desc: 'Human review: are we solving the right problem?' },
    { id: 'architecture',  label: 'Architecture',  desc: 'System shape, modules, contracts, data flow.' },
    { id: 'gate-2',        label: 'Gate',          desc: 'Human review: is the design sound and maintainable?' },
    { id: 'implementation',label: 'Implementation',desc: 'Code, tests, instrumentation — built to the spec.' },
    { id: 'review',        label: 'Review',        desc: 'Two-model critique, accessibility pass, performance check.' },
    { id: 'adr',           label: 'ADR',           desc: 'Architecture Decision Record captured for the future.' },
  ];

  /* ---------- Store ---------- */
  const STORAGE_KEY = 'gironimo-state-v1';
  const PERSIST_KEYS = ['theme', 'selectedPhilosophyStatements', 'selectedModel', 'workflowState', 'philosophyCategoryFilter'];

  function safeLoadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
      return null;
    } catch (e) {
      console.warn('[gironimo] persisted state corrupted; ignoring.', e);
      return null;
    }
  }

  function safePersist(state) {
    try {
      const slice = {};
      for (const k of PERSIST_KEYS) slice[k] = state[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
    } catch (e) {
      console.warn('[gironimo] could not persist state', e);
    }
  }

  const persisted = safeLoadPersisted() || {};

  const initialState = {
    theme: persisted.theme === 'dark' ? 'dark' : 'light',
    selectedPhilosophyStatements: Array.isArray(persisted.selectedPhilosophyStatements)
      ? persisted.selectedPhilosophyStatements.filter(s => typeof s === 'string')
      : [],
    selectedModel: persisted.selectedModel && typeof persisted.selectedModel === 'object'
      ? persisted.selectedModel
      : null,
    workflowState: persisted.workflowState && typeof persisted.workflowState === 'object'
      ? persisted.workflowState
      : { open: false, stageId: null, hoverStageId: null, progressCap: 0 },
    leaderboardData: [],            // populated by CSV fetch
    leaderboardStatus: 'loading',   // 'loading' | 'ready' | 'error' | 'empty'
    leaderboardError: null,
    sortBy: 'overall_score',        // 'overall_score' | 'date' | 'alphabetical'
    philosophyCategoryFilter: persisted.philosophyCategoryFilter || 'all',
    notifications: [],              // {id, message, kind}
    mascotBehavior: 'idle',         // state-machine label (see MASCOT_FSM)
    mascotContext: null,            // optional context for current behavior
  };

  function reducer(state, action) {
    switch (action.type) {
      case 'theme/set': {
        const next = action.theme === 'dark' ? 'dark' : 'light';
        if (next === state.theme) return state;
        return { ...state, theme: next };
      }
      case 'philosophy/toggle': {
        const id = action.id;
        const set = new Set(state.selectedPhilosophyStatements);
        if (set.has(id)) set.delete(id); else set.add(id);
        return { ...state, selectedPhilosophyStatements: Array.from(set) };
      }
      case 'philosophy/clear':
        return { ...state, selectedPhilosophyStatements: [] };
      case 'philosophy/setCategory':
        return { ...state, philosophyCategoryFilter: action.category };
      case 'model/select': {
        const m = action.model; // {name,...} or null
        return { ...state, selectedModel: m, mascotBehavior: m ? 'orienting_model' : 'idle' };
      }
      case 'workflow/openModal':
        return { ...state, workflowState: { ...state.workflowState, open: true, stageId: action.stageId } };
      case 'workflow/closeModal':
        return { ...state, workflowState: { ...state.workflowState, open: false, stageId: null } };
      case 'workflow/hoverStage':
        return { ...state, workflowState: { ...state.workflowState, hoverStageId: action.stageId }, mascotBehavior: action.stageId ? 'workflow_hover' : 'idle' };
      case 'workflow/setProgressCap':
        return { ...state, workflowState: { ...state.workflowState, progressCap: action.cap } };
      case 'leaderboard/loaded':
        return { ...state, leaderboardData: action.rows, leaderboardStatus: action.rows.length ? 'ready' : 'empty', leaderboardError: null };
      case 'leaderboard/error':
        return { ...state, leaderboardStatus: 'error', leaderboardError: action.error };
      case 'sort/set':
        return { ...state, sortBy: action.sortBy };
      case 'notify':
        return { ...state, notifications: [...state.notifications, { id: action.id, message: action.message, kind: action.kind || 'info' }] };
      case 'notify/dismiss':
        return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };
      case 'mascot/setBehavior':
        return { ...state, mascotBehavior: action.behavior, mascotContext: action.context || null };
      default:
        return state;
    }
  }

  function createStore(reducerFn, initial) {
    let state = initial;
    const subscribers = new Set();
    let pending = [];
    let scheduled = false;
    let persistOnFlush = true;

    function commit(nextState) {
      const changed = nextState !== state;
      state = nextState;
      if (persistOnFlush) safePersist(state);
      if (changed) {
        for (const fn of subscribers) {
          try { fn(state); } catch (e) { console.error('[gironimo] subscriber error', e); }
        }
      }
    }

    function flush() {
      scheduled = false;
      if (!pending.length) return;
      const actions = pending;
      pending = [];
      let next = state;
      for (const a of actions) {
        try { next = reducerFn(next, a); }
        catch (e) { console.error('[gironimo] reducer error', e); }
      }
      commit(next);
    }

    return {
      getState: () => state,
      dispatch(action) {
        pending.push(action);
        if (!scheduled) {
          scheduled = true;
          // Coalesce: ALL actions within this microtask resolve into ONE render.
          queueMicrotask(flush);
        }
      },
      subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },
      // For boot: replace state without re-persisting and without notifying.
      _hydrate(s) { persistOnFlush = false; commit(s); persistOnFlush = true; },
    };
  }

  const store = createStore(reducer, initialState);

  /* ---------- Theme handling ---------- */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const tgl = document.getElementById('theme-toggle');
    if (tgl) {
      tgl.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      const label = tgl.querySelector('.theme-label');
      if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
  }

  /* ---------- CSV parsing (RFC 4180-ish, with quotes) ---------- */
  function parseCSV(text) {
    const rows = [];
    let cur = [];
    let field = '';
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else { field += c; }
      } else {
        if (c === '"') inQuotes = true;
        else if (c === ',') { cur.push(field); field = ''; }
        else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
        else if (c === '\r') { /* skip */ }
        else { field += c; }
      }
    }
    if (field.length || cur.length) { cur.push(field); rows.push(cur); }
    return rows;
  }

  /* ---------- Leaderboard loader ---------- */
  async function loadLeaderboard() {
    try {
      const res = await fetch('/results/leaderboard.csv', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = parseCSV(text);
      if (!rows.length) {
        store.dispatch({ type: 'leaderboard/loaded', rows: [] });
        return;
      }
      const header = rows[0].map(h => h.trim());
      const required = ['model','date','video_url','result_url','speed','one_shot_attempts','design','architecture','code_quality','feature_complete','performance','accessibility','best_practices','value','overall_score'];
      for (const r of required) if (!header.includes(r)) throw new Error('missing column: ' + r);

      const idx = Object.fromEntries(header.map((h, i) => [h, i]));
      const out = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.every(c => c === '')) continue; // skip blank
        const num = (k) => {
          const v = row[idx[k]];
          const n = parseFloat(v);
          return Number.isFinite(n) ? n : 0;
        };
        const model = (row[idx.model] || '').trim();
        if (!model) continue; // invalid row
        out.push({
          model,
          date: (row[idx.date] || '').trim(),
          video_url: (row[idx.video_url] || '').trim(),
          result_url: (row[idx.result_url] || '').trim(),
          speed: num('speed'),
          one_shot_attempts: num('one_shot_attempts'),
          design: num('design'),
          architecture: num('architecture'),
          code_quality: num('code_quality'),
          feature_complete: num('feature_complete'),
          performance: num('performance'),
          accessibility: num('accessibility'),
          best_practices: num('best_practices'),
          value: num('value'),
          overall_score: num('overall_score'),
        });
      }
      store.dispatch({ type: 'leaderboard/loaded', rows: out });
    } catch (e) {
      console.warn('[gironimo] leaderboard fetch failed', e);
      store.dispatch({ type: 'leaderboard/error', error: e.message || String(e) });
    }
  }

  /* ---------- Derived helpers (computed at render time) ---------- */
  function derivePhilosophy(state) {
    const filter = state.philosophyCategoryFilter;
    return PHILOSOPHY.filter(p => filter === 'all' || p.category === filter);
  }

  function deriveSortedLeaderboard(state) {
    const rows = state.leaderboardData.slice();
    switch (state.sortBy) {
      case 'date':
        rows.sort((a, b) => (b.date || '').localeCompare(a.date || '') || b.overall_score - a.overall_score);
        break;
      case 'alphabetical':
        rows.sort((a, b) => a.model.localeCompare(b.model));
        break;
      case 'overall_score':
      default:
        rows.sort((a, b) => b.overall_score - a.overall_score || a.model.localeCompare(b.model));
    }
    return rows;
  }

  function deriveTopPerformer(rows) {
    if (!rows.length) return null;
    return rows.reduce((best, r) => r.overall_score > best.overall_score ? r : best, rows[0]);
  }

  function deriveProgressCap(model) {
    if (!model) return 0;
    const s = Number(model.overall_score) || 0;
    if (s >= 90) return WORKFLOW_STAGES.length;        // full progression
    if (s >= 70) return 5;                            // stops at Implementation (index 4 inclusive => 5 stages)
    if (s > 0)   return 3;                            // stops at Architecture
    return 0;
  }

  function derivePhilosophyHighlight(model, philosophy) {
    // Returns {practical, philosophical, technical} booleans.
    if (!model) return { practical: false, philosophical: false, technical: false };
    return {
      practical: (Number(model.code_quality) >= 8 && Number(model.feature_complete) >= 8),
      philosophical: Number(model.architecture) >= 8,
      technical: Number(model.best_practices) >= 8,
    };
  }

  /* ---------- Components (props-driven, no feature logic) ---------- */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else if (k === 'aria') for (const [ak, av] of Object.entries(v)) node.setAttribute('aria-' + ak, av);
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v);
      }
    }
    if (children != null) {
      const arr = Array.isArray(children) ? children : [children];
      for (const c of arr) {
        if (c == null || c === false) continue;
        node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
      }
    }
    return node;
  }

  // Button — variants: primary, ghost, link
  function Button({ label, variant = 'primary', icon = null, ariaLabel, pressed = false, onClick, type = 'button', title }) {
    return el('button', {
      class: 'btn btn-' + variant + (pressed ? ' is-pressed' : ''),
      type,
      'aria-label': ariaLabel || null,
      'aria-pressed': pressed ? 'true' : null,
      title: title || null,
      onClick,
    }, [icon, label].filter(Boolean));
  }

  // Card — generic container
  function Card({ title, subtitle, footer, children, className = '' }) {
    return el('article', { class: 'card' + (className ? ' ' + className : '') }, [
      title ? el('header', { class: 'card-head' }, [
        el('h3', null, title),
        subtitle ? el('p', { class: 'muted' }, subtitle) : null,
      ]) : null,
      el('div', { class: 'card-body' }, children),
      footer ? el('footer', { class: 'card-foot' }, footer) : null,
    ]);
  }

  // Tooltip — minimal, title-attribute fallback + custom hover
  function Tooltip({ label, children }) {
    return el('span', { class: 'tooltip', tabindex: '0', 'aria-label': label, title: label }, children);
  }

  // Notification — store-driven
  function Notification({ id, message, kind = 'info' }) {
    const node = el('div', { class: 'notification notification-' + kind, role: 'alert' }, [
      el('span', { class: 'notification-msg' }, message),
      el('button', { class: 'notification-close', 'aria-label': 'Dismiss', onClick: () => store.dispatch({ type: 'notify/dismiss', id }) }, '×'),
    ]);
    node.dataset.id = id;
    return node;
  }

  // Modal — opened via store; renders into modal-root
  function Modal({ open, onClose, children, labelledBy }) {
    if (!open) return null;
    const node = el('div', { class: 'modal-backdrop', onClick: (e) => { if (e.target === node) onClose(); } }, [
      el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': labelledBy || null, tabindex: '-1' }, [
        el('button', { class: 'modal-close', 'aria-label': 'Close', onClick: onClose }, '×'),
        children,
      ]),
    ]);
    setTimeout(() => {
      const f = node.querySelector('.modal');
      if (f) f.focus();
      const onKey = (e) => { if (e.key === 'Escape') { onClose(); document.removeEventListener('keydown', onKey); } };
      document.addEventListener('keydown', onKey);
    }, 0);
    return node;
  }

  // ThemeProvider — just applies theme class to <html>; rendering lives in render loop
  const ThemeProvider = { apply: applyTheme };

  /* ---------- Mascot state machine ---------- */
  /*
   * States:
   *   idle                  - default, subtle motion
   *   orienting_philosophy  - looking at selected statements
   *   orienting_model       - looking at the selected row in leaderboard
   *   theme_changing        - reacting to theme switch
   *   workflow_hover        - reacting to workflow stage hover
   *
   * Transitions are driven entirely by store actions; the render loop
   * reads `mascotBehavior` and applies CSS classes. No DOM-level cross-
   * feature code is needed.
   */
  const MASCOT_FSM = {
    idle: {
      enter(s) { return { bubble: 'Standing tall.', tilt: 0 }; },
    },
    orienting_philosophy: {
      enter(s) {
        const n = s.selectedPhilosophyStatements.length;
        return { bubble: n ? `I see ${n} idea${n>1?'s':''}.` : 'Pick a thought.', tilt: -6 };
      },
    },
    orienting_model: {
      enter(s) {
        const m = s.selectedModel;
        return { bubble: m ? `${m.model} — ${m.overall_score}/10` : 'Choose a model.', tilt: 8 };
      },
    },
    theme_changing: {
      enter() { return { bubble: 'New look!', tilt: 0 }; },
    },
    workflow_hover: {
      enter(s) { return { bubble: s.workflowState.hoverStageId ? WORKFLOW_STAGES.find(x => x.id === s.workflowState.hoverStageId).label : '', tilt: 4 }; },
    },
  };

  function applyMascotState(state) {
    const node = document.getElementById('mascot');
    const glyph = document.getElementById('giraffe-glyph');
    const bubble = document.getElementById('giraffe-bubble');
    const bubbleText = document.getElementById('giraffe-bubble-text');
    const live = document.getElementById('mascot-state');
    if (!node || !glyph) return;

    // Map store behavior to a CSS class
    const map = {
      idle: 'is-idle',
      orienting_philosophy: 'is-philosophy',
      orienting_model: 'is-model',
      theme_changing: 'is-theme',
      workflow_hover: 'is-workflow',
    };
    const cls = map[state.mascotBehavior] || 'is-idle';
    node.classList.remove('is-idle','is-philosophy','is-model','is-theme','is-workflow');
    node.classList.add(cls);

    const fsm = MASCOT_FSM[state.mascotBehavior] || MASCOT_FSM.idle;
    const ctx = fsm.enter(state) || {};
    if (bubble && bubbleText) {
      if (ctx.bubble) {
        bubbleText.textContent = ctx.bubble;
        bubble.setAttribute('opacity', '1');
      } else {
        bubble.setAttribute('opacity', '0');
      }
    }
    if (live) live.textContent = state.mascotBehavior;
  }

  /* ---------- Render (single DOM commit per tick) ---------- */
  function render() {
    const state = store.getState();

    // Theme
    applyTheme(state.theme);

    // Philosophy list
    const list = document.getElementById('philosophy-list');
    const listVisible = derivePhilosophy(state);
    const selectedSet = new Set(state.selectedPhilosophyStatements);
    list.replaceChildren(...listVisible.map(p => {
      const selected = selectedSet.has(p.id);
      return el('li', { class: 'statement' + (selected ? ' is-selected' : ''), role: 'listitem' }, [
        el('label', { class: 'statement-row' }, [
          el('input', {
            type: 'checkbox',
            class: 'statement-check',
            checked: selected ? 'checked' : null,
            'aria-label': p.text,
            onChange: () => store.dispatch({ type: 'philosophy/toggle', id: p.id }),
          }),
          el('span', { class: 'statement-cat', 'aria-hidden': 'true' }, p.category),
          el('span', { class: 'statement-text' }, p.text),
        ]),
      ]);
    }));
    document.getElementById('philosophy-count').textContent =
      `${state.selectedPhilosophyStatements.length} of ${PHILOSOPHY.length} selected`;

    // Category filter chips
    document.querySelectorAll('.category-filters .chip').forEach(chip => {
      const c = chip.dataset.category;
      const active = c === state.philosophyCategoryFilter;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // Leaderboard
    const tbody = document.getElementById('leaderboard-body');
    const status = document.getElementById('leaderboard-status');
    if (state.leaderboardStatus === 'loading') {
      status.textContent = 'Loading leaderboard…';
      tbody.replaceChildren();
    } else if (state.leaderboardStatus === 'error') {
      status.textContent = 'Could not load leaderboard. The CSV may be missing or corrupted.';
      tbody.replaceChildren(el('tr', null, el('td', { colspan: '10', class: 'empty-row' }, state.leaderboardError || '—')));
    } else if (state.leaderboardStatus === 'empty') {
      status.textContent = 'Leaderboard is empty.';
      tbody.replaceChildren(el('tr', null, el('td', { colspan: '10', class: 'empty-row' }, 'No data yet.')));
    } else {
      const sorted = deriveSortedLeaderboard(state);
      const top = deriveTopPerformer(sorted);
      const highlight = derivePhilosophyHighlight(state.selectedModel, state.selectedPhilosophyStatements);
      const philCategories = new Set(
        state.selectedPhilosophyStatements
          .map(id => PHILOSOPHY.find(p => p.id === id))
          .filter(Boolean)
          .map(p => p.category)
      );
      const philActive = state.selectedPhilosophyStatements.length > 0;
      status.textContent = `${sorted.length} model${sorted.length === 1 ? '' : 's'}`;
      tbody.replaceChildren(...sorted.map((m, i) => {
        const isSel = state.selectedModel && state.selectedModel.model === m.model;
        const isTop = top && top.model === m.model;
        const row = el('tr', {
          class: 'lb-row' + (isSel ? ' is-selected' : '') + (isTop ? ' is-top' : ''),
          tabindex: '0',
          'aria-selected': isSel ? 'true' : 'false',
          dataset: { model: m.model },
          onClick: () => onModelSelect(m),
          onKeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onModelSelect(m); } },
        }, [
          el('td', null, isTop ? el('span', { class: 'badge badge-top', 'aria-label': 'Top performer' }, '★ ' + (i + 1)) : String(i + 1)),
          el('td', { class: 'cell-model' }, [
            el('span', { class: 'model-name' }, m.model),
            isTop ? el('span', { class: 'badge badge-top-mini' }, 'Top') : null,
          ]),
          el('td', null, m.date || '—'),
          el('td', { class: 'num' + (philActive && highlight.practical ? ' is-highlight' : '') }, String(m.code_quality)),
          el('td', { class: 'num' + (philActive && highlight.philosophical ? ' is-highlight' : '') }, String(m.architecture)),
          el('td', { class: 'num' + (philActive && highlight.practical ? ' is-highlight' : '') }, String(m.feature_complete)),
          el('td', { class: 'num' }, String(m.accessibility)),
          el('td', { class: 'num' + (philActive && highlight.technical ? ' is-highlight' : '') }, String(m.best_practices)),
          el('td', { class: 'num score' + (isTop ? ' is-top-score' : '') }, m.overall_score.toFixed(1)),
          el('td', { class: 'links' }, [
            m.video_url ? el('a', { href: m.video_url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': m.model + ' video' }, 'video') : '—',
            ' · ',
            m.result_url ? el('a', { href: m.result_url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': m.model + ' result' }, 'result') : '',
          ].filter(Boolean)),
        ]);
        return row;
      }));
    }

    // Sort select
    const sortSel = document.getElementById('sort-by');
    if (sortSel.value !== state.sortBy) sortSel.value = state.sortBy;

    // Workflow
    const cap = deriveProgressCap(state.selectedModel);
    const stages = document.getElementById('workflow-stages');
    const sub = document.getElementById('workflow-sub');
    if (!state.selectedModel) {
      sub.textContent = 'Select a model on the leaderboard to see its workflow.';
    } else {
      sub.textContent = `For ${state.selectedModel.model} (score ${state.selectedModel.overall_score.toFixed(1)}): the workflow progresses through ${cap} of ${WORKFLOW_STAGES.length} stages.`;
    }
    stages.replaceChildren(...WORKFLOW_STAGES.map((s, i) => {
      const reached = i < cap;
      const blocked = i === cap; // next stage to be unlocked, if any
      return el('li', {
        class: 'stage' + (reached ? ' is-reached' : '') + (blocked ? ' is-next' : ''),
        dataset: { stage: s.id, index: String(i) },
        onMouseenter: () => store.dispatch({ type: 'workflow/hoverStage', stageId: s.id }),
        onMouseleave: () => store.dispatch({ type: 'workflow/hoverStage', stageId: null }),
        onFocusin:    () => store.dispatch({ type: 'workflow/hoverStage', stageId: s.id }),
        onFocusout:   () => store.dispatch({ type: 'workflow/hoverStage', stageId: null }),
      }, [
        el('button', {
          class: 'stage-btn',
          type: 'button',
          'aria-label': `${s.label} stage${reached ? ', reached' : blocked ? ', next' : ', locked'}`,
          onClick: () => store.dispatch({ type: 'workflow/openModal', stageId: s.id }),
        }, [
          el('span', { class: 'stage-num' }, String(i + 1)),
          el('span', { class: 'stage-label' }, s.label),
          el('span', { class: 'stage-status', 'aria-hidden': 'true' }, reached ? '✓' : blocked ? '…' : '○'),
        ]),
      ]);
    }));

    // Modal
    const modalRoot = document.getElementById('modal-root');
    modalRoot.replaceChildren(Modal({
      open: state.workflowState.open,
      onClose: () => store.dispatch({ type: 'workflow/closeModal' }),
      labelledBy: 'modal-title',
    }, renderModalBody(state)));

    // Notifications
    const nroot = document.getElementById('notification-root');
    nroot.replaceChildren(...state.notifications.map(n => Notification(n)));

    // Mascot
    applyMascotState(state);
  }

  function renderModalBody(state) {
    const stage = WORKFLOW_STAGES.find(s => s.id === state.workflowState.stageId);
    if (!stage) return [];
    const model = state.selectedModel;
    const phil = state.selectedPhilosophyStatements
      .map(id => PHILOSOPHY.find(p => p.id === id))
      .filter(Boolean);
    return [
      el('header', { class: 'modal-head' }, [
        el('h3', { id: 'modal-title' }, stage.label),
        el('p', { class: 'muted' }, stage.desc),
      ]),
      el('div', { class: 'modal-body' }, [
        el('section', { class: 'modal-section' }, [
          el('h4', null, 'Model'),
          model
            ? Card({ title: model.model, subtitle: `Score ${model.overall_score.toFixed(1)} · ${model.date || 'no date'}`, children: [
                el('dl', { class: 'meta-grid' }, [
                  el('dt', null, 'Code quality'), el('dd', null, String(model.code_quality)),
                  el('dt', null, 'Architecture'), el('dd', null, String(model.architecture)),
                  el('dt', null, 'Feature complete'), el('dd', null, String(model.feature_complete)),
                  el('dt', null, 'A11y'), el('dd', null, String(model.accessibility)),
                  el('dt', null, 'Best practices'), el('dd', null, String(model.best_practices)),
                  el('dt', null, 'Performance'), el('dd', null, String(model.performance)),
                  el('dt', null, 'Speed'), el('dd', null, String(model.speed)),
                  el('dt', null, 'One-shot attempts'), el('dd', null, String(model.one_shot_attempts)),
                ]),
              ]})
            : el('p', { class: 'muted' }, 'No model selected.'),
        ]),
        el('section', { class: 'modal-section' }, [
          el('h4', null, 'Philosophy context'),
          phil.length
            ? el('ul', { class: 'phil-list' }, phil.map(p => el('li', null, [
                el('span', { class: 'phil-cat' }, p.category),
                ' — ',
                p.text,
              ])))
            : el('p', { class: 'muted' }, 'No philosophy selected. The mascot is impartial.'),
        ]),
      ]),
    ];
  }

  function onModelSelect(model) {
    if (state.leaderboardStatus !== 'ready') return;
    const isAlready = store.getState().selectedModel && store.getState().selectedModel.model === model.model;
    store.dispatch({ type: 'model/select', model: isAlready ? null : model });
    if (!isAlready) {
      notify(`Selected ${model.model}`, 'info');
    }
  }

  /* ---------- Notifications (transient) ---------- */
  let notifCounter = 0;
  function notify(message, kind = 'info') {
    const id = 'n' + (++notifCounter);
    store.dispatch({ type: 'notify', id, message, kind });
    setTimeout(() => store.dispatch({ type: 'notify/dismiss', id }), 3200);
  }

  /* ---------- Boot ---------- */
  function bindStatic() {
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const cur = store.getState().theme;
      const next = cur === 'dark' ? 'light' : 'dark';
      store.dispatch({ type: 'theme/set', theme: next });
      store.dispatch({ type: 'mascot/setBehavior', behavior: 'theme_changing' });
      setTimeout(() => {
        // Return to a sensible default behavior after a moment
        const s = store.getState();
        const b = s.selectedModel ? 'orienting_model' : (s.selectedPhilosophyStatements.length ? 'orienting_philosophy' : 'idle');
        store.dispatch({ type: 'mascot/setBehavior', behavior: b });
      }, 1200);
    });

    document.getElementById('philosophy-clear').addEventListener('click', () => {
      store.dispatch({ type: 'philosophy/clear' });
      store.dispatch({ type: 'mascot/setBehavior', behavior: 'idle' });
    });

    document.querySelectorAll('.category-filters .chip').forEach(chip => {
      chip.addEventListener('click', () => {
        store.dispatch({ type: 'philosophy/setCategory', category: chip.dataset.category });
      });
    });

    document.getElementById('sort-by').addEventListener('change', (e) => {
      store.dispatch({ type: 'sort/set', sortBy: e.target.value });
    });

    document.getElementById('mascot').addEventListener('click', () => {
      // Tap-to-poke the mascot: cycle through a quick reaction.
      const s = store.getState();
      if (s.mascotBehavior === 'idle') {
        store.dispatch({ type: 'mascot/setBehavior', behavior: 'orienting_philosophy' });
        setTimeout(() => store.dispatch({ type: 'mascot/setBehavior', behavior: 'idle' }), 1400);
      } else {
        store.dispatch({ type: 'mascot/setBehavior', behavior: 'idle' });
      }
    });
  }

  // The render() function uses store.getState() in event handlers; we expose
  // a stable `state` reference that's refreshed each render.
  let state = store.getState();
  store.subscribe((s) => { state = s; render(); });

  // Re-export for debugging in dev consoles only (does not leak across features).
  window.__gironimo = { store };

  // Initial render before data arrives.
  render();
  bindStatic();
  loadLeaderboard();
})();
