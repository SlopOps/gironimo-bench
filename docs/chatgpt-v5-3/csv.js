export async function loadCSV() {
  try {
    const res = await fetch("/results/leaderboard.csv");
    const text = await res.text();

    return text
      .split("\n")
      .slice(1)
      .map(row => {
        const cols = row.split(",");
        if (cols.length < 15) return null;

        return {
          model: cols[0],
          date: cols[1],
          overall_score: Number(cols[14]) || 0,
          architecture: Number(cols[7]) || 0,
          code_quality: Number(cols[8]) || 0,
          feature_complete: Number(cols[9]) || 0,
          best_practices: Number(cols[12]) || 0
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
