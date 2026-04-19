import {
  clearSession,
  fetchWithAuth,
  getMealPlanRequest,
  getTrainingPlanRequest,
  loginRequest,
} from "./api";
import * as storage from "./storage";

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

describe("api service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("incluye el bearer token en fetchWithAuth", async () => {
    jest.spyOn(storage, "getAuthToken").mockReturnValue("token-123");
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ ok: true }),
    });

    await fetchWithAuth("/api/days", { method: "GET" });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/days`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("guarda usuario y token al hacer login", async () => {
    jest.spyOn(storage, "setAuthToken").mockImplementation(() => {});
    jest.spyOn(storage, "setUser").mockImplementation(() => {});
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          user: { id: "1", email: "test@example.com" },
          token: "jwt-token",
        }),
    });

    const response = await loginRequest({
      email: "test@example.com",
      password: "Test1234!",
    });

    expect(response.user.email).toBe("test@example.com");
    expect(storage.setAuthToken).toHaveBeenCalledWith("jwt-token");
    expect(storage.setUser).toHaveBeenCalledWith({
      id: "1",
      email: "test@example.com",
    });
  });

  it("borra la sesion local en clearSession", () => {
    jest.spyOn(storage, "removeAuthToken").mockImplementation(() => {});
    jest.spyOn(storage, "removeUser").mockImplementation(() => {});

    clearSession();

    expect(storage.removeAuthToken).toHaveBeenCalled();
    expect(storage.removeUser).toHaveBeenCalled();
  });

  it("solicita el plan maestro autenticado", async () => {
    jest.spyOn(storage, "getAuthToken").mockReturnValue("token-123");
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ mealPlan: { estructuraDias: {}, bloques: {} } }),
    });

    await getMealPlanRequest();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/meal-plan`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      })
    );
  });

  it("solicita la rutina maestra autenticada", async () => {
    jest.spyOn(storage, "getAuthToken").mockReturnValue("token-123");
    global.fetch.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ trainingPlan: { routines: {} } }),
    });

    await getTrainingPlanRequest();

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/training-plan`,
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer token-123",
        }),
      })
    );
  });
});
