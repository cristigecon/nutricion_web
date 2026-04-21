import {
  getAuthToken,
  removeAuthToken,
  removeUser,
  setAuthToken,
  setUser,
} from "./storage";

const LOCAL_API_BASE_URL = "http://localhost:5000";

const trimTrailingSlash = (value = "") => value.replace(/\/$/, "");

export const resolveApiBaseUrl = ({
  envBaseUrl = process.env.REACT_APP_API_URL?.trim() || "",
  location = typeof window === "undefined" ? undefined : window.location,
  nodeEnv = process.env.NODE_ENV,
} = {}) => {
  const normalizedEnvBaseUrl = trimTrailingSlash(envBaseUrl);

  if (normalizedEnvBaseUrl) {
    return normalizedEnvBaseUrl;
  }

  if (!location) {
    return LOCAL_API_BASE_URL;
  }

  const { hostname, origin } = location;
  const isLocalEnvironment = hostname === "localhost" || hostname === "127.0.0.1";

  if (isLocalEnvironment) {
    return LOCAL_API_BASE_URL;
  }

  if (nodeEnv === "production") {
    console.warn(
      "REACT_APP_API_URL no esta definida. Se usara el mismo origen para las peticiones API."
    );
  }

  return trimTrailingSlash(origin);
};

const API_BASE_URL = resolveApiBaseUrl();

const parseResponse = async (response) => {
  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Error de servidor");
  }

  return data;
};

export const fetchWithAuth = async (path, options = {}, tokenOverride) => {
  const token = tokenOverride || getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
};

const saveSession = (payload) => {
  if (!payload?.token || !payload?.user) {
    throw new Error("Respuesta de autenticacion invalida");
  }

  setAuthToken(payload.token);
  setUser(payload.user);
  return payload;
};

export const registerRequest = async ({ email, password }) => {
  const data = await fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return saveSession(data);
};

export const loginRequest = async ({ email, password }) => {
  const data = await fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return saveSession(data);
};

export const getCurrentUser = async (tokenOverride) => {
  return fetchWithAuth("/api/auth/me", { method: "GET" }, tokenOverride);
};

export const clearSession = () => {
  removeAuthToken();
  removeUser();
};

export const getDaysRequest = async (date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return fetchWithAuth(`/api/days${query}`, { method: "GET" });
};

export const createDayRequest = async (payload) => {
  return fetchWithAuth("/api/days", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDayRequest = async (dayId, payload) => {
  return fetchWithAuth(`/api/days/${dayId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getWeeklyPlanRequest = async () => {
  return fetchWithAuth("/api/weekly-plan", { method: "GET" });
};

export const updateWeeklyPlanRequest = async (payload) => {
  return fetchWithAuth("/api/weekly-plan", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getMealPlanRequest = async (tokenOverride) => {
  return fetchWithAuth("/api/meal-plan", { method: "GET" }, tokenOverride);
};

export const updateMealPlanRequest = async (payload) => {
  return fetchWithAuth("/api/meal-plan", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const getTrainingPlanRequest = async (tokenOverride) => {
  return fetchWithAuth("/api/training-plan", { method: "GET" }, tokenOverride);
};

export const updateTrainingPlanRequest = async (payload) => {
  return fetchWithAuth("/api/training-plan", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};
