# 🦒 Gironimo - AI Model Leaderboard & Workflow System

A production-ready, fully static web application for tracking AI model performance through a structured development workflow.

## Deployment

### GitHub Pages Setup

1. **Repository Structure**: Place all files in `/docs/gironimo/` directory
2. **Enable GitHub Pages**: 
   - Go to repository Settings → Pages
   - Set source to `main` branch `/docs` folder
   - Save changes
3. **Access URL**: `https://[username].github.io/[repo]/docs/gironimo/`

### File Structure

```
/docs/gironimo/
├── index.html          # Main application entry
├── styles.css          # Component styles & theming
├── script.js           # Application logic & store
├── README.md           # This file
└── assets/             # (Optional - inline SVG only)
```

### CSV Runtime Loading

The application fetches leaderboard data at runtime from:
`/results/leaderboard.csv`

**CSV Format Required**:
```csv
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
ModelName,2024-01-01,url,url,85,3,8.5,9.0,8.0,9.0,8.5,7.5,9.0,8.0,85.5
```

**Important**: 
- CSV must be accessible at the exact path `/results/leaderboard.csv`
- Missing values default to 0
- Invalid rows are gracefully ignored

## Architecture

### Single Store Design

The application uses a **unidirectional data flow** with a single source of truth:

```javascript
State {
  theme: 'light' | 'dark',
  selectedPhilosophyStatements: string[],
  selectedModel: object | null,
  workflowState: { currentStage, maxReachableStage, ... },
  leaderboardData: array,
  notifications: array
}
```

### Reducer Strategy

Pure reducer functions handle all state mutations:
- Actions are dispatched with type + payload
- Reducers create new state objects immutably
- No direct state mutations allowed

### Atomic Update Model

All state changes within a single event tick result in **exactly one UI render**:
- Store dispatches action
- Reducer creates new state
- `requestAnimationFrame` batches updates
- Single render call with complete state

### Derived State Handling

**No derived data is stored**. All computed values are calculated during render:
- Sorting/filtering of leaderboard
- Philosophy highlighting logic
- Workflow progress calculation
- Ranking and top performer detection

This ensures data consistency and prevents synchronization bugs.

### Error Handling Strategy

The system gracefully handles all failure scenarios:

1. **Missing CSV**: Displays empty state with user notification
2. **Corrupted CSV**: Parses valid rows, ignores corrupted ones
3. **Empty dataset**: Shows placeholder message
4. **Corrupted localStorage**: Falls back to default state
5. **Rapid state updates**: Batched via atomic render model
6. **Network failures**: Graceful degradation with error notifications

**Never crashes UI** - all errors are caught and logged with user-friendly messages.

## Features

### Philosophy Explorer
- Multi-select philosophy statements
- Category filtering (Practical/Philosophical/Technical)
- Store-persisted selections
- Triggers leaderboard highlighting based on thresholds

### Interactive Giraffe Mascot
- State-machine driven behavior
- Responds to philosophy selections, model picks, theme changes
- Always visible with contextual messaging

### Workflow System
- 7-stage development pipeline with gates
- Progress based on model score:
  - ≥90: Full progression
  - 70-89: Stops at Implementation
  - <70: Stops at Architecture
- Click stages to view model context

### CSV-Driven Leaderboard
- Runtime data fetching
- Sortable by score/date/name
- Persistent row selection
- Top performer visual emphasis

### Accessibility
- WCAG AA compliant
- Full keyboard navigation
- Screen reader friendly
- Focus indicators

## Performance

- Supports 20+ models smoothly
- Instant sorting/filtering (client-side)
- No blocking operations
- Efficient re-renders via atomic updates

## Development

### No Build Tools Required
- Vanilla JavaScript, HTML, CSS
- No dependencies
- Works directly in browser

### Testing Locally
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Then open http://localhost:8000/docs/gironimo/
```

### Required CSV Location
Ensure `/results/leaderboard.csv` exists relative to root.

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
MIT

---

**🦒 Stand tall. See far. Move deliberately.**
