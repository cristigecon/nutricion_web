import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PlanDia from "./PlanDia";

jest.mock("../services/mealPlan", () => ({
  getBloqueLabel: (bloque) => `Bloque ${String(bloque).replace("bloque", "")}`,
  getEstructuraDia: () => [
    { id: "comida_1", hora: "10:00", bloques: ["bloque1", "bloque2"] },
  ],
  getPlanTypeForDate: () => "semana",
  getSlotLabel: (slot) =>
    slot.bloques.map((bloque) => `Bloque ${String(bloque).replace("bloque", "")}`).join(" o ")
  ,
  getBloques: () => ({
    bloque1: {
      proteina: ["Pollo", "Pavo"],
    },
    bloque2: {
      proteina: ["Atun", "Huevo"],
    },
  }),
}));

jest.mock("../services/storage", () => ({
  getDay: jest.fn(() => ({})),
  getMealChecks: jest.fn(() => ({})),
  saveMealChecks: jest.fn(),
  saveDay: jest.fn(),
}));

describe("PlanDia", () => {
  it("mantiene marcada la seleccion dentro de los bloques", async () => {
    render(<PlanDia volver={() => {}} />);

    await userEvent.click(screen.getByText("Bloque 1 o Bloque 2 (10:00)"));
    await userEvent.click(screen.getByText("Proteina"));
    await userEvent.click(screen.getByText("Pollo"));

    expect(screen.getByText("Pollo")).toHaveStyle({
      backgroundColor: "#4CAF50",
      color: "white",
    });
  });
});
