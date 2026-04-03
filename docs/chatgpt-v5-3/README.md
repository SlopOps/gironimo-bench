# Gironimo

## Deployment

1. Push `/docs/gironimo-gpt53/` to your repo
2. Enable GitHub Pages → `/docs` folder
3. CSV must exist at:

/docs/results/leaderboard.csv

Runtime fetch:
`/results/leaderboard.csv`

---

## Architecture

### Store Design
Single global state in `store.js`

### Reducer Strategy
All updates flow via `dispatch(action)`
Pure reducer returns next state

### Atomic Updates
Single dispatch → single render cycle

### Derived State
Sorting, filtering, workflow stage computed inside render

NOT stored in state

### Persistence
Uses `localStorage`
Safe fallback on corruption

---

## Error Handling

- CSV fetch failure → empty dataset
- Invalid rows ignored
- Missing values default to 0
- localStorage guarded

---

## Build Tooling

None used. Pure static deployment.

---

## Accessibility

- semantic buttons
- keyboard clickable
- contrast-safe colors

---

## Notes

- Fully client-side
- No external dependencies
- Store-driven architecture enforced
