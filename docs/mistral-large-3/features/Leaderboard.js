export const fetchLeaderboard = async (store) => {
  try {
    const response = await fetch('/results/leaderboard.csv');
    if (!response.ok) throw new Error('Failed to fetch CSV');
    const csv = await response.text();
    const data = parseCSV(csv);
    store.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: data });
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    store.dispatch({ type: 'SET_LEADERBOARD_DATA', payload: [] });
  }
};

const parseCSV = (csv) => {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] ? values[i].trim() : '0';
      return obj;
    }, {});
  });
};

export const Leaderboard = (state, onSelectModel) => {
  const { leaderboardData, selectedModel } = state;

  const handleSort = (key) => {
    // Implement sorting logic
  };

  return `
    <div class="leaderboard">
      <h2>Leaderboard</h2>
      <button onclick="handleSort('overall_score')">Sort by Score</button>
      <button onclick="handleSort('date')">Sort by Date</button>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Date</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${leaderboardData
            .map(
              (model) => `
                <tr class="${selectedModel?.model === model.model ? 'selected' : ''}"
                    onclick="handleSelectModel(${JSON.stringify(model)})">
                  <td>${model.model}</td>
                  <td>${model.date}</td>
                  <td>${model.overall_score}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
};
