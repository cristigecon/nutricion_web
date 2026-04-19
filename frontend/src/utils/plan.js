const createLocalDate = (dateString) => {
  const [year, month, day] = String(dateString || "")
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
};

export const getPlanTypeForDate = (dateString) => {
  const localDate = createLocalDate(dateString);

  if (!localDate) {
    return "semana";
  }

  const weekday = localDate.getDay();
  return weekday === 0 || weekday === 6 ? "finde" : "semana";
};

export const getBloqueLabel = (bloque) => {
  const suffix = String(bloque).replace("bloque", "");
  return `Bloque ${suffix}`;
};
