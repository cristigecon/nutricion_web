import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";

jest.mock("../services/api", () => ({
  clearSession: jest.fn(),
  getCurrentUser: jest.fn(),
  getMealPlanRequest: jest.fn(),
  getTrainingPlanRequest: jest.fn(),
  loginRequest: jest.fn(),
  registerRequest: jest.fn(),
}));

jest.mock("../services/mealPlan", () => ({
  hydrateMealPlan: jest.fn(),
}));

jest.mock("../services/trainingPlan", () => ({
  hydrateTrainingPlan: jest.fn(),
}));

jest.mock("../services/sync", () => ({
  scheduleSync: jest.fn(),
  syncLocalFirstData: jest.fn(),
}));

jest.mock("../services/storage", () => ({
  getAuthToken: jest.fn(),
  getUser: jest.fn(),
}));

const api = require("../services/api");
const mealPlan = require("../services/mealPlan");
const trainingPlan = require("../services/trainingPlan");
const sync = require("../services/sync");
const storage = require("../services/storage");

const setNavigatorOnline = (value) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
};

function Probe() {
  const auth = useAuth();

  return (
    <div>
      <div>status:{auth.syncStatus}</div>
      <div>pending:{String(auth.hasPendingSync)}</div>
      <div>auth:{String(auth.isAuthenticated)}</div>
      <button onClick={() => auth.login({ email: "test@example.com", password: "Test1234!" })}>
        login
      </button>
      <button onClick={auth.logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setNavigatorOnline(true);
    storage.getAuthToken.mockReturnValue(null);
    storage.getUser.mockReturnValue(null);
    api.getMealPlanRequest.mockResolvedValue({
      mealPlan: {
        estructuraDias: { semana: [], finde: [] },
        bloques: {},
      },
    });
    api.getTrainingPlanRequest.mockResolvedValue({
      trainingPlan: {
        routines: {
          inferior: [],
          superior: [],
        },
      },
    });
    mealPlan.hydrateMealPlan.mockImplementation(() => {});
    trainingPlan.hydrateTrainingPlan.mockImplementation(() => {});
    sync.syncLocalFirstData.mockResolvedValue(undefined);
  });

  it("deja la sesion inactiva cuando no hay token inicial", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByText("auth:false")).toBeInTheDocument();
    expect(screen.getByText("status:idle")).toBeInTheDocument();
  });

  it("hace login y deja la sync en success", async () => {
    api.loginRequest.mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
      token: "jwt-token",
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("login"));

    await waitFor(() => {
      expect(screen.getByText("auth:true")).toBeInTheDocument();
      expect(screen.getByText("status:success")).toBeInTheDocument();
    });

    expect(api.getCurrentUser).not.toHaveBeenCalled();
    expect(sync.syncLocalFirstData).toHaveBeenCalledTimes(1);
  });

  it("restaura una sesion existente y sincroniza al arrancar", async () => {
    storage.getAuthToken.mockReturnValue("jwt-token");
    storage.getUser.mockReturnValue({ id: "1", email: "cached@example.com" });
    api.getCurrentUser.mockResolvedValue({
      user: { id: "1", email: "server@example.com" },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.getCurrentUser).toHaveBeenCalledWith("jwt-token");
      expect(api.getMealPlanRequest).toHaveBeenCalledWith("jwt-token");
      expect(api.getTrainingPlanRequest).toHaveBeenCalledWith("jwt-token");
      expect(sync.syncLocalFirstData).toHaveBeenCalled();
      expect(screen.getByText("auth:true")).toBeInTheDocument();
      expect(screen.getByText("status:success")).toBeInTheDocument();
    });
  });

  it("hace logout y limpia el estado", async () => {
    api.loginRequest.mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
      token: "jwt-token",
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.click(screen.getByText("login"));
    await waitFor(() => expect(screen.getByText("auth:true")).toBeInTheDocument());

    await userEvent.click(screen.getByText("logout"));

    expect(api.clearSession).toHaveBeenCalled();
    expect(screen.getByText("auth:false")).toBeInTheDocument();
    expect(screen.getByText("status:idle")).toBeInTheDocument();
  });

  it("mantiene la sesion local si arranca offline", async () => {
    setNavigatorOnline(false);
    storage.getAuthToken.mockReturnValue("jwt-token");
    storage.getUser.mockReturnValue({ id: "1", email: "cached@example.com" });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.getCurrentUser).not.toHaveBeenCalled();
      expect(sync.syncLocalFirstData).not.toHaveBeenCalled();
      expect(screen.getByText("auth:true")).toBeInTheDocument();
      expect(screen.getByText("status:offline")).toBeInTheDocument();
    });
  });

  it("reintenta la sync al volver online cuando habia cambios pendientes", async () => {
    storage.getAuthToken.mockReturnValue("jwt-token");
    storage.getUser.mockReturnValue({ id: "1", email: "cached@example.com" });
    api.getCurrentUser.mockResolvedValue({
      user: { id: "1", email: "server@example.com" },
    });

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(sync.syncLocalFirstData).toHaveBeenCalledTimes(1);
      expect(screen.getByText("status:success")).toBeInTheDocument();
    });

    const initialSyncCalls = sync.syncLocalFirstData.mock.calls.length;

    setNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    await waitFor(() => {
      expect(screen.getByText("status:offline")).toBeInTheDocument();
    });

    await act(async () => {
      window.dispatchEvent(new CustomEvent("nutricion_web:storage-changed"));
    });

    await waitFor(() => {
      expect(sync.scheduleSync).not.toHaveBeenCalled();
      expect(screen.getByText("pending:true")).toBeInTheDocument();
    });

    setNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    await waitFor(() => {
      expect(sync.syncLocalFirstData.mock.calls.length).toBeGreaterThan(initialSyncCalls);
      expect(screen.getByText("status:success")).toBeInTheDocument();
    });
  });
});
