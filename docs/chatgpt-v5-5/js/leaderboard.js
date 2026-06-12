export function getSortedRows(
  data,
  sortMode
) {

  const rows = [...data];

  if (sortMode === "alpha") {
    rows.sort((a,b)=>
      a.model.localeCompare(b.model)
    );
  }

  if (sortMode === "date") {
    rows.sort((a,b)=>
      new Date(b.date) -
      new Date(a.date)
    );
  }

  if (sortMode === "score") {
    rows.sort((a,b)=>
      b.overall_score -
      a.overall_score
    );
  }

  return rows;
}

export function getTopModel(data){

  return [...data]
    .sort(
      (a,b)=>
      b.overall_score-a.overall_score
    )[0];
}
