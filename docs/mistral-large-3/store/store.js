export const createStore = (initialState = {}) => {
  let state = {
    theme: 'light',
    selectedPhilosophyStatements: [],
    selectedModel: null,
    workflowState: 'Spec',
    leaderboardData: [],
    ...initialState,
  };
  const listeners = [];

  const persistState = () => {
    localStorage.setItem('gironimoState', JSON.stringify(state));
  };

  const loadState = () => {
    const savedState = localStorage.getItem('gironimoState');
    return savedState ? JSON.parse(savedState) : {};
  };

  state = { ...state, ...loadState() };

  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      persistState();
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    },
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SELECT_PHILOSOPHY':
      return { ...state, selectedPhilosophyStatements: action.payload };
    case 'SELECT_MODEL':
      return { ...state, selectedModel: action.payload };
    case 'SET_WORKFLOW_STATE':
      return { ...state, workflowState: action.payload };
    case 'SET_LEADERBOARD_DATA':
      return { ...state, leaderboardData: action.payload };
    default:
      return state;
  }
};
