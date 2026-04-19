import {
  defaultMealPlan,
  getEstructuraDiaFromMealPlan,
  getPlanTypeForDate,
  getSlotLabel,
} from "./plan";

describe("plan data", () => {
  it("usa el plan de lunes a viernes entre semana", () => {
    expect(getPlanTypeForDate("2026-04-20")).toBe("semana");
    expect(getEstructuraDiaFromMealPlan("2026-04-20", defaultMealPlan)).toHaveLength(5);
    expect(
      getSlotLabel(getEstructuraDiaFromMealPlan("2026-04-20", defaultMealPlan)[1])
    ).toBe("Bloque 2 o Bloque 3");
  });

  it("usa el plan de sabado y domingo en fin de semana", () => {
    expect(getPlanTypeForDate("2026-04-19")).toBe("finde");
    expect(getEstructuraDiaFromMealPlan("2026-04-19", defaultMealPlan)).toHaveLength(4);
    expect(
      getSlotLabel(getEstructuraDiaFromMealPlan("2026-04-19", defaultMealPlan)[3])
    ).toBe("Bloque 4");
  });
});
