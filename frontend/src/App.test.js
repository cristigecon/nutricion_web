import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("./screens/Home", () => () => <div>Home screen</div>);
jest.mock("./screens/Login", () => () => <div>Login screen</div>);
jest.mock("./screens/Register", () => () => <div>Register screen</div>);
jest.mock("./screens/Desayuno", () => () => <div>Desayuno screen</div>);
jest.mock("./screens/Comida", () => () => <div>Comida screen</div>);
jest.mock("./screens/Cena", () => () => <div>Cena screen</div>);
jest.mock("./screens/Entrenamiento", () => () => <div>Entrenamiento screen</div>);
jest.mock("./screens/Historial", () => () => <div>Historial screen</div>);
jest.mock("./screens/PlanDia", () => () => <div>PlanDia screen</div>);
jest.mock("./screens/Agenda", () => () => <div>Agenda screen</div>);

const { useAuth } = require("./context/AuthContext");

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra el estado de carga mientras hidrata la sesion", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isBootstrapping: true,
    });

    render(<App />);

    expect(screen.getByText("Cargando sesion...")).toBeInTheDocument();
  });

  it("muestra login si no hay sesion", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      isBootstrapping: false,
    });

    render(<App />);

    expect(screen.getByText("Login screen")).toBeInTheDocument();
  });

  it("muestra la home cuando la sesion esta activa", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      isBootstrapping: false,
    });

    render(<App />);

    expect(screen.getByText("Home screen")).toBeInTheDocument();
  });
});
