export const Mascot = (state) => {
  const { selectedPhilosophyStatements, selectedModel, theme } = state;
  const behavior = determineBehavior(selectedPhilosophyStatements, selectedModel, theme);
  return `<div class="mascot" data-behavior="${behavior}"></div>`;
};

const determineBehavior = (philosophies, model, theme) => {
  if (philosophies.length > 0) return 'philosophy-selected';
  if (model) return 'model-selected';
  if (theme === 'dark') return 'theme-transition';
  return 'idle';
};
