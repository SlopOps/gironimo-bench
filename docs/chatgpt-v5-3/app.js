import { getState, dispatch, subscribe } from "./store.js";
import { Button, Card, Modal } from "./components.js";
import { Mascot } from "./mascot.js";
import { loadCSV } from "./csv.js";

const PHILOSOPHY = [
  "Five minutes of correct work beats thirty seconds of plausible garbage",
  "Human gates at specification and architecture catch expensive mistakes early",
  "AI amplifies human judgment; it doesn't replace it"
];

async function init() {
  const data = await loadCSV();
  dispatch({ type: "SET_DATA", payload: data });
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const state = getState();

  const container = document.createElement("div");
  container.className = "container";

  // Philosophy
  const philDiv = document.createElement("div");
  PHILOSOPHY.forEach(p => {
    philDiv.appendChild(
      Button(p, () => dispatch({ type: "TOGGLE_PHILOSOPHY", payload: p }),
        state.selectedPhilosophyStatements.includes(p)
      )
    );
  });

  container.appendChild(Card(philDiv));

  // Leaderboard (sorted derived)
  const sorted = [...state.leaderboardData].sort(
    (a,b)=>b.overall_score - a.overall_score
  );

  const lb = document.createElement("div");

  sorted.forEach(row => {
    const btn = Button(
      `${row.model} (${row.overall_score})`,
      () => dispatch({ type: "SET_MODEL", payload: row }),
      state.selectedModel?.model === row.model
    );
    lb.appendChild(btn);
  });

  container.appendChild(Card(lb));

  // Workflow (derived)
  if (state.selectedModel) {
    const wf = document.createElement("div");
    const score = state.selectedModel.overall_score;

    let stage = "ADR";
    if (score < 90 && score >= 70) stage = "Implementation";
    if (score < 70) stage = "Architecture";

    wf.textContent = "Workflow Stage: " + stage;
    wf.onclick = () =>
      dispatch({ type: "OPEN_MODAL", payload: stage });

    container.appendChild(Card(wf));
  }

  // Modal
  if (state.modal) {
    app.appendChild(
      Modal(
        document.createTextNode("Stage: " + state.modal),
        () => dispatch({ type: "CLOSE_MODAL" })
      )
    );
  }

  // Notification
  if (state.notification) {
    const note = document.createElement("div");
    note.textContent = state.notification;
    setTimeout(()=>dispatch({type:"CLEAR_NOTIFICATION"}),1000);
    container.appendChild(note);
  }

  app.appendChild(container);
  app.appendChild(Mascot(state));
}

subscribe(render);
init();
render();
