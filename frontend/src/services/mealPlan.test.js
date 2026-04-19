jest.mock("./storage", () => ({
  getMealPlanDefinition: jest.fn(),
  saveMealPlanDefinition: jest.fn(),
}));

import { defaultMealPlan } from "../data/plan";
import { getEstructuraDia, getMealPlan, hydrateMealPlan } from "./mealPlan";
import * as storage from "./storage";

describe("mealPlan service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("usa el plan cacheado si existe en local", () => {
    storage.getMealPlanDefinition.mockReturnValue({
      estructuraDias: {
        semana: [{ id: "custom", hora: "08:30", bloques: ["bloque1"] }],
        finde: [],
      },
      bloques: {
        bloque1: { proteina: ["opcion custom"] },
      },
    });

    const mealPlan = getMealPlan();

    expect(mealPlan.estructuraDias.semana).toHaveLength(1);
    expect(getEstructuraDia("2026-04-20")[0].hora).toBe("08:30");
  });

  it("guarda una version normalizada al hidratar desde backend", () => {
    hydrateMealPlan({ bloques: defaultMealPlan.bloques }, { notify: false });

    expect(storage.saveMealPlanDefinition).toHaveBeenCalledWith(
      expect.objectContaining({
        estructuraDias: defaultMealPlan.estructuraDias,
        bloques: defaultMealPlan.bloques,
      }),
      { notify: false }
    );
  });
});
