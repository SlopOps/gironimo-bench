export const WorkflowSystem = (state, onStageClick) => {
  const { workflowState, selectedModel } = state;
  const stages = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

  const getProgress = () => {
    if (!selectedModel) return 0;
    const score = parseInt(selectedModel.overall_score);
    if (score >= 90) return stages.length;
    if (score >= 70) return stages.indexOf('Implementation') + 1;
    return stages.indexOf('Architecture') + 1;
  };

  const progress = getProgress();

  return `
    <div class="workflow">
      <h2>Workflow</h2>
      ${stages
        .map(
          (stage, i) => `
            <div class="stage ${i < progress ? 'active' : 'inactive'}"
                 onclick="handleStageClick('${stage}')">
              ${stage}
            </div>
          `
        )
        .join('')}
    </div>
  `;
};
