import { hydrateLocalDay, saveAgenda } from "./storage";

describe("storage notifications", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("no emite eventos al hidratar datos remotos con notify false", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    hydrateLocalDay(
      {
        date: "2026-04-12",
        updatedAt: "2026-04-12T12:00:00.000Z",
        selecciones: { desayuno: "A" },
        mealChecks: { desayuno: true },
        workout: [],
        cardio: false,
        entrenoCheck: false,
        meals: {
          desayuno: { alimento: "Tostadas" },
        },
      },
      { notify: false }
    );

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("no emite eventos al guardar agenda remota con notify false", () => {
    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    saveAgenda(
      { lunes: { entreno: "superior" } },
      {
        updatedAt: "2026-04-12T12:00:00.000Z",
        notify: false,
      }
    );

    expect(dispatchSpy).not.toHaveBeenCalled();
  });
});
