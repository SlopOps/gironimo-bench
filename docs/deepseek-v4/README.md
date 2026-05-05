# 🦒 Gironimo - AI Model Evaluation Platform

A static web application for evaluating and comparing AI models, featuring an interactive giraffe mascot, philosophy explorer, workflow system, and CSV-driven leaderboard.

## Deployment

### GitHub Pages Setup

1. Ensure the repository is configured for GitHub Pages
2. The site is served from `/docs/gironimo/`
3. Set GitHub Pages source to the main branch, `/docs` folder

### File Structure

```
/docs/gironimo/
├── index.html          # Main HTML entry point
├── styles.css          # Complete design system
├── store.js            # Centralized state management
├── components.js       # Reusable UI components
├── mascot.js           # Interactive giraffe mascot
├── philosophy.js       # Philosophy explorer feature
├── workflow.js         # Workflow system feature
├── leaderboard.js      # CSV-driven leaderboard
├── app.js              # Application controller
└── README.md           # This file
```

### CSV Runtime Loading

The leaderboard fetches data at runtime from `/results/leaderboard.csv`. This path is relative to the GitHub Pages root. Ensure your CSV file is placed at:

```
/docs/results/leaderboard.csv
```

The application will gracefully handle:
- Missing CSV files
- Corrupted CSV data
- Empty datasets
- Network errors

## Architecture

### Store Design

The application uses a **single centralized store** (Redux-like pattern) as the only source of truth:

- **State Shape**: Flat, predictable state object
- **Actions**: Type-based action objects dispatched to trigger state changes
- **Reducer**: Pure function that returns new state based on current state and action
- **Subscriptions**: Observer pattern for UI updates

### Reducer Strategy

- All state mutations go through the reducer
- Reducer returns new state objects (immutable updates)
- No side effects in reducer (pure function)
- Action types: `SET_THEME`, `TOGGLE_PHILOSOPHY_STATEMENT`, `SELECT_MODEL`, `SET_WORKFLOW_STATE`, `SET_LEADERBOARD_DATA`, `ADD_NOTIFICATION`, `REMOVE_NOTIFICATION`

### Atomic Update Model

- All state updates within a tick resolve into a single render
- Uses `requestAnimationFrame` for batched UI updates
- No intermediate render states
- Exactly one UI commit per tick

### Derived State Handling

Derived values are **never stored** in the state. They are computed during render:

- **Sorting**: Leaderboard sort order computed from current sort configuration
- **Filtering**: Philosophy-based highlighting computed from selected statements
- **Progress**: Workflow progress derived from model score
- **Ranking**: Top performer identified during render

### Error Handling Approach

The application implements defense-in-depth error handling:

1. **CSV Loading**: Graceful fallback to empty state with user notification
2. **localStorage**: Try-catch with corruption recovery, falls back to initial state
3. **State Updates**: Queue-based dispatch prevents race conditions
4. **Render Errors**: Individual component errors don't crash the app
5. **Network Issues**: Asynchronous operations with error boundaries

## Features

### Philosophy Explorer
- Multi-select philosophy statements across Practical, Philosophical, and Technical categories
- Category filtering
- Persistent selection via store

### Interactive Mascot
- Animated giraffe that responds to application state
- State machine driven behavior (no DOM-driven logic)
- Reacts to philosophy selection, model selection, theme changes, and workflow interaction

### Workflow System
- Visual workflow progression (Spec → Gate → Architecture → Gate → Implementation → Review → ADR)
- Progress based on selected model score
- Clickable stages with modal details
- Model metadata and philosophy context in modals

### Leaderboard
- CSV-driven data fetching at runtime
- Sortable by score, date, and model name
- Row selection with persistent highlighting
- Philosophy-based row highlighting
- Top performer visual emphasis

## Accessibility

The application meets WCAG AA compliance:

- Keyboard navigable
- ARIA labels and roles
- Focus management
- Screen reader support
- High contrast mode support (via themes)
- Responsive design for all viewport sizes

## Build Tooling

No build tools required. This is a vanilla JavaScript implementation that works directly in the browser without any compilation or bundling step.

## Performance

- Efficient DOM updates through atomic rendering
- No blocking operations
- Smooth animations using requestAnimationFrame
- Supports 20+ models without performance degradation
- Instant sorting and filtering (computed during render)
