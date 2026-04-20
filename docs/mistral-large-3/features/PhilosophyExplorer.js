export const PhilosophyExplorer = (state, onSelect) => {
  const { selectedPhilosophyStatements } = state;
  const statements = [
    { category: 'Practical', text: 'Five minutes of correct work beats thirty seconds of plausible garbage' },
    { category: 'Practical', text: 'Human gates at specification and architecture catch expensive mistakes early' },
    { category: 'Philosophical', text: 'AI amplifies human judgment; it doesn\'t replace it' },
    { category: 'Philosophical', text: 'Stand tall. See far. Move deliberately' },
    { category: 'Technical', text: 'Two-model critique catches what single-model confidence misses' },
    { category: 'Technical', text: 'Documentation is auto-drafted because it fails when it\'s optional' },
    { category: 'Technical', text: 'Own your infrastructure. Own your data' },
  ];

  return `
    <div class="philosophy-explorer">
      <h2>Philosophy Explorer</h2>
      <div class="categories">
        ${['Practical', 'Philosophical', 'Technical']
          .map(
            (category) => `
              <button onclick="filterByCategory('${category}')">${category}</button>
            `
          )
          .join('')}
      </div>
      <div class="statements">
        ${statements
          .map(
            (s) => `
              <div class="statement ${selectedPhilosophyStatements.includes(s.text) ? 'selected' : ''}"
                   onclick="handleSelectPhilosophy('${s.text.replace(/'/g, "\\'")}')">
                <strong>${s.category}:</strong> ${s.text}
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  `;
};
