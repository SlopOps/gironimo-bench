export const Notification = (state) => {
  const { selectedModel } = state;

  if (!selectedModel) {
    return ``; // No notification if no model is selected
  }

  const modelName = selectedModel.model || "Selected Model";
  const score = selectedModel.overall_score || "N/A";

  return `
    <div class="notification open">
      <p><strong>${modelName}</strong> selected (Score: ${score})</p>
    </div>
  `;
};
