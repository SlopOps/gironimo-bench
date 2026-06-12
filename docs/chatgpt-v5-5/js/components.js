export function Button({
  label,
  onClick,
  className = ""
}) {
  const btn = document.createElement("button");
  btn.className = `btn ${className}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

export function Card(content) {
  const el = document.createElement("div");
  el.className = "card";
  el.append(content);
  return el;
}

export function Notification(message) {
  const el = document.createElement("div");
  el.className = "notification";
  el.textContent = message;
  return el;
}

export function Modal(content, onClose) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "modal";

  const close = document.createElement("button");
  close.className = "btn";
  close.textContent = "Close";

  close.addEventListener("click", onClose);

  modal.append(content, close);
  backdrop.append(modal);

  return backdrop;
}

export function Tooltip(text) {
  const el = document.createElement("div");
  el.className = "tooltip";
  el.textContent = text;
  return el;
}
