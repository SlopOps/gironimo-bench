const STORAGE_KEY = "gironimo-state";

export const initialState = {
  theme: "light",

  selectedPhilosophyStatements: [],

  selectedModel: null,

  workflowState: {
    hoveredStage: null,
    openStage: null
  },

  leaderboardData: [],

  notifications: [],

  modal: null
};

function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return initialState;

    const parsed = JSON.parse(raw);

    return {
      ...initialState,
      ...parsed
    };

  } catch {
    return initialState;
  }
}

function reducer(state, action) {

  switch(action.type){

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload
      };

    case "SET_LEADERBOARD":
      return {
        ...state,
        leaderboardData: action.payload
      };

    case "SELECT_MODEL":
      return {
        ...state,
        selectedModel: action.payload,
        notifications: [
          {
            id: Date.now(),
            message: `Selected ${action.payload.model}`
          }
        ]
      };

    case "TOGGLE_PHILOSOPHY":
      {
        const exists =
          state.selectedPhilosophyStatements.includes(
            action.payload
          );

        const next =
          exists
            ? state.selectedPhilosophyStatements.filter(
                x => x !== action.payload
              )
            : [
                ...state.selectedPhilosophyStatements,
                action.payload
              ];

        return {
          ...state,
          selectedPhilosophyStatements: next
        };
      }

    case "OPEN_MODAL":
      return {
        ...state,
        modal: action.payload
      };

    case "CLOSE_MODAL":
      return {
        ...state,
        modal: null
      };

    case "SET_WORKFLOW_HOVER":
      return {
        ...state,
        workflowState:{
          ...state.workflowState,
          hoveredStage: action.payload
        }
      };

    default:
      return state;
  }
}

export function createStore() {

  let state = safeLoad();

  const listeners = new Set();

  let queued = false;

  function persist(nextState){
    try{
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextState)
      );
    }catch{
      /* ignore */
    }
  }

  function flush(){
    queued = false;

    listeners.forEach(fn => fn(state));
  }

  return {

    getState(){
      return state;
    },

    dispatch(action){

      state = reducer(state, action);

      persist(state);

      if(!queued){

        queued = true;

        queueMicrotask(flush);
      }
    },

    subscribe(listener){

      listeners.add(listener);

      return () => listeners.delete(listener);
    }
  };
}
