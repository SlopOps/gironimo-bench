# 🦒 Gironimo

An interactive AI model leaderboard and philosophy explorer with a state-driven giraffe mascot.

## Deployment

### GitHub Pages

This site is designed for GitHub Pages deployment from the `/docs/gironimo/` directory.

1. Go to repository **Settings → Pages**
2. Set source to **Deploy from a branch**
3. Set folder to `/docs`
4. Save

The site will be available at `https://<username>.github.io/<repo>/gironimo/`

### File Structure

```
/docs/gironimo/
├── index.html          # Entry point
├── css/
│   └── styles.css      # Complete design system
├── js/
│   ├── store.js        # Centralized state management
│   ├── components.js   # Reusable UI components
│   ├── giraffe.js      # Interactive mascot (SVG + state machine)
│   ├── leaderboard.js  # CSV-driven leaderboard
│   ├── workflow.js     # Stage-based workflow system
│   ├── philosophy.js   # Philosophy statement explorer
│   └── app.js          # Application orchestrator
└── README.md           # This file
```

### CSV Runtime Loading

The leaderboard fetches `/results/leaderboard.csv` at runtime. This file must exist at the repository root under `results/`. The fetch uses a relative URL, so the CSV path resolves from the site origin.

Expected CSV format:

```
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
```

Invalid rows are silently ignored. Missing numeric values default to 0.

## Architecture

### Store Design

A single centralized store (`window.AppStore`) manages all application state. The store implements:

- **Single global state object** — one source of truth
- **Reducer-based updates** — `(state, action) → nextState`
- **Subscription-based rendering** — UI subscribes to state changes
- **Atomic updates** — all state changes within a microtask tick resolve into a single render cycle via `queueMicrotask`
- **localStorage persistence** — theme, selections, and sort preferences survive page reloads

### Reducer Strategy

The reducer handles these action types:

| Action | Effect |
|--------|--------|
| `SET_THEME` | Updates theme, triggers global re-skin |
| `TOGGLE_PHILOSOPHY_STATEMENT` | Adds/removes from selection array |
| `SET_PHILOSOPHY_FILTER` | Changes visible category |
| `SET_SELECTED_MODEL` | Sets active model, cascades to workflow/mascot |
| `SET_WORKFLOW_MODAL` | Opens/closes workflow modal |
| `SET_WORKFLOW_STAGE` | Sets current workflow stage |
| `SET_WORKFLOW_HOVER` | Tracks hovered stage for mascot |
| `SET_LEADERBOARD_DATA` | Stores parsed CSV data |
| `SET_LEADERBOARD_LOADING` | Loading state flag |
| `SET_LEADERBOARD_ERROR` | Error state with message |
| `SET_SORT` | Column + direction for leaderboard |
| `ADD_NOTIFICATION` | Queues a notification |
| `REMOVE_NOTIFICATION` | Dismisses a notification |

### Atomic Update Model

All dispatches within the same synchronous tick batch into a single microtask. Subscribers receive `(newState, prevState, action)` exactly once per batch, ensuring:

- No intermediate render states
- Exactly one UI commit per tick
- Consistent reads across features

### Derived State Handling

These values are **never stored** — always computed during render:

- Leaderboard sorting and ranking
- Philosophy filtering by category
- Workflow stage states (completed/active/blocked based on score)
- Philosophy highlighting (score-based category matching)
- Score class (high/medium/low)

### Error Handling

| Scenario | Behavior |
|----------|----------|
| Missing CSV | Error message with retry button |
| Corrupted CSV | Parse errors caught, empty data treated as error |
| Empty dataset | "No models found" message |
| Corrupted localStorage | Caught on load, falls back to defaults, clears bad key |
| Rapid state updates | Batching via microtask prevents render thrashing |

### Cross-Feature Integration

All features communicate exclusively through the store. No feature accesses another's internals.

```
User Action → Store.dispatch() → Reducer → New State
                                        ↓
                              Subscriber notifies
                                        ↓
                         Features re-render from state
```

## Design System

- **Fonts**: Cormorant Garamond (display) + DM Mono (body)
- **Dark/Light themes** via `data-theme` attribute and CSS custom properties
- **Fully responsive** — 3-column grid on desktop, stacked on mobile
- **WCAG AA** — focus-visible outlines, aria attributes, keyboard navigation, skip link
- **Texture** — SVG noise overlay for depth

## Build Tooling

No build step required. All files are vanilla HTML, CSS, and JavaScript. Deploy as-is.

## License

Internal project.
