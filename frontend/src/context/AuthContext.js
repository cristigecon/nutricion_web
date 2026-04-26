import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  clearSession,
  getCurrentUser,
  getMealPlanRequest,
  getTrainingPlanRequest,
  loginRequest,
  registerRequest,
} from "../services/api";
import { hydrateMealPlan } from "../services/mealPlan";
import { hydrateTrainingPlan } from "../services/trainingPlan";
import { scheduleSync, syncLocalFirstData } from "../services/sync";
import { getAuthToken, getUser } from "../services/storage";

const AuthContext = createContext(null);

const isBrowserOnline = () => {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine !== false;
};

const isConnectivityError = (error) => {
  if (!isBrowserOnline()) {
    return true;
  }

  const message = String(error?.message || "");

  return (
    error?.name === "TypeError" ||
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("Load failed")
  );
};

const isAuthError = (error) => {
  const message = String(error?.message || "");

  return (
    message.includes("Token not valid") ||
    message.includes("No token provided") ||
    message.includes("No user found for token")
  );
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(getAuthToken()));
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [isOnline, setIsOnline] = useState(() => isBrowserOnline());
  const skipNextBootstrapRef = useRef(false);

  const setOfflineState = useCallback(({
    pending = false,
    message = "Sin conexion. Puedes seguir usando los datos locales.",
  } = {}) => {
    setIsOnline(false);
    setSyncStatus(pending ? "pending" : "offline");
    setSyncError(message);

    if (pending) {
      setHasPendingSync(true);
    }
  }, []);

  const refreshMealPlan = useCallback(async (tokenOverride) => {
    const sessionToken = tokenOverride || token || getAuthToken();

    if (!sessionToken) {
      return;
    }

    if (!isBrowserOnline()) {
      return;
    }

    const data = await getMealPlanRequest(sessionToken);
    hydrateMealPlan(data.mealPlan, {
      notify: false,
      updatedAt: data.mealPlan?.updatedAt,
    });
  }, [token]);

  const refreshTrainingPlan = useCallback(async (tokenOverride) => {
    const sessionToken = tokenOverride || token || getAuthToken();

    if (!sessionToken) {
      return;
    }

    if (!isBrowserOnline()) {
      return;
    }

    const data = await getTrainingPlanRequest(sessionToken);
    hydrateTrainingPlan(data.trainingPlan, {
      notify: false,
      updatedAt: data.trainingPlan?.updatedAt,
    });
  }, [token]);

  const runLocalDataSync = useCallback(async (tokenOverride) => {
    const sessionToken = tokenOverride || token || getAuthToken();

    if (!sessionToken) {
      return;
    }

    if (!isBrowserOnline()) {
      setOfflineState({
        pending: true,
        message: "Sin conexion. Los cambios se sincronizaran al reconectar.",
      });
      return;
    }

    setIsOnline(true);
    setSyncStatus("syncing");
    setSyncError("");

    try {
      await syncLocalFirstData();
      setHasPendingSync(false);
      setSyncStatus("success");
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      if (isConnectivityError(error)) {
        setOfflineState({
          pending: true,
          message: "No se pudo sincronizar. Reintentaremos al reconectar.",
        });
        return;
      }

      setSyncStatus("error");
      setSyncError(error.message || "Error de sincronizacion");
      throw error;
    }
  }, [setOfflineState, token]);

  const runSync = useCallback(async (tokenOverride) => {
    const sessionToken = tokenOverride || token || getAuthToken();

    if (!sessionToken) {
      return;
    }

    try {
      await Promise.all([
        refreshMealPlan(sessionToken),
        refreshTrainingPlan(sessionToken),
      ]);
      await runLocalDataSync(sessionToken);
    } catch (error) {
      if (isConnectivityError(error)) {
        setOfflineState({
          pending: true,
          message: "No se pudo sincronizar. Reintentaremos al reconectar.",
        });
        return;
      }

      throw error;
    }
  }, [refreshMealPlan, refreshTrainingPlan, runLocalDataSync, setOfflineState, token]);

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsBootstrapping(false);
        setSyncStatus("idle");
        setSyncError("");
        setHasPendingSync(false);
        setIsOnline(isBrowserOnline());
        return;
      }

      if (skipNextBootstrapRef.current) {
        skipNextBootstrapRef.current = false;
        setIsBootstrapping(false);
        return;
      }

      if (!isBrowserOnline()) {
        setOfflineState();
        setIsBootstrapping(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
        await runSync(token);
      } catch (error) {
        if (isConnectivityError(error)) {
          setOfflineState();
          return;
        }

        if (!isAuthError(error)) {
          setSyncStatus("error");
          setSyncError(error.message || "No se pudo validar la sesion");
          return;
        }

        clearSession();
        setUser(null);
        setToken(null);
        setSyncStatus("error");
        setSyncError(error.message || "No se pudo validar la sesion");
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrapAuth();
  }, [runSync, setOfflineState, token]);

  useEffect(() => {
    if (!token || typeof window === "undefined") {
      return undefined;
    }

    const handleStorageChanged = () => {
      if (!getAuthToken()) {
        return;
      }

      if (!isBrowserOnline()) {
        setOfflineState({
          pending: true,
          message: "Sin conexion. Los cambios se sincronizaran al reconectar.",
        });
        return;
      }

      scheduleSync(1200, runLocalDataSync);
    };

    window.addEventListener("nutricion_web:storage-changed", handleStorageChanged);

    return () => {
      window.removeEventListener("nutricion_web:storage-changed", handleStorageChanged);
    };
  }, [runLocalDataSync, setOfflineState, token]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleOnline = () => {
      setIsOnline(true);

      if (!getAuthToken()) {
        return;
      }

      if (hasPendingSync || syncStatus === "offline") {
        Promise.resolve(runSync()).catch(() => {});
      }
    };

    const handleOffline = () => {
      if (!getAuthToken()) {
        setIsOnline(false);
        return;
      }

      setOfflineState({
        pending: hasPendingSync,
        message: hasPendingSync
          ? "Sin conexion. Los cambios se sincronizaran al reconectar."
          : "Sin conexion. Puedes seguir usando los datos locales.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [hasPendingSync, runSync, setOfflineState, syncStatus, token]);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    skipNextBootstrapRef.current = true;
    setUser(data.user);
    setToken(data.token);
    await runSync(data.token);
    return data;
  };

  const register = async (credentials) => {
    const data = await registerRequest(credentials);
    skipNextBootstrapRef.current = true;
    setUser(data.user);
    setToken(data.token);
    await runSync(data.token);
    return data;
  };

  const logout = () => {
    clearSession();
    skipNextBootstrapRef.current = false;
    setUser(null);
    setToken(null);
    setSyncStatus("idle");
    setSyncError("");
    setLastSyncedAt(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isBootstrapping,
        syncStatus,
        syncError,
        lastSyncedAt,
        hasPendingSync,
        isOnline,
        login,
        register,
        logout,
        runSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
