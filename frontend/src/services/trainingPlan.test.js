jest.mock("./storage", () => ({
  getTrainingPlanDefinition: jest.fn(),
  saveTrainingPlanDefinition: jest.fn(),
}));

import { defaultTrainingPlan } from "../data/entrenamientos";
import {
  formatRoutineForWorkout,
  getTrainingPlan,
  getTrainingRoutines,
  hydrateTrainingPlan,
} from "./trainingPlan";
import * as storage from "./storage";

describe("trainingPlan service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("usa la rutina cacheada si existe en local", () => {
    storage.getTrainingPlanDefinition.mockReturnValue({
      routines: {
        inferior: [
          {
            nombre: "Custom squat",
            imagen: "",
            series: 3,
            reps: "12",
            cadencia: "2",
            descanso: "45",
          },
        ],
      },
    });

    const trainingPlan = getTrainingPlan();

    expect(trainingPlan.routines.inferior).toHaveLength(1);
    expect(getTrainingRoutines().inferior[0].nombre).toBe("Custom squat");
  });

  it("guarda una version normalizada al hidratar desde backend", () => {
    hydrateTrainingPlan({ routines: defaultTrainingPlan.routines }, { notify: false });

    expect(storage.saveTrainingPlanDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        routines: defaultTrainingPlan.routines,
      }),
      { notify: false }
    );
  });

  it("formatea la rutina a series editables", () => {
    const formatted = formatRoutineForWorkout([
      {
        nombre: "Plancha",
        imagen: "/img/plancha.png",
        series: 4,
        reps: "1",
        cadencia: "30",
        descanso: "30",
      },
    ]);

    expect(formatted[0].series).toHaveLength(4);
    expect(formatted[0].series[0].reps).toBe("1");
    expect(formatted[0].cadencia).toBe("30");
  });
});
