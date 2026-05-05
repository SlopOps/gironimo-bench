# 🦒 Gironimo Bench Implementation

Static site implementation for the Gironimo Leaderboard, deployed to GitHub Pages under `/docs/hy3-preview/`.

---

## Deployment

### GitHub Pages Setup
1. Clone this repository
2. Navigate to **Repository Settings > Pages**
3. Set **Build and Deployment**:
   - Branch: `main`
   - Folder: `/docs`
4. The site will be available at `https://<username>.github.io/<repo>/`

### File Structure
```
docs/
  hy3-preview/                # Implementation root (model: hy3-preview)
    index.html                # Main entry HTML
    css/
      style.css               # Global styles, design system, themes
    js/
      store.js                # Centralized state store
      components.js           # Reusable UI components
      features/
        philosophy-explorer.js  # Philosophy Explorer feature
        mascot.js               # Interactive Giraffe mascot
        workflow.js              # Workflow system
        leaderboard.js           # Leaderboard CSV fetch/rendering
      main.js                   # App entry point
  results/
    leaderboard.csv           # Leaderboard data (evaluator-provided)
README.md                     # This file
```

### CSV Runtime Loading
The leaderboard fetches data at runtime from `/results/leaderboard.csv` (maps to `docs/results/leaderboard.csv`). No hardcoded data is used.

---

## Architecture

### Store Design
- Single centralized `Store` manages **all** application state
- Required state fields: `theme`, `selectedPhilosophyStatements`, `selectedModel`, `workflowState`, `leaderboardData`
- All state updates go through dispatched actions (no direct mutation)

### Reducer Strategy
- Single reducer function handles all action types (`SET_THEME`, `TOGGLE_PHILOSOPHY_STATEMENT`, etc.)
- Immutable state updates: reducer returns new state object for every action

### Atomic Update Model
- State updates are batched via `requestAnimationFrame`: multiple dispatches in a single tick trigger only one UI render
- Complies with "exactly one UI commit per tick" rule

### Derived State Handling
All derived values are computed at render time, never stored:
- Leaderboard sorting/filtering
- Workflow progress calculation
- Philosophy-based highlighting
- Mascot behavior state

### Error Handling
| Error Type               | Handling                                      |
|--------------------------|------------------------------------------------|
| Missing/corrupt CSV      | Show user notification, render empty state     |
| Corrupt localStorage     | Reset to default state, clear invalid data    |
| Empty leaderboard dataset| Show "no data" message                         |
| Rapid state updates      | Batched renders prevent UI blocking            |

---

## Accessibility
- **WCAG AA Compliant**: Color contrast ratios ≥ 4.5:1 for all text
- **Keyboard Accessible**: All interactive elements support Tab/Enter/Space
- **ARIA Support**: Modals, checkboxes, tables, and live regions use proper ARIA attributes
- **Focus Management**: Modal focus trapping, auto-focus on open

## Performance
- Client-side only: No backend dependencies
- Instant sorting/filtering for 20+ models (array operations)
- Batched state updates prevent unnecessary re-renders
