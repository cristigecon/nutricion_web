jest.mock("./api", () => ({
  createDayRequest: jest.fn(),
  getDaysRequest: jest.fn(),
  getWeeklyPlanRequest: jest.fn(),
  updateDayRequest: jest.fn(),
  updateWeeklyPlanRequest: jest.fn(),
}));

jest.mock("./storage", () => ({
  buildLocalDayPayload: jest.fn(),
  getAgenda: jest.fn(),
  getAllDayDates: jest.fn(),
  getLocalAgendaUpdatedAt: jest.fn(),
  getLocalDayUpdatedAt: jest.fn(),
  hydrateLocalDay: jest.fn(),
  saveAgenda: jest.fn(),
}));

import {
  createDayRequest,
  getDaysRequest,
  getWeeklyPlanRequest,
  updateDayRequest,
  updateWeeklyPlanRequest,
} from "./api";
import {
  buildLocalDayPayload,
  getAgenda,
  getAllDayDates,
  getLocalAgendaUpdatedAt,
  getLocalDayUpdatedAt,
  hydrateLocalDay,
  saveAgenda,
} from "./storage";
import { scheduleSync, syncLocalFirstData } from "./sync";

describe("sync service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("crea un dia remoto cuando no existe en servidor", async () => {
    getDaysRequest.mockResolvedValue({ days: [] });
    getWeeklyPlanRequest.mockResolvedValue({ weeklyPlan: { days: {} } });
    getAllDayDates.mockReturnValue(["2026-04-12"]);
    buildLocalDayPayload.mockReturnValue({ date: "2026-04-12", tipo: "entrenamiento" });
    getLocalDayUpdatedAt.mockReturnValue("2026-04-12T10:00:00.000Z");
    getAgenda.mockReturnValue({});
    getLocalAgendaUpdatedAt.mockReturnValue(null);

    await syncLocalFirstData();

    expect(createDayRequest).toHaveBeenCalledWith({
      date: "2026-04-12",
      tipo: "entrenamiento",
    });
  });

  it("hidrata local cuando el servidor tiene un dia mas reciente", async () => {
    getDaysRequest.mockResolvedValue({
      days: [
        {
          _id: "day-1",
          date: "2026-04-12",
          updatedAt: "2026-04-12T12:00:00.000Z",
        },
      ],
    });
    getWeeklyPlanRequest.mockResolvedValue({ weeklyPlan: { days: {} } });
    getAllDayDates.mockReturnValue(["2026-04-12"]);
    buildLocalDayPayload.mockReturnValue({ date: "2026-04-12", tipo: "descanso" });
    getLocalDayUpdatedAt.mockReturnValue("2026-04-12T10:00:00.000Z");
    getAgenda.mockReturnValue({});
    getLocalAgendaUpdatedAt.mockReturnValue(null);

    await syncLocalFirstData();

    expect(hydrateLocalDay).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "day-1", date: "2026-04-12" }),
      { notify: false }
    );
    expect(updateDayRequest).not.toHaveBeenCalled();
  });

  it("guarda la agenda remota en local si es mas reciente", async () => {
    getDaysRequest.mockResolvedValue({ days: [] });
    getWeeklyPlanRequest.mockResolvedValue({
      weeklyPlan: {
        days: { lunes: { entreno: "superior" } },
        updatedAt: "2026-04-12T12:00:00.000Z",
      },
    });
    getAllDayDates.mockReturnValue([]);
    getAgenda.mockReturnValue({});
    getLocalAgendaUpdatedAt.mockReturnValue("2026-04-12T10:00:00.000Z");

    await syncLocalFirstData();

    expect(saveAgenda).toHaveBeenCalledWith(
      { lunes: { entreno: "superior" } },
      { updatedAt: "2026-04-12T12:00:00.000Z", notify: false }
    );
  });

  it("scheduleSync ejecuta la tarea con debounce", () => {
    const task = jest.fn().mockResolvedValue(undefined);

    scheduleSync(500, task);
    scheduleSync(500, task);

    jest.advanceTimersByTime(499);
    expect(task).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(task).toHaveBeenCalledTimes(1);
  });

  it("empuja la agenda local si es mas reciente", async () => {
    getDaysRequest.mockResolvedValue({ days: [] });
    getWeeklyPlanRequest.mockResolvedValue({
      weeklyPlan: {
        days: { martes: { entreno: "descanso" } },
        updatedAt: "2026-04-12T08:00:00.000Z",
      },
    });
    getAllDayDates.mockReturnValue([]);
    getAgenda.mockReturnValue({ lunes: { entreno: "superior" } });
    getLocalAgendaUpdatedAt.mockReturnValue("2026-04-12T10:00:00.000Z");

    await syncLocalFirstData();

    expect(updateWeeklyPlanRequest).toHaveBeenCalledWith({
      days: { lunes: { entreno: "superior" } },
    });
  });
});
