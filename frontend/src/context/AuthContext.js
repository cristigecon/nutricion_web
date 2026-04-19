import { createContext, useContext, useEffect, useEffectEvent, useState } from "react";
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

  const setOfflineState = ({
    pending = false,
    message = "Sin conexion. Puedes seguir usando los datos locales.",
  } = {}) => {
    setIsOnline(false);
    setSyncStatus(pending ? "pending" : "offline");
    setSyncError(message);

    if (pending) {
      setHasPendingSync(true);
    }
  };

  const refreshMealPlan = async (tokenOverride) => {
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
  };

  const refreshTrainingPlan = async (tokenOverride) => {
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
  };

  const runLocalDataSync = async (tokenOverride) => {
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
  };

  const runSync = async (tokenOverride) => {
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
  };

  const runSyncEffect = useEffectEvent((tokenOverride) => runSync(tokenOverride));
  const runLocalDataSyncEffect = useEffectEvent((tokenOverride) =>
    runLocalDataSync(tokenOverride)
  );

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

      if (!isBrowserOnline()) {
        setOfflineState();
        setIsBootstrapping(false);
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
        await runSyncEffect();
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
  }, [runSyncEffect, token]);

  useEffect(() => {
    if (!token || typeof window === "undefined") {
      return undefined;
    }

    const handleStorageChanged = () => {
      if (!isBrowserOnline()) {
        setOfflineState({
          pending: true,
          message: "Sin conexion. Los cambios se sincronizaran al reconectar.",
        });
        return;
        }

        scheduleSync(1200, runLocalDataSyncEffect);
      };

    window.addEventListener("nutricion_web:storage-changed", handleStorageChanged);

    return () => {
      window.removeEventListener("nutricion_web:storage-changed", handleStorageChanged);
    };
  }, [runLocalDataSyncEffect, token]);

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
        Promise.resolve(runSyncEffect()).catch(() => {});
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
  }, [hasPendingSync, runSyncEffect, syncStatus, token]);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    setUser(data.user);
    setToken(data.token);
    await runSync(data.token);
    return data;
  };

  const register = async (credentials) => {
    const data = await registerRequest(credentials);
    setUser(data.user);
    setToken(data.token);
    await runSync(data.token);
    return data;
  };

  const logout = () => {
    clearSession();
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
