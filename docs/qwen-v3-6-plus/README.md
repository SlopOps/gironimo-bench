# 🦒 Gironimo Website

A fully static, client-side AI model leaderboard and workflow explorer. Deployed on GitHub Pages.

## Deployment

### GitHub Pages Setup
1. Push repository to `main` branch.
2. Navigate to **Settings > Pages**.
3. Set Source to `Deploy from a branch` -> `main` -> `/docs/gironimo`.
4. Wait for deployment. Site will be live at `https://<username>.github.io/<repo>/`.

### File Structure
```
docs/
└── gironimo/
    ├── index.html      # Semantic entry point
    ├── style.css       # Responsive, WCAG AA compliant styles
    ├── app.js          # Core application logic
    └── README.md       # Documentation
```

### CSV Runtime Loading
The leaderboard data is fetched at runtime from `/results/leaderboard.csv`. The path is relative to the site root. The application uses `fetch()` and parses the CSV client-side. No build step or server-side processing is required. Missing or malformed CSVs degrade gracefully to an empty state.

## Architecture

### Store Design
A single global `Store` class acts as the source of truth. It maintains:
- `theme`, `selectedPhilosophyStatements`, `selectedModel`, `workflowState`, `leaderboardData`, `notification`.
- Uses `localStorage` for persistence with try/catch corruption guards.

### Reducer Strategy
All state transitions occur through a pure `reduce(state, action)` function. This guarantees predictable updates and strict isolation. Actions like `SET_THEME`, `TOGGLE_PHILOSOPHY`, `SELECT_MODEL`, and `SET_LEADERBOARD` mutate nothing outside the reducer.

### Atomic Update Model
State changes call `scheduleRender()`, which batches UI updates into a single `requestAnimationFrame` tick. This prevents intermediate render states, ensures exactly one UI commit per tick, and blocks no main-thread operations.

### Derived State Handling
Per specification, derived values (sorting, filtering, highlighting, ranking) are **never stored**. They are computed dynamically during the `render()` pass using the current store state and DOM-driven sort toggles.

### Error Handling Approach
- **CSV Failure**: Catches network/parsing errors, dispatches empty array, shows fallback UI.
- **Corrupt localStorage**: Wraps `JSON.parse` in try/catch, falls back to defaults.
- **Missing Values**: CSV parser defaults missing numeric fields to `0` or `-`.
- **Rapid Updates**: `requestAnimationFrame` inherently debounces rapid dispatches into a single render cycle.

## Features
- **Philosophy Explorer**: Multi-select, category filtering, store-persisted.
- **Workflow Pipeline**: 7-stage gate system with score-based progression (`≥90`, `70–89`, `<70`).
- **Interactive Mascot**: SVG giraffe driven by a behavior tree evaluating store state.
- **Leaderboard**: Runtime CSV-driven, sortable, accessible, philosophy-highlighting rules.
- **Notifications**: Store-triggered, `aria-live` compliant.
