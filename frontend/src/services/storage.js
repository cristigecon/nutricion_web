// storage.js
// Capa de abstracción sobre localStorage para el plan de nutrición/entrenamiento.
// Esto permitirá cambiar a API remota más tarde con el mismo contrato.

const safeParse = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.warn("storage.safeParse: JSON parse failed", e);
    return fallback;
  }
};

const notifyStorageChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("nutricion_web:storage-changed"));
};

const storage = {
  setItem(key, value) {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChange();
  },

  getItem(key, fallback = null) {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    return safeParse(localStorage.getItem(key), fallback);
  },

  removeItem(key) {
    if (typeof window === "undefined" || !window.localStorage) return;
    localStorage.removeItem(key);
    notifyStorageChange();
  },
};

// Modelo de datos / nombres de keys
const keys = {
  user: "nutricion_web_user",
  authToken: "nutricion_web_auth_token",
  day: (date) => `nutricion_web_day_${date}`,
  dayMeta: (date) => `nutricion_web_daymeta_${date}`,
  mealChecks: (date) => `nutricion_web_mealchecks_${date}`,
  workout: (date) => `nutricion_web_workout_${date}`,
  agenda: "nutricion_web_agenda",
  agendaMeta: "nutricion_web_agenda_meta",
  weeklyPlan: "nutricion_web_weekly_plan",
};

const reservedDynamicPrefixes = [
  "nutricion_web_day_",
  "nutricion_web_daymeta_",
  "nutricion_web_mealchecks_",
  "nutricion_web_workout_",
  "nutricion_web_entreno_check_",
  "nutricion_web_cardio_",
];

const getIsoNow = () => new Date().toISOString();

const touchDayMeta = (date, updatedAt = getIsoNow()) => {
  storage.setItem(keys.dayMeta(date), { updatedAt });
};

const touchAgendaMeta = (updatedAt = getIsoNow()) => {
  storage.setItem(keys.agendaMeta, { updatedAt });
};

export const getUser = () => storage.getItem(keys.user, null);
export const setUser = (user) => storage.setItem(keys.user, user);
export const removeUser = () => storage.removeItem(keys.user);
export const getAuthToken = () => storage.getItem(keys.authToken, null);
export const setAuthToken = (token) => storage.setItem(keys.authToken, token);
export const removeAuthToken = () => storage.removeItem(keys.authToken);

export const getDay = (date) => storage.getItem(keys.day(date), null);
export const saveDay = (date, payload, options = {}) => {
  storage.setItem(keys.day(date), payload);
  touchDayMeta(date, options.updatedAt);
};

export const getMealChecks = (date) => storage.getItem(keys.mealChecks(date), []);
export const saveMealChecks = (date, checks, options = {}) => {
  storage.setItem(keys.mealChecks(date), checks);
  touchDayMeta(date, options.updatedAt);
};

export const getWorkoutByDate = (date) => storage.getItem(keys.workout(date), null);
export const saveWorkoutByDate = (date, workout, options = {}) => {
  storage.setItem(keys.workout(date), workout);
  touchDayMeta(date, options.updatedAt);
};

export const getEntrenoCheck = (date) => storage.getItem(`nutricion_web_entreno_check_${date}`, false);
export const setEntrenoCheck = (date, value, options = {}) => {
  storage.setItem(`nutricion_web_entreno_check_${date}`, value);
  touchDayMeta(date, options.updatedAt);
};

export const getCardio = (date) => storage.getItem(`nutricion_web_cardio_${date}`, false);
export const setCardio = (date, value, options = {}) => {
  storage.setItem(`nutricion_web_cardio_${date}`, value);
  touchDayMeta(date, options.updatedAt);
};

export const getAgenda = () => storage.getItem(keys.agenda, {});
export const saveAgenda = (agenda, options = {}) => {
  storage.setItem(keys.agenda, agenda);
  touchAgendaMeta(options.updatedAt);
};

export const getWeeklyPlan = () => storage.getItem(keys.weeklyPlan, {});
export const saveWeeklyPlan = (plan) => storage.setItem(keys.weeklyPlan, plan);

export const getMealByName = (date, mealName) =>
  storage.getItem(`nutricion_web_${mealName}_${date}`, {});
export const saveMealByName = (date, mealName, payload, options = {}) => {
  storage.setItem(`nutricion_web_${mealName}_${date}`, payload);
  touchDayMeta(date, options.updatedAt);
};

export const getMealEntriesByDate = (date) => {
  if (typeof window === "undefined" || !window.localStorage) return {};

  const meals = {};

  Object.keys(localStorage).forEach((key) => {
    const isReserved = reservedDynamicPrefixes.some((prefix) => key.startsWith(prefix));
    if (isReserved || !key.startsWith("nutricion_web_") || !key.endsWith(`_${date}`)) {
      return;
    }

    const mealName = key
      .replace("nutricion_web_", "")
      .replace(`_${date}`, "");

    meals[mealName] = storage.getItem(key, {});
  });

  return meals;
};

export const buildLocalDayPayload = (date) => {
  const baseDay = getDay(date) || {};

  return {
    date,
    tipo: baseDay.tipo || "entrenamiento",
    selecciones: baseDay.selecciones || {},
    mealChecks: getMealChecks(date) || {},
    workout: getWorkoutByDate(date) || [],
    cardio: getCardio(date),
    entrenoCheck: getEntrenoCheck(date),
    meals: getMealEntriesByDate(date),
    localUpdatedAt: getLocalDayUpdatedAt(date),
  };
};

export const hydrateLocalDay = (day) => {
  if (!day?.date) return;

  saveDay(day.date, {
    tipo: day.tipo || "entrenamiento",
    selecciones: day.selecciones || {},
  }, { updatedAt: day.updatedAt });

  saveMealChecks(day.date, day.mealChecks || {}, { updatedAt: day.updatedAt });
  saveWorkoutByDate(day.date, day.workout || [], { updatedAt: day.updatedAt });
  setCardio(day.date, Boolean(day.cardio), { updatedAt: day.updatedAt });
  setEntrenoCheck(day.date, Boolean(day.entrenoCheck), { updatedAt: day.updatedAt });

  Object.entries(day.meals || {}).forEach(([mealName, payload]) => {
    saveMealByName(day.date, mealName, payload || {}, { updatedAt: day.updatedAt });
  });
};

export const getLocalDayUpdatedAt = (date) => {
  return storage.getItem(keys.dayMeta(date), null)?.updatedAt || null;
};

export const getLocalAgendaUpdatedAt = () => {
  return storage.getItem(keys.agendaMeta, null)?.updatedAt || null;
};

export const clearAll = () => {
  if (typeof window === "undefined" || !window.localStorage) return;
  // Opcional: filtrar solo las keys propias
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("nutricion_web_")) {
      localStorage.removeItem(key);
    }
  });
  notifyStorageChange();
};

export const getAllDayDates = () => {
  if (typeof window === "undefined" || !window.localStorage) return [];
  const dates = [];
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("nutricion_web_day_")) {
      dates.push(key.replace("nutricion_web_day_", ""));
    }
  });
  return dates;
};

// API placeholders para futura sincronización remota
export const fetchRemoteData = async () => {
  throw new Error("fetchRemoteData: implementar con backend");
};

export const pushRemoteData = async (data) => {
  throw new Error("pushRemoteData: implementar con backend");
};
