const DEFAULT_STATE = {
  theme: "dark",
  selectedPhilosophyStatements: [],
  selectedModel: null,
  workflowState: null,
  leaderboardData: [],
  modal: null,
  notification: null
};

let state = loadState();
let listeners = [];

function loadState() {
  try {
    const raw = localStorage.getItem("gironimo");
    return raw ? JSON.parse(raw) : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState() {
  localStorage.setItem("gironimo", JSON.stringify(state));
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.push(fn);
}

export function dispatch(action) {
  const next = reducer(state, action);
  state = next;
  saveState();
  listeners.forEach(l => l());
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_THEME":
      return { ...state, theme: action.payload };

    case "TOGGLE_PHILOSOPHY":
      const exists = state.selectedPhilosophyStatements.includes(action.payload);
      return {
        ...state,
        selectedPhilosophyStatements: exists
          ? state.selectedPhilosophyStatements.filter(s => s !== action.payload)
          : [...state.selectedPhilosophyStatements, action.payload]
      };

    case "SET_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
        notification: "Model selected"
      };

    case "SET_DATA":
      return { ...state, leaderboardData: action.payload };

    case "OPEN_MODAL":
      return { ...state, modal: action.payload };

    case "CLOSE_MODAL":
      return { ...state, modal: null };

    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };

    default:
      return state;
  }
}
