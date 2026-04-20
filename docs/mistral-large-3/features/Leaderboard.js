export const fetchLeaderboard = async (store) => {
  try {
    const response = await fetch('/results/leaderboard.csv');
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
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i] || 0;
      return obj;
    }, {});
  });
};
