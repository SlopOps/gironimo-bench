import { createStore } from '../store/store.js';
import { renderApp } from '../app.js';
import { fetchLeaderboard } from '../features/Leaderboard.js';

// Initialize store
const store = createStore();

// Fetch leaderboard data
fetchLeaderboard(store);

// Render app
renderApp(store);

// Subscribe to store updates
store.subscribe(() => renderApp(store));
