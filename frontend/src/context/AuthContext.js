import { createContext, useContext, useEffect, useState } from "react";
import {
  clearSession,
  getCurrentUser,
  loginRequest,
  registerRequest,
} from "../services/api";
import { scheduleSync, syncLocalFirstData } from "../services/sync";
import { getAuthToken, getUser } from "../services/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getAuthToken());
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(getAuthToken()));
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const runSync = async () => {
    setSyncStatus("syncing");
    setSyncError("");

    try {
      await syncLocalFirstData();
      setSyncStatus("success");
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error.message || "Error de sincronizacion");
      throw error;
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (!token) {
        setIsBootstrapping(false);
        setSyncStatus("idle");
        setSyncError("");
        return;
      }

      try {
        const data = await getCurrentUser(token);
        setUser(data.user);
        await runSync();
      } catch (error) {
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
  }, [token]);

  useEffect(() => {
    if (!token || typeof window === "undefined") {
      return undefined;
    }

    const handleStorageChanged = () => {
      scheduleSync(1200, runSync);
    };

    window.addEventListener("nutricion_web:storage-changed", handleStorageChanged);

    return () => {
      window.removeEventListener("nutricion_web:storage-changed", handleStorageChanged);
    };
  }, [token]);

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    setUser(data.user);
    setToken(data.token);
    await runSync();
    return data;
  };

  const register = async (credentials) => {
    const data = await registerRequest(credentials);
    setUser(data.user);
    setToken(data.token);
    await runSync();
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
