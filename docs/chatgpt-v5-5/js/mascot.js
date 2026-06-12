export function mascotState(state){

  if(state.selectedModel){
    return "model";
  }

  if(
    state.selectedPhilosophyStatements
      .length
  ){
    return "philosophy";
  }

  return "idle";
}

export function mascotTransform(state){

  const mode =
    mascotState(state);

  if(mode === "model"){
    return "rotate(12deg)";
  }

  if(mode === "philosophy"){
    return "rotate(-12deg)";
  }

  return "translateY(0)";
}

export function giraffeSVG(){

  return `
  <svg
  class="giraffe idle"
  viewBox="0 0 120 120"
  xmlns="http://www.w3.org/2000/svg">

    <circle cx="60" cy="60" r="35"
      fill="#d8a53c"/>

    <circle cx="50" cy="55" r="3"/>
    <circle cx="70" cy="55" r="3"/>

    <rect
      x="54"
      y="70"
      width="12"
      height="18"
      fill="#d8a53c"/>

  </svg>
  `;
}
