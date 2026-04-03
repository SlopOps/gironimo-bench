# 🦒 Gironimo Website

A static website for exploring AI model benchmarks with an interactive giraffe mascot, philosophy explorer, workflow visualization, and CSV-driven leaderboard.

## Deployment

This site is designed for **GitHub Pages** deployment.

### Setup

1. Ensure your repository has GitHub Pages enabled (Settings → Pages → Source: Deploy from Branch → main/root or main/docs)
2. Place all files in `/docs/gironimo/` (or root if preferred)
3. The CSV file should be available at `/results/leaderboard.csv` relative to the site root

### File Structure

```
/docs/gironimo/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # All styles (responsive, accessible)
├── js/
│   ├── store.js        # Centralized state management
│   ├── components.js   # Reusable UI components
│   ├── mascot.js       # Interactive giraffe mascot
│   ├── philosophy.js   # Philosophy explorer feature
│   ├── workflow.js     # Workflow visualization
│   ├── leaderboard.js  # CSV-driven leaderboard
│   └── app.js          # Application initialization
└── README.md           # This file

/results/
└── leaderboard.csv     # Runtime data source (evaluator-provided)
```

### CSV Runtime Loading

The leaderboard fetches data at runtime from `/results/leaderboard.csv`. This path is relative to the domain root, so on GitHub Pages it resolves to `https://yourusername.github.io/results/leaderboard.csv`.

**CSV Format:**
```csv
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
ModelName,2024-01-15,https://...,https://...,85,1,8,9,8,9,8,9,9,8,85.5
```

## Architecture

### Store Design

The application uses a **single centralized store** (`store.js`) with the following characteristics:

- **Single source of truth**: All state in one immutable object
- **Reducer-based updates**: Actions dispatched → reducer produces new state → UI updates
- **Subscription pattern**: Components subscribe to state changes
- **Atomic updates**: All state changes in a tick resolve to single render

**State Shape:**
```javascript
{
    theme: 'dark' | 'light',
    selectedPhilosophyStatements: Array<{statement, category}>,
    selectedModel: Object | null,
    workflowState: {
        stages: Array<string>,
        currentStage: number,
        reachedStage: number
    },
    leaderboardData: Array<Object>,
    leaderboardSort: string,
    notification: Object | null
}
```

### Reducer Strategy

All state transitions go through the reducer function in `store.js`. Actions are plain objects with `type` and `payload`.

Example flow:
1. User clicks model → `SELECT_MODEL` action dispatched
2. Reducer calculates workflow progression based on score
3. New state emitted → subscribers update UI

### Atomic Update Model

State updates batch within a single execution tick. The store compares previous and next state, only notifying subscribers if changed.

### Derived State Handling

Derived values (sorting, filtering, highlighting) are computed during render, never stored:

```javascript
// In leaderboard.js - computed on demand
function getSortedData() {
    const { leaderboardData, leaderboardSort } = Store.getState();
    return [...leaderboardData].sort(/* ... */);
}
```

### Error Handling

Graceful degradation at multiple levels:

- **Missing CSV**: Error message displayed, UI remains functional
- **Corrupted CSV**: Invalid rows skipped, valid data displayed
- **Empty dataset**: "No data available" message
- **Corrupted localStorage**: Falls back to defaults
- **Rapid state updates**: Batched through store subscription

## Features

### 1. Component System
- Button, Card, Modal, Tooltip, Notification, ThemeProvider
- Props-driven, no feature-specific logic
- Accessible (ARIA attributes, keyboard navigation)

### 2. Philosophy Explorer
- 7 statements across 3 categories (Practical, Philosophical, Technical)
- Multi-select with persistence to localStorage
- Category filtering
- Affects leaderboard highlighting and mascot behavior

### 3. Interactive Mascot (Giraffe)
- Canvas-based animation
- State machine driven by store state
- Behaviors: idle motion, philosophy orientation, model-based positioning, theme transition effects
- Workflow hover responses

### 4. Workflow System
- 7 stages: Spec → Gate → Architecture → Gate → Implementation → Review → ADR
- Progression based on selected model score:
  - ≥90: Full progression
  - 70-89: Stops at Implementation
  - <70: Stops at Architecture
- Click stages for modal details

### 5. Leaderboard
- Fetches CSV at runtime
- Sortable by score/date/alphabetical
- Row selection persists
- Top performer visually emphasized
- Philosophy-based highlighting
- Graceful error handling

## Accessibility

- WCAG AA compliant
- Keyboard navigation throughout
- ARIA labels and roles
- Focus management in modals
- Reduced motion support (`prefers-reduced-motion`)
- High contrast text ratios

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- 20+ models supported with smooth sorting/filtering
- Canvas animations use requestAnimationFrame
- Efficient DOM updates via store subscriptions
- No external dependencies
