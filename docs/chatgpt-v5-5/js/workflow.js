export const STAGES = [
  "Spec",
  "Gate",
  "Architecture",
  "Gate",
  "Implementation",
  "Review",
  "ADR"
];

export function workflowLimit(model) {

  if (!model) return 0;

  const score =
    Number(model.overall_score || 0);

  if (score >= 90) {
    return STAGES.length;
  }

  if (score >= 70) {
    return 5;
  }

  return 3;
}
