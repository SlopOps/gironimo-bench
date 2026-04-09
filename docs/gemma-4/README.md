# 🦒 Gironimo Website

A highly architectural, store-driven exploration of AI model performance and philosophy-driven workflows.

## 🚀 Deployment
This is a **static-only** implementation.
1. Ensure your `leaderboard.csv` is located at `/results/leaderboard.csv` relative to the domain root.
2. Push to GitHub.
3. Enable **GitHub Pages** in repository settings.

## Architecture

### 🧠 The Store (Centralized State)
The application follows a strict **Single Source of Truth** pattern. All state changes must be dispatched via the `store.dispatch(action)` method. 

- **Reducer Strategy**: A pure `rootReducer` function processes actions to return the next immutable state object.
- **Atomic Update Rule**: The store uses a subscription model. When state changes, exactly one notification is sent to all subscribers. This ensures that the UI is updated in a single render pass, preventing intermediate or inconsistent UI states.
- **Derived State**: To maintain performance and integrity, the store does *not* hold sorted, filtered, or calculated data. All such values (e.g., the filtered leaderboard, workflow progression, and philosophy matching) are computed in real-time during the render cycle based on the raw state.

### 🧩 Component System
Components are implemented as pure, functional UI generators. They:
1. Accept a `props` object.
2. Return a DOM element.
3. Contain zero feature-specific business logic.
4. Rely entirely on the store-driven `render()` cycle to update.

### 🤖 Mascot (Giraffe) Behavior
The mascot is not driven by DOM events or manual manipulation. It operates on a **Behavior Machine** that observes the store's state. Its visual transformations (scale, rotation, position) are mathematical functions of the current `theme`, `selectedModel`, and `selectedPhilosophyStatements`.

### 🛡 Error Handling
- **CSV Loading**: Uses a graceful `try/catch` wrapper. If the CSV is missing or corrupted, the system notifies the user via the store-driven notification system and continues to function with an empty dataset.
- **Persistence**: `localStorage` is used for theme and philosophy selection. The system validates the integrity of the JSON before applying it to prevent crashes from corrupted local data.
- **Missing Data**: The CSV parser defaults all numerical fields to `0` and ignores malformed rows to ensure the application never encounters `NaN` in mathematical computations.

## 📂 File Structure
- `index.html`: App shell and mounting points.
- `css/style.css`: Design system (Variables, Layout, Animations).
- `js/store.js`: The core Reducer and Subscription engine.
- `js/components.js`: Reusable, props-driven UI components.
- `js/mascot.js`: The behavior machine for the giraffe.
- `js/leaderboard.js`: CSV parsing and derived data computation.
- `js/workflow.js`: Progression rules and stage management.
- `js/app.js`: The orchestrator that connects features to the store.
