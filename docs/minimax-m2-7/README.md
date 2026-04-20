# Gironimo - AI Model Evaluation Dashboard

A static website for visualizing AI model evaluation results with an interactive philosophy explorer, workflow system, and animated mascot.

## Deployment

### GitHub Pages Setup

1. **Create a new repository** on GitHub (e.g., `gironimo`)

2. **Clone the repository locally:**
   ```bash
   git clone https://github.com/yourusername/gironimo.git
   cd gironimo
   ```

3. **Copy project files:**
   - Copy `index.html` to the repository root
   - Copy `results/` folder containing `leaderboard.csv`

4. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Gironimo setup"
   git push origin main
   ```

5. **Enable GitHub Pages:**
   - Go to repository **Settings**
   - Navigate to **Pages** (under "Code and automation")
   - Select **Source**: Deploy from a branch
   - Select **Branch**: `main` / `/(root)`
   - Click **Save**

6. **Access your site:**
   Your site will be available at `https://yourusername.github.io/gironimo/`

### File Structure

```
gironimo/
├── index.html          # Complete single-file application
├── results/
│   └── leaderboard.csv # Evaluation data (provided by evaluator)
└── README.md           # This file
```

### CSV Runtime Loading

The leaderboard fetches data at runtime from `/results/leaderboard.csv`. This path is relative to the deployment root, so ensure:

1. The `results/` folder is at the repository root (not inside `docs/`)
2. The CSV file is named exactly `leaderboard.csv`
3. For GitHub Pages, the file will be accessible at: `https://yourusername.github.io/gironimo/results/leaderboard.csv`

**Note:** If deploying to a subdirectory (e.g., `https://username.github.io/repo-name/`), update the fetch path in `index.html`:

```javascript
// Change this line:
const response = await fetch('/results/leaderboard.csv');

// To this (for subdirectory deployment):
const response = await fetch('/repo-name/results/leaderboard.csv');
```

---

## Architecture

### Store Design

The application uses a **single centralized store** with reducer-based state management:

```javascript
const store = createStore(reducer, initialState, 'gironimo-state');
```

**State Shape:**
```javascript
{
  theme: 'light' | 'dark',
  selectedPhilosophyStatements: string[],
  selectedModel: string | null,
  workflowState: {
    currentStage: number,
    isModalOpen: boolean,
    modalStageIndex: number | null
  },
  leaderboardData: {
    models: Model[],
    isLoading: boolean,
    error: string | null,
    sortBy: 'score' | 'date' | 'alpha',
    sortDirection: 'asc' | 'desc'
  },
  notifications: Notification[],
  mascotState: string
}
```

### Reducer Strategy

Pure functions map `(state, action) => newState`:

- `SET_THEME` - Toggle light/dark mode
- `TOGGLE_PHILOSOPHY` - Add/remove philosophy statement selection
- `SELECT_MODEL` - Set active model from leaderboard
- `SET_SORT` - Update sort configuration
- `SET_LEADERBOARD_DATA` - Populate models array
- `OPEN_MODAL` / `CLOSE_MODAL` - Workflow stage detail modal
- `ADD_NOTIFICATION` / `DISMISS_NOTIFICATION` - Notification management

### Atomic Update Model

All state updates follow the atomic update rule:

1. Dispatch triggers reducer
2. State changes are committed atomically
3. Subscribers are notified
4. Single `requestAnimationFrame` schedules UI update
5. UI re-renders exactly once per state change

```javascript
dispatch(action) {
  state = reducer(state, action);
  subscribers.forEach(fn => fn(state));
  requestAnimationFrame(() => renderApp(state));
}
```

### Derived State Handling

**Derived values are NEVER stored.** They are computed during render:

- **Sorting**: `getSortedModels()` computes sorted array from `models`
- **Filtering**: Category filters applied in render function
- **Philosophy Highlighting**: `getPhilosophyHighlight()` derives row highlighting
- **Workflow Progress**: `getWorkflowProgress()` calculates stage from model score
- **Mascot State**: `getMascotState()` determines mascot animation from store

### Error Handling Approach

| Error Type | Detection | Response |
|------------|-----------|----------|
| CSV fetch failure | `fetch().catch()` | Error state with retry button |
| Invalid CSV rows | Missing model name | Skip row silently |
| Empty dataset | `models.length === 0` | Empty state message |
| localStorage unavailable | `try/catch` on access | Fall back to memory-only |
| Corrupt persisted state | `JSON.parse` failure | Reset to initial state |
| Rapid state updates | Debounced via RAF | Single render per frame |

---

## Features

### 1. Component System

All components are reusable, generic, and configurable via props:

- **Button** - All states (default, hover, active, disabled, loading)
- **Card** - Variants (default, elevated, bordered) with optional header/body/footer
- **Modal** - Focus trap, Escape to close, backdrop blur
- **Tooltip** - Auto-reposition on viewport edge
- **Notification** - Types (info, success, warning, error) with auto-dismiss
- **ThemeProvider** - CSS custom properties, persists preference

### 2. Philosophy Explorer

- Multi-select statements from 7 predefined statements
- Category filtering (Practical, Philosophical, Technical)
- Selection persists to localStorage
- Selection triggers philosophy highlighting in leaderboard

### 3. Interactive Mascot (Giraffe)

State machine with behaviors driven entirely by store state:

| State | Trigger | Animation |
|-------|---------|-----------|
| idle | No triggers active | Breathing cycle, occasional blink |
| philosopher-focused | Philosophy statements selected | Left-oriented gaze |
| model-focused | Model selected in leaderboard | Right-oriented gaze |
| theme-transition | Theme toggle | Color pulse |

### 4. Workflow System

7-stage visualization with score-based progression:

- Score ≥ 90 → Full progression (all 7 stages)
- Score 70-89 → Stops at Implementation (stage 4)
- Score < 70 → Stops at Architecture (stage 2)

Click any stage to open modal with:
- Stage description
- Selected model metadata
- Philosophy context (if statements selected)

### 5. Leaderboard

- Runtime CSV fetching from `/results/leaderboard.csv`
- Sortable by score, date, or alphabetical
- Row selection updates workflow and mascot
- Philosophy highlighting (derived from selection)
- Top performer badge

---

## No Build Tools Required

This project uses **pure HTML, CSS, and JavaScript** with no build tools:

- No bundlers (Webpack, Vite, etc.)
- No frameworks (React, Vue, etc.)
- No preprocessors (Sass, TypeScript, etc.)

Simply deploy the `index.html` file and `results/` folder to any static hosting.

---

## Accessibility

- **WCAG AA compliant** color contrast ratios
- **Keyboard accessible** all interactive elements
- **Focus indicators** visible on all focusable elements
- **ARIA attributes** properly set on components
- **Reduced motion** support via `prefers-reduced-motion`

---

## Browser Support

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- ES6+ JavaScript features
- CSS custom properties (variables)
- `localStorage` API

---

## Development

To test locally:

1. Clone the repository
2. Serve the files with any local server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

**Note:** The CSV fetch requires serving via HTTP (not `file://`) due to CORS restrictions.

---

## License

MIT License
