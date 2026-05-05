# 🦒 Gironimo - AI Model Leaderboard & Philosophy Explorer

A static, client-side web application that combines an AI model leaderboard with a philosophy explorer, interactive mascot, and workflow visualization. Built as a single-page application with a centralized state management system.

## Features

- **Centralized Store Architecture**: Single source of truth with reducer-based updates
- **Philosophy Explorer**: Multi-select philosophy statements with category filtering
- **Interactive Mascot**: Giraffe character that reacts to user selections and system state
- **CSV-Driven Leaderboard**: Dynamically loads and displays model performance data
- **Workflow System**: Visual development pipeline that adapts based on model scores
- **Theme Support**: Light/dark mode with localStorage persistence
- **Fully Responsive**: Works on all device sizes
- **Accessibility First**: WCAG AA compliant, keyboard navigable

## Deployment

### GitHub Pages Setup

1. **Repository Structure**:
   ```
   /docs/gironimo/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── README.md
   └── results/
       └── leaderboard.csv
   ```

2. **Enable GitHub Pages**:
   - Navigate to repository Settings → Pages
   - Set source to "Deploy from a branch"
   - Select branch containing `/docs` folder
   - Set folder to `/docs`

3. **CSV Runtime Loading**:
   The application fetches the leaderboard CSV at runtime from `/results/leaderboard.csv`. The file must:
   - Be placed in the `results` directory
   - Follow the required format (see CSV Format section)
   - Be accessible via HTTP GET

4. **Access the Site**:
   `https://[your-username].github.io/[repo-name]/docs/gironimo/`

## Architecture

### Store Design

The application uses a **single centralized store** following the Flux pattern:

```javascript
// Store structure
{
  theme: 'light' | 'dark',
  selectedPhilosophyStatements: Array,
  philosophyFilter: string,
  selectedModel: Object | null,
  leaderboardData: Array,
  sortBy: string,
  sortDirection: 'asc' | 'desc',
  workflowState: {
    completedStages: Array,
    currentStage: string,
    blockedStages: Array
  },
  mascotState: string,
  notifications: Array
}
```

### Reducer Strategy

All state mutations occur through pure reducer functions:

- **Action types**: Defined constants prevent typos
- **Immutability**: Each action returns a new state object
- **Single responsibility**: Each reducer handles specific action types

### Atomic Update Model

The system guarantees **one render per tick**:

1. Actions are dispatched to the store
2. Reducer computes new state synchronously
3. All subscribers receive exactly one update
4. Single `render()` call updates all UI components

No intermediate render states - the UI updates atomically.

### Derived State Handling

Derived values are never stored - computed during render:

- Sorting/filtering of leaderboard
- Philosophy highlights based on model scores
- Workflow progress based on score thresholds
- Mascot state based on system conditions

### Error Handling Approach

The system gracefully handles failures:

- **Missing CSV**: Shows error message, continues functioning
- **Corrupted data**: Invalid rows ignored, defaults to 0 for missing values
- **localStorage corruption**: Falls back to initial state
- **Network failures**: Non-blocking, degrades gracefully
- **Rapid updates**: Queues actions if needed, maintains stability

## CSV Format

The leaderboard CSV must follow this exact format:

```csv
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
GPT-4,2024-01-15,,,0.85,3,9.2,8.9,8.7,9.0,8.8,8.5,9.1,8.9,88.5
```

**Required numeric fields**: design, architecture, code_quality, feature_complete, performance, accessibility, best_practices, value, overall_score

Invalid rows are ignored. Missing numeric values default to 0.

## Performance

- Smooth handling of 20+ models
- Instant sorting/filtering (client-side)
- No blocking UI operations
- Optimized re-renders through atomic updates

## Accessibility Compliance

- WCAG AA Level compliance
- Full keyboard navigation
- ARIA labels and roles
- High contrast ratios
- Focus indicators visible
- Reduced motion support

## Development

### Build Tooling

No build tools required - pure HTML/CSS/JavaScript.

### Local Testing

1. Clone the repository
2. Place a valid `leaderboard.csv` in `/docs/results/`
3. Serve the `/docs` directory:
   ```bash
   # Python 3
   python -m http.server 8000 --directory docs
   
   # Or use VS Code Live Server
   ```
4. Navigate to `http://localhost:8000/gironimo/`

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## State Persistence

User preferences are saved to `localStorage`:
- Theme selection
- Selected philosophy statements
- Philosophy filter
- Selected model
- Sort preferences

Missing or corrupted data falls back to defaults gracefully.

## Cross-System Integration

All features communicate exclusively through the central store:
- Philosophy selections affect leaderboard highlighting
- Model selection controls workflow progression
- Theme changes trigger global UI updates
- All interactions go through store actions

No direct feature-to-feature communication.
