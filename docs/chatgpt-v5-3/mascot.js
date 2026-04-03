export function Mascot(state) {
  const div = document.createElement("div");
  div.className = "mascot";

  let rotation = 0;

  if (state.selectedModel) rotation = 20;
  if (state.selectedPhilosophyStatements.length) rotation = -20;

  div.style.transform = `rotate(${rotation}deg)`;
  div.textContent = "🦒";

  return div;
}
