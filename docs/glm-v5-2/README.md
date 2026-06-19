# Gironimo - AI Evaluation Platform

## Deployment

### GitHub Pages Setup
1. Ensure all files are located in `/docs/gironimo-app/` within your repository.
2. In your GitHub repository settings, navigate to Settings > Pages.
3. Under "Build and deployment", select "Deploy from a branch".
4. Select the `main` (or `master`) branch and the `/docs` folder as the source.
5. Save the settings. Your site will be available at `https://<username>.github.io/<repo-name>/gironimo-app/`.

### File Structure
```
/docs/gironimo-app/
  ├── index.html       # Main HTML structure
  ├── styles.css       # Styling and responsive design
  ├── store.js         # Single centralized state management
  ├── components.js    # Reusable UI components
  ├── mascot.js        # Giraffe mascot logic
  ├── app.js           # Application logic and rendering
  └── README.md        # This file
```

### CSV Runtime Loading
The leaderboard data is fetched at runtime from `/results/leaderboard.csv`. 
- The application expects this file to be served at the root path `/results/leaderboard.csv`.
- If deployed to a sub-path (e.g., `/repo-name/`), the fetch will resolve to `https://domain.com/results/leaderboard.csv`.
- The CSV must have headers: `model,date,video_url,result_url,speed,one_shot_attempts,design,architecture,code_quality,feature_complete,performance,accessibility,best_practices,value,overall_score`
- Invalid rows are ignored, and missing numeric values default to 0.
- If the file is missing or corrupted, the UI degrades gracefully and displays an error message without crashing.

## Architecture

### Store Design
The application uses a single, centralized store (`GironimoStore` in `store.js`) implemented using a Redux-like pattern in vanilla JavaScript:
- **Single Source of Truth:** All application state is held in one object.
- **Reducer-based Updates:** State changes are handled by a pure reducer function based on dispatched actions.
- **Subscription-based UI:** The UI subscribes to the store and re-renders on every dispatch.

### Atomic Update Model
- All state updates resolve into a single render cycle.
- When an action is dispatched, the reducer calculates the new state, saves it to `localStorage`, and then triggers all subscribed listeners.
- There are no intermediate render states; exactly one UI commit occurs per state transition.

### Derived State Handling
- Derived data (sorting, filtering, highlighting) is **never** stored in the state.
- These computations happen exclusively during the `render()` phase in `app.js`.
- Example: Leaderboard sorting configuration is stored, but the actual sorted array is calculated on every render.

### Error Handling Approach
- **Missing/Corrupted CSV:** `fetch` errors or parsing failures result in a `LOAD_CSV_FAIL` action, which gracefully displays an error message in the UI.
- **Corrupted localStorage:** The `loadState` function in `store.js` is wrapped in a try-catch block. If parsing fails, it falls back to the initial state.
- **Rapid State Updates:** The subscription model ensures rapid updates are handled sequentially without race conditions.

## Features
- **Interactive Mascot:** A state-machine-driven SVG giraffe that reacts to theme changes, model selection, and philosophy choices.
- **Workflow System:** Visual progression based on model score with modal details.
- **Philosophy Explorer:** Multi-select statements with category filtering that affect leaderboard highlighting.
- **Leaderboard:** CSV-driven, sortable, and interactive table with top-performer emphasis.

## Accessibility
- WCAG AA compliant color contrast.
- Full keyboard navigation (modals close on Escape, focus states visible).
- ARIA labels for interactive elements and alerts for notifications.
- Responsive design adapts to mobile and desktop screens.
