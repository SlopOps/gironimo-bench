# 🦒 Gironimo

AI Workflow Benchmark Leaderboard & Philosophy Explorer

A static, client-side application for exploring AI model benchmarks with interactive workflow visualization and philosophy statement selection.

---

## Deployment

### GitHub Pages Setup

1. **Enable GitHub Pages** in your repository settings:
   - Go to **Settings → Pages**
   - Set **Source** to `Deploy from a branch`
   - Select branch `main` (or `master`)
   - Set folder to `/docs` (root)
   - Click **Save**

2. **File Structure**:
```
repository-root/
├── docs/
│   ├── gironimo-v1/          # Application implementation
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── store.js
│   │   │   ├── components.js
│   │   │   ├── mascot.js
│   │   │   └── app.js
│   │   └── README.md
│   └── results/
│       └── leaderboard.csv    # Evaluator-provided data
└── README.md                  # (optional, repo-level)
```

3. **CSV Runtime Loading**:
   - The application fetches `/results/leaderboard.csv` at runtime
   - This path is relative to the GitHub Pages site root
   - Place `leaderboard.csv` in `/docs/results/` in your repository
   - The file will be accessible at `https://<username>.github.io/<repo>/results/leaderboard.csv`

4. **Verification**:
   - After enabling Pages, visit `https://<username>.github.io/<repo>/gironimo-v1/`
   - The app will automatically fetch and display leaderboard data

---

## Architecture

### Store Design

The application uses a **single centralized store** as the only source of truth.

**Location**: `js/store.js`

**Core Principles**:
- Single global state object
- Reducer-based updates (action → next state)
- Subscription-based UI updates
- No duplicated state outside store

**State Structure**:
```javascript
{
  theme: 'light' | 'dark',
  selectedPhilosophyStatements: string[],
  selectedModel: object | null,
  workflowState: {
    activeStage: string | null,
    modalOpen: boolean
  },
  leaderboardData: object[],
  notifications: object[],
  sortKey: string,
  sortDirection: 'asc' | 'desc'
}
```

### Reducer Strategy

The reducer is a **pure function** that takes `(state, action)` and returns a new state:

```javascript
function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    // ... other cases
    default:
      return state;
  }
}
```

**Key Rules**:
- Never mutate state directly
- Always return a new object
- Handle unknown actions gracefully (return state)
- Keep reducer synchronous and pure

### Atomic Update Model

All state updates within a tick resolve into a single render:

1. `dispatch(action)` is called
2. Reducer computes next state
3. State is persisted to `localStorage`
4. All subscribers are notified **once**
5. Each subscriber triggers a single render pass

**No intermediate render states** — the UI never shows partial updates.

### Derived State Handling

**Derived values are NEVER stored** in the state object.

Computed during render only:
- **Sorting**: `getSortedLeaderboard(state)` — sorts `leaderboardData` by `sortKey`/`sortDirection`
- **Filtering**: `getFilteredLeaderboard(state)` — applies philosophy highlighting
- **Grouping**: Computed inline in render functions
- **Ranking**: Top performer determined by `Math.max()` during render
- **UI flags**: `enabled`/`active` computed in `getWorkflowStages(state)`

This ensures the store remains minimal and derived data stays consistent with source data.

### Error Handling Approach

**CSV Fetching** (`js/app.js`):
- Graceful degradation on network failure
- Invalid rows are skipped with console warnings
- Missing values default to `0`
- Corrupted CSV triggers notification, not crash

**localStorage** (`js/store.js`):
- `try/catch` around all `localStorage` operations
- Corrupt/missing state falls back to `initialState`
- Failed persistence logs warning but doesn't block UI

**Rapid State Updates**:
- Store uses reference equality check (`this.state !== prevState`) to prevent unnecessary renders
- Subscriber notifications are synchronous and batched

**General**:
- No uncaught exceptions in render paths
- Empty states displayed for missing data
- Notifications for user-visible errors

---

## Features

### 1. Component System

Reusable, props-driven components in `js/components.js`:

| Component | Purpose |
|-----------|---------|
| `createButton()` | All states, 3 variants, keyboard accessible |
| `createCard()` | Flexible content container |
| `createModal()` | Focus trap, escape close, overlay click |
| `createTooltip()` | 4 positions, hover/focus trigger |
| `createNotification()` | Auto-dismiss, 3 types, aria-live |
| `createThemeProvider()` | Theme toggle, store subscription |

### 2. Philosophy Explorer

Multi-select statement cards with category filtering:
- **Practical**: 2 statements
- **Philosophical**: 2 statements  
- **Technical**: 3 statements

Selection persists to `localStorage` and affects:
- Leaderboard row highlighting
- Workflow context in modals

### 3. Interactive Mascot (Giraffe)

SVG-based mascot driven by **state machine** (`js/mascot.js`):

| Trigger | Behavior |
|---------|----------|
| Idle | Subtle breathing animation |
| Philosophy selected | Orients/bounces based on selection count |
| Theme change | Brightness transition reaction |
| Model selected | Orients based on score tier |
| Workflow hover | Directional response |

### 4. Workflow System

7-stage pipeline: **Spec → Gate → Architecture → Gate → Implementation → Review → ADR**

Progress unlocked by `selectedModel.overall_score`:
- **≥ 90**: Full progression
- **70–89**: Stops at Implementation
- **< 70**: Stops at Architecture

Clicking a stage opens a modal with model metadata and selected philosophy context.

### 5. Leaderboard

CSV-driven, sortable table:
- **Sort by**: Overall score, date, or model name (ascending/descending)
- **Row selection**: Persists to `localStorage`
- **Top performer**: Gold left-border highlight
- **Philosophy highlighting**: Green tint when criteria met

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Requires `localStorage` support
- Requires `fetch` API support
