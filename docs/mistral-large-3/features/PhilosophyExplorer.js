export const PhilosophyExplorer = (state, dispatch) => {
  const { selectedPhilosophyStatements } = state;
  const statements = [
    { category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
  ];

  const handleSelect = (statement) => {
    const newSelection = selectedPhilosophyStatements.includes(statement)
      ? selectedPhilosophyStatements.filter((s) => s !== statement)
      : [...selectedPhilosophyStatements, statement];
    dispatch({ type: 'SELECT_PHILOSOPHY', payload: newSelection });
  };

  return `
    <div class="philosophy-explorer">
      ${statements
        .map(
          (s) => `
            <div class="statement ${selectedPhilosophyStatements.includes(s.text) ? 'selected' : ''}"
                 onclick="handleSelect('${s.text}')">
              ${s.text}
            </div>
          `
        )
        .join('')}
    </div>
  `;
};
