import { createStore } from "./store.js";
import { loadLeaderboard } from "./csv.js";
import { STATEMENTS } from "./philosophy.js";
import { workflowLimit, STAGES } from "./workflow.js";
import { getSortedRows, getTopModel } from "./leaderboard.js";
import { Modal, Notification } from "./components.js";
import { giraffeSVG, mascotTransform } from "./mascot.js";

const store = createStore();

let sortMode = "score";

document
  .getElementById("sortSelect")
  .addEventListener("change", e => {
    sortMode = e.target.value;
    render();
  });

document
  .getElementById("themeToggle")
  .addEventListener("click", () => {

    const next =
      store.getState().theme === "light"
      ? "dark"
      : "light";

    store.dispatch({
      type:"SET_THEME",
      payload:next
    });
  });

store.subscribe(render);

init();

async function init(){

  const data =
    await loadLeaderboard();

  store.dispatch({
    type:"SET_LEADERBOARD",
    payload:data
  });

  render();
}

function render(){

  const state =
    store.getState();

  document.body.className =
    state.theme === "dark"
      ? "dark"
      : "";

  renderPhilosophy(state);
  renderLeaderboard(state);
  renderWorkflow(state);
  renderMascot(state);
  renderModal(state);
  renderNotification(state);
}

function renderPhilosophy(state){

  const root =
    document.getElementById(
      "philosophyStatements"
    );

  root.innerHTML = "";

  STATEMENTS.forEach(item => {

    const wrap =
      document.createElement("div");

    wrap.className = "statement";

    const selected =
      state.selectedPhilosophyStatements
        .includes(item.statement);

    if(selected){
      wrap.classList.add("active");
    }

    const btn =
      document.createElement("button");

    btn.className = "btn";

    btn.textContent =
      `[${item.category}] ${item.statement}`;

    btn.addEventListener("click",()=>{

      store.dispatch({
        type:"TOGGLE_PHILOSOPHY",
        payload:item.statement
      });
    });

    wrap.append(btn);
    root.append(wrap);
  });
}

function renderLeaderboard(state){

  const root =
    document.getElementById(
      "leaderboardContainer"
    );

  root.innerHTML = "";

  const rows =
    getSortedRows(
      state.leaderboardData,
      sortMode
    );

  const top =
    getTopModel(
      state.leaderboardData
    );

  rows.forEach(row => {

    const card =
      document.createElement("div");

    card.className =
      "card row";

    if(
      top &&
      top.model === row.model
    ){
      card.classList.add("top");
    }

    if(
      state.selectedModel &&
      state.selectedModel.model ===
      row.model
    ){
      card.classList.add("selected");
    }

    card.innerHTML = `
      <strong>${row.model}</strong>
      <span>${row.date}</span>
      <span>${row.overall_score}</span>
    `;

    card.addEventListener(
      "click",
      ()=>{
        store.dispatch({
          type:"SELECT_MODEL",
          payload:row
        });
      }
    );

    root.append(card);
  });
}

function renderWorkflow(state){

  const root =
    document.getElementById(
      "workflowStages"
    );

  root.innerHTML = "";

  const workflow =
    document.createElement("div");

  workflow.className =
    "workflow";

  const limit =
    workflowLimit(
      state.selectedModel
    );

  STAGES.forEach(
    (stage,index)=>{

      const el =
        document.createElement("button");

      el.className =
        "card stage";

      if(index < limit){
        el.classList.add(
          "complete"
        );
      }else{
        el.classList.add(
          "locked"
        );
      }

      el.textContent = stage;

      el.addEventListener(
        "mouseenter",
        ()=>{
          store.dispatch({
            type:"SET_WORKFLOW_HOVER",
            payload:stage
          });
        }
      );

      el.addEventListener(
        "click",
        ()=>{
          store.dispatch({
            type:"OPEN_MODAL",
            payload:stage
          });
        }
      );

      workflow.append(el);
    }
  );

  root.append(workflow);
}

function renderMascot(state){

  const root =
    document.getElementById(
      "mascot"
    );

  root.innerHTML =
    giraffeSVG();

  root.firstElementChild.style.transform =
    mascotTransform(state);
}

function renderModal(state){

  const root =
    document.getElementById(
      "modalRoot"
    );

  root.innerHTML = "";

  if(!state.modal){
    return;
  }

  const content =
    document.createElement("div");

  content.innerHTML = `
    <h3>${state.modal}</h3>

    <p>
      Model:
      ${
        state.selectedModel?.model ??
        "None"
      }
    </p>

    <p>
      Philosophy:
      ${
        state.selectedPhilosophyStatements
          .join(", ")
      }
    </p>
  `;

  root.append(
    Modal(
      content,
      ()=>store.dispatch({
        type:"CLOSE_MODAL"
      })
    )
  );
}

function renderNotification(state){

  const root =
    document.getElementById(
      "notificationRoot"
    );

  root.innerHTML = "";

  const note =
    state.notifications?.[0];

  if(!note){
    return;
  }

  root.append(
    Notification(note.message)
  );
}
