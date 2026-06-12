export function safeNumber(value){

  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : 0;
}

export function safeString(value){

  if(value === undefined) return "";

  if(value === null) return "";

  return String(value);
}

export function safeArray(value){

  return Array.isArray(value)
    ? value
    : [];
}
