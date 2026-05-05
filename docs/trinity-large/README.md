# Gironimo - AI Quality Benchmark

A static, single-page application that displays AI model quality benchmarks from a CSV file. Features a centralized store, interactive mascot, philosophy explorer, and workflow system.

## 🚀 Deployment

### GitHub Pages Setup

1. Create a new repository on GitHub
2. Enable GitHub Pages in repository settings
3. Upload the `/docs/gironimo/` folder to your repository
4. Set `/docs/gironimo/` as the source for GitHub Pages

### File Structure

```
/docs/gironimo/
├── index.html        # Main entry point
├── style.css         # Comprehensive CSS with WCAG AA compliance
├── script.js         # Centralized store and all features
└── README.md         # This documentation
```

### CSV Runtime Loading

The leaderboard data is fetched at runtime from:

```
/results/leaderboard.csv
```

This file must be placed in the `/docs/` directory (same level as `/gironimo/`). The application will fetch it when loaded.

## 🏛️ Architecture

### Centralized Store

The application uses a single, centralized store for all state management:

```javascript
const store = new Store(reducer, initialState);
```

**Key Principles:**
- Single global state object
- Reducer-based updates (action → next state)
- Subscription-based UI updates
- No duplicated state outside store

### State Structure

```javascript
{
    theme: 'light' | 'dark',
    selectedPhilosophyStatements: [], // Array of statement IDs
    selectedModel: null | object,     // Currently selected model
    workflowState: 'spec' | 'gate1' | ... | 'adr',
    leaderboardData: [],              // Parsed CSV data
    loading: false,
    error: null
}
```

### Reducer Pattern

All state updates go through a pure reducer function:

```javascript
function reducer(state, action) {
    switch (action.type) {
        case actionTypes.SET_THEME:
            return { ...state, theme: action.payload };
        // ... other actions
        default:
            return state;
    }
}
```

### Atomic Updates

The store ensures atomic updates - all state changes within a tick resolve into a single render, with no intermediate render states.

### Derived State

All derived values (sorting, filtering, grouping, ranking, UI flags) are computed during render and NOT stored in the state.

## 🔧 Features

### 1. Component System

Reusable, props-driven components:
- **Button** - All states and variants
- **Card** - Container component
- **Modal** - Dialog with overlay
- **Tooltip** - Hover-based tooltips
- **Notification** - Toast-style alerts
- **ThemeProvider** - Theme context

### 2. Philosophy Explorer

- Multi-select philosophy statements
- Category filtering (Practical, Philosophical, Technical)
- Selection persists in store
- Selection affects system via derived state

### 3. Interactive Mascot (Giraffe)

- Always visible SVG mascot
- Behavior driven by store state
- State machine implementation
- No DOM-driven logic

**Behavior Mapping:**
- **Idle**: Subtle motion
- **Philosophy selected**: Orients toward selected statements
- **Theme change**: Visual transition reaction
- **Model selected**: Orients toward leaderboard position
- **Workflow hover**: Responds directionally

### 4. Workflow System

Stages: Spec → Gate → Architecture → Gate → Implementation → Review → ADR

**Progress Rules:**
- ≥ 90: Full progression
- 70-89: Stops at Implementation
- < 70: Stops at Architecture

**Interactions:**
- Clicking stage opens modal
- Modal shows selected model metadata
- Philosophy context shown if selected

### 5. Leaderboard (CSV-driven)

**Data Source:**
- Fetches `/results/leaderboard.csv` at runtime
- No hardcoded data
- Graceful error handling

**CSV Format:**
```
model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score
```

**UI Features:**
- Sortable by overall score / date / alphabetical
- Row selection persists
- Selected model highlighted
- Top performer visually emphasized

**System Effects:**
- Model selection affects workflow state
- Model selection affects mascot behavior
- Philosophy highlighting based on criteria

**Philosophy Highlighting:**
- Practical: code_quality ≥ 8 AND feature_complete ≥ 8
- Philosophical: architecture ≥ 8
- Technical: best_practices ≥ 8

## 🎨 Design System

### WCAG AA Compliance

- **Contrast Ratios**: All text meets WCAG AA minimum 4.5:1
- **Keyboard Accessible**: Full keyboard navigation support
- **Responsive**: Works on all screen sizes
- **ARIA Labels**: Proper accessibility attributes

### Theming

- Light/Dark theme toggle
- CSS variable-based theming
- Smooth transitions between themes

### Typography

- Primary: Inter (sans-serif)
- Display: Playfair Display (serif)
- Responsive font sizing

## ⚡ Performance

- **20+ models** supported smoothly
- Instant sorting/filtering
- No blocking UI operations
- Efficient state management

## 🛡️ Error Handling

Gracefully handles:
- Missing CSV file
- Corrupted CSV data
- Empty dataset
- Corrupted localStorage
- Rapid state updates

Never crashes the UI - always shows appropriate error states.

## 📦 Build Tooling

This is a zero-build static site. No build tooling required.

**If used:** Would be documented in README
**If not used:** Documented here (not used)

## 🔗 Dependencies

- **Fonts**: Google Fonts (Inter, Playfair Display)
- **No external APIs** or runtime dependencies
- **No backend** required

## 📝 License

MIT License - feel free to use and modify.

## 🐛 Issues

Report issues in the GitHub repository.
