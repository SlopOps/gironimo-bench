import { PhilosophyExplorer } from './features/PhilosophyExplorer.js';
import { Leaderboard } from './features/Leaderboard.js';
import { WorkflowSystem } from './features/WorkflowSystem.js';
import { Mascot } from './features/Mascot.js';
import { Notification } from './components/Notification.js';

export const renderApp = (store) => {
  const state = store.getState();
  const root = document.getElementById('root');

  const handleSelectPhilosophy = (statement) => {
    const newSelection = state.selectedPhilosophyStatements.includes(statement)
      ? state.selectedPhilosophyStatements.filter((s) => s !== statement)
      : [...state.selectedPhilosophyStatements, statement];
    store.dispatch({ type: 'SELECT_PHILOSOPHY', payload: newSelection });
  };

  const handleSelectModel = (model) => {
    store.dispatch({ type: 'SELECT_MODEL', payload: model });
  };

  const handleStageClick = (stage) => {
    // Open modal logic here
    console.log(`Stage clicked: ${stage}`);
  };

  const handleThemeChange = () => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    store.dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  root.innerHTML = `
    <div class="app" data-theme="${state.theme}">
      <button onclick="handleThemeChange()">Toggle Theme</button>
      ${Mascot(state)}
      ${PhilosophyExplorer(state, handleSelectPhilosophy)}
      ${Leaderboard(state, handleSelectModel)}
      ${WorkflowSystem(state, handleStageClick)}
      ${Notification(state)}
    </div>
  `;

  // Expose functions to global scope for event handling
  window.handleSelectPhilosophy = handleSelectPhilosophy;
  window.handleSelectModel = handleSelectModel;
  window.handleStageClick = handleStageClick;
  window.handleThemeChange = handleThemeChange;
};
