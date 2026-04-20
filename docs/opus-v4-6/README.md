# 🦒 Gironimo — claude-sonnet-4-6 Implementation

Static site implementation of the Gironimo AI Model Benchmark dashboard.

## Deployment

### GitHub Pages Setup

1. Push repository to GitHub.
2. In repo **Settings → Pages**, set source to `docs/` folder on `main`.
3. Site publishes at `https://<org>.github.io/<repo>/`.

### File Structure

```
/docs/
  claude-sonnet-4-6/
    index.html     ← This implementation (all-in-one)
    README.md

/docs/results/
  leaderboard.csv  ← Evaluator-provided CSV
```

### CSV Runtime Loading

The leaderboard is fetched at runtime via:

```
fetch('/results/leaderboard.csv')
```

This resolves relative to the GitHub Pages domain root (`https://<org>.github.io/<repo>/results/leaderboard.csv`). A fallback to `../results/leaderboard.csv` is attempted if the root path fails (useful for local development).

The CSV is **never hardcoded**. Failures degrade gracefully with an empty state message.

---

## Architecture

### Store Design

Single global state object managed by `Store` (IIFE module pattern):

```js
const Store = (() => {
  let state = { ...INITIAL_STATE, ...loadPersistedState() };
  let subscribers = [];
  // ...
  return { getState, dispatch, subscribe };
})();
```

All state lives here. No state is duplicated outside the store.

### Reducer Strategy

Pure reducer function: `(state, action) → nextState`. Actions are typed objects:

- `SET_THEME` — toggle dark/light
- `TOGGLE_PHILOSOPHY` — multi-select a philosophy statement
- `SELECT_MODEL` — set selected leaderboard row + compute workflow maxStage
- `SET_SORT` / `SET_FILTER` — leaderboard controls
- `SET_LEADERBOARD_DATA` — populated after CSV fetch
- `OPEN_MODAL` / `CLOSE_MODAL` — modal state
- `ADD_NOTIFICATION` / `REMOVE_NOTIFICATION` — notification lifecycle

### Atomic Update Model

All subscribers are notified via `queueMicrotask`, ensuring all synchronous dispatches within a tick merge into a single render pass:

```js
function notify() {
  if (pendingRender) return;
  pendingRender = true;
  queueMicrotask(() => { pendingRender = false; subscribers.forEach(fn => fn(state)); });
}
```

### Derived State Handling

No derived data is stored. All computation happens at render time:

- Leaderboard sort/filter → `getDerivedLeaderboard(state)`
- Philosophy highlights (model × selected categories) → `getPhilosophyHighlights(state)`
- Workflow progression thresholds → computed inside `renderWorkflow`
- Rankings → computed by sorting `leaderboardData` by score

### Persistence

`localStorage` key `gironimo_state` persists `theme` and `selectedPhilosophyStatements`. Corrupted/missing state is caught and silently ignored, falling back to defaults.

### Error Handling

- CSV fetch failure → empty `leaderboardData`, graceful "no data" message
- Malformed CSV rows → silently skipped
- Invalid numeric fields → coerced to `0`
- Corrupted `localStorage` → caught with try/catch, defaults used
- Rapid state updates → batched via `queueMicrotask` atomic update model

---

## Features

- **Philosophy Explorer** — 7 statements across 3 categories, multi-select with category filtering, persisted to localStorage
- **Interactive Giraffe Mascot** — SVG giraffe driven by a state machine (5 states: idle, philosophy, theme_change, model_selected, workflow_hover). Idle animation is continuous RAF loop. Returns to idle after 3s.
- **Workflow System** — 7 stages (Spec → Gate → Architecture → Gate → Implementation → Review → ADR). Progression gated by model score. Stage clicks open modals with model metadata + philosophy context.
- **Leaderboard** — CSV-driven, sortable (score/date/alpha), filterable, row selection persists in store. Top performer highlighted with 🏆. Score badges color-coded.
- **Notifications** — triggered by model selection, store-driven, auto-dismiss after 3s.
- **Themes** — dark/light, full CSS variable system, animated transitions.

---

## Build Tooling

**No build tooling used.** Single `index.html` with inline CSS and JS. No dependencies, no npm, no bundler.

Deploy by copying files to the correct GitHub Pages path. No build step required.
