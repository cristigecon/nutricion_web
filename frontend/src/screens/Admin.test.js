import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Admin from "./Admin";

jest.mock("../services/api", () => ({
  getMealPlanRequest: jest.fn(),
  getTrainingPlanRequest: jest.fn(),
  updateMealPlanRequest: jest.fn(),
  updateTrainingPlanRequest: jest.fn(),
}));

jest.mock("../services/mealPlan", () => ({
  hydrateMealPlan: jest.fn(),
}));

jest.mock("../services/trainingPlan", () => ({
  hydrateTrainingPlan: jest.fn(),
}));

const api = require("../services/api");
const mealPlan = require("../services/mealPlan");
const trainingPlan = require("../services/trainingPlan");

describe("Admin screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    api.getMealPlanRequest.mockResolvedValue({
      mealPlan: {
        estructuraDias: {
          semana: [{ id: "comida_1", hora: "06:30", bloques: ["bloque1"] }],
          finde: [{ id: "comida_1", hora: "10:00", bloques: ["bloque1"] }],
        },
        bloques: {
          bloque1: {
            proteina: ["250g queso fresco batido"],
            carbo: ["50g pan de cereales"],
          },
        },
      },
    });

    api.getTrainingPlanRequest.mockResolvedValue({
      trainingPlan: {
        routines: {
          inferior: [
            {
              nombre: "Sentadilla goblet",
              imagen: "/img/sentadilla.png",
              series: 4,
              reps: "15",
              cadencia: "3",
              descanso: "30",
            },
          ],
          superior: [
            {
              nombre: "Flexiones",
              imagen: "/img/flexiones.png",
              series: 4,
              reps: "15",
              cadencia: "3",
              descanso: "30",
            },
          ],
        },
      },
    });

    api.updateMealPlanRequest.mockResolvedValue({
      mealPlan: {
        updatedAt: "2026-04-19T10:00:00.000Z",
        estructuraDias: {
          semana: [{ id: "comida_1", hora: "07:00", bloques: ["bloque1"] }],
          finde: [{ id: "comida_1", hora: "10:00", bloques: ["bloque1"] }],
        },
        bloques: {
          bloque1: {
            proteina: ["250g queso fresco batido"],
            carbo: ["50g pan de cereales"],
          },
        },
      },
    });

    api.updateTrainingPlanRequest.mockResolvedValue({
      trainingPlan: {
        updatedAt: "2026-04-19T10:00:00.000Z",
        routines: {
          inferior: [
            {
              nombre: "Sentadilla goblet",
              imagen: "/img/sentadilla.png",
              series: 4,
              reps: "15",
              cadencia: "3",
              descanso: "30",
            },
          ],
          superior: [
            {
              nombre: "Flexiones con banda",
              imagen: "/img/flexiones.png",
              series: 4,
              reps: "15",
              cadencia: "3",
              descanso: "30",
            },
          ],
        },
      },
    });

    mealPlan.hydrateMealPlan.mockImplementation((value) => value);
    trainingPlan.hydrateTrainingPlan.mockImplementation((value) => value);
  });

  it("carga el panel y guarda el plan nutricional", async () => {
    render(<Admin volver={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument();
      expect(screen.getByDisplayValue("06:30")).toBeInTheDocument();
    });

    await userEvent.clear(screen.getByLabelText("Hora Lunes a viernes 1"));
    await userEvent.type(screen.getByLabelText("Hora Lunes a viernes 1"), "07:00");
    await userEvent.click(screen.getByRole("button", { name: "Guardar plan nutricional" }));

    await waitFor(() => {
      expect(api.updateMealPlanRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          estructuraDias: expect.objectContaining({
            semana: [expect.objectContaining({ hora: "07:00" })],
          }),
        })
      );
      expect(mealPlan.hydrateMealPlan).toHaveBeenCalledWith(
        expect.objectContaining({ updatedAt: "2026-04-19T10:00:00.000Z" }),
        expect.objectContaining({
          notify: false,
          updatedAt: "2026-04-19T10:00:00.000Z",
        })
      );
      expect(screen.getByText("Plan nutricional guardado en Mongo.")).toBeInTheDocument();
    });
  });

  it("guarda el plan de entrenamiento", async () => {
    render(<Admin volver={() => {}} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Admin" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Entrenamiento" }));
    await userEvent.clear(screen.getByLabelText("Nombre Tren superior 1"));
    await userEvent.type(screen.getByLabelText("Nombre Tren superior 1"), "Flexiones con banda");
    await userEvent.click(screen.getByRole("button", { name: "Guardar plan de entrenamiento" }));

    await waitFor(() => {
      expect(api.updateTrainingPlanRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          routines: expect.objectContaining({
            superior: [expect.objectContaining({ nombre: "Flexiones con banda" })],
          }),
        })
      );
      expect(trainingPlan.hydrateTrainingPlan).toHaveBeenCalled();
      expect(screen.getByText("Plan de entrenamiento guardado en Mongo.")).toBeInTheDocument();
    });
  });
});
