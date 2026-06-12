import { safeNumber } from "./persistence.js";

const REQUIRED = [
  "model",
  "date",
  "overall_score"
];

export async function loadLeaderboard() {

  try {

    const response =
      await fetch("/results/leaderboard.csv");

    if (!response.ok) {
      throw new Error("csv load failed");
    }

    const text = await response.text();

    return parseCSV(text);

  } catch {

    return [];
  }
}

function parseCSV(text) {

  const lines =
    text.trim().split("\n");

  if (lines.length < 2) {
    return [];
  }

  const headers =
    lines[0].split(",");

  return lines
    .slice(1)
    .map(line => {

      const cols = line.split(",");

      const row = {};

      headers.forEach((h, i) => {
        row[h.trim()] =
          cols[i]?.trim() ?? "";
      });

      return {
        ...row,
        overall_score:
          safeNumber(row.overall_score),
        architecture:
          safeNumber(row.architecture),
        code_quality:
          safeNumber(row.code_quality),
        feature_complete:
          safeNumber(row.feature_complete),
        best_practices:
          safeNumber(row.best_practices)
      };
    })
    .filter(row =>
      REQUIRED.every(
        key => key in row
      )
    );
}
