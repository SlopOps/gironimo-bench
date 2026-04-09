/**
 * WORKFLOW SYSTEM
 * Manages progression logic based on model score.
 */
const STAGES = ['Spec', 'Gate', 'Architecture', 'Gate', 'Implementation', 'Review', 'ADR'];

function getAvailableStages(selectedModel) {
    if (!selectedModel) return [STAGES[0]];
    
    const score = selectedModel.overall_score;
    
    if (score >= 90) return STAGES;
    if (score >= 70) return STAGES.slice(0, 5); // Stops at Implementation
    return STAGES.slice(0, 3); // Stops at Architecture
}
