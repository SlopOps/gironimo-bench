export function Button(label, onClick, active=false) {
  const btn = document.createElement("button");
  btn.textContent = label;
  if (active) btn.classList.add("active");
  btn.onclick = onClick;
  return btn;
}

export function Card(content) {
  const div = document.createElement("div");
  div.className = "card";
  div.appendChild(content);
  return div;
}

export function Modal(content, onClose) {
  const overlay = document.createElement("div");
  overlay.className = "modal";
  overlay.onclick = onClose;

  const inner = document.createElement("div");
  inner.className = "card";
  inner.onclick = e => e.stopPropagation();

  inner.appendChild(content);
  overlay.appendChild(inner);
  return overlay;
}
