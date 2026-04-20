import { createStore } from './store/store.js';
import { renderApp } from './app.js';

// Initialize store
const store = createStore();

// Render app
renderApp(store);

// Subscribe to store updates
store.subscribe(() => renderApp(store));
