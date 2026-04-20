export const Mascot = (state) => {
  const { selectedPhilosophyStatements, selectedModel, theme } = state;
  let behavior = 'idle';
  if (selectedPhilosophyStatements.length > 0) behavior = 'philosophy-selected';
  if (selectedModel) behavior = 'model-selected';
  if (theme === 'dark') behavior = 'theme-transition';

  return `
    <div class="mascot" data-behavior="${behavior}"></div>
  `;
};
