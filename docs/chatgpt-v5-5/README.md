# Gironimo Explorer

## Deployment

GitHub Pages compatible.

Place directory under:

/docs/gpt55/

CSV file:

/docs/results/leaderboard.csv

Runtime URL:

/results/leaderboard.csv

No backend required.

---

## File Structure

/docs/gpt55/
├── index.html
├── css/styles.css
├── js/store.js
├── js/app.js
├── js/components.js
├── js/csv.js
├── js/leaderboard.js
├── js/workflow.js
├── js/mascot.js
├── js/philosophy.js
├── js/persistence.js

---

## Architecture

### Single Store

One centralized state object.

Required state:

- theme
- selectedPhilosophyStatements
- selectedModel
- workflowState
- leaderboardData

Additional UI state:

- modal
- notifications

### Reducer Strategy

All mutations pass through:

dispatch(action)

Reducer computes next state.

No direct mutation allowed.

### Atomic Update Model

Dispatch schedules subscriber updates using:

queueMicrotask()

Multiple updates in same tick result in:

- one render
- one UI commit

### Derived State

Not stored:

- sorting
- ranking
- workflow completion
- top performer
- mascot orientation

Computed during render only.

### Persistence

localStorage used.

Corrupt storage handled safely.

### Error Handling

Gracefully handles:

- missing CSV
- corrupt CSV
- empty CSV
- corrupt localStorage

UI remains operational.

---

## Build Tooling

No build tooling used.

Pure static HTML/CSS/JavaScript.

Compatible with GitHub Pages.
