import { useState } from "react";
import Home from "./screens/Home";
import Desayuno from "./screens/Desayuno";
import Comida from "./screens/Comida";
import Cena from "./screens/Cena";
import Entrenamiento from "./screens/Entrenamiento";
import Historial from "./screens/Historial";
import PlanDia from "./screens/PlanDia";
import Agenda from "./screens/Agenda";
import Login from "./screens/Login";
import Register from "./screens/Register";
import { useAuth } from "./context/AuthContext";

function App() {
  const [pantalla, setPantalla] = useState("home");
  const [authScreen, setAuthScreen] = useState("login");
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f2f2f7",
          color: "#666",
          fontFamily: "system-ui",
        }}
      >
        Cargando sesion...
      </div>
    );
  }

  if (!isAuthenticated) {
    return authScreen === "register" ? (
      <Register onShowLogin={() => setAuthScreen("login")} />
    ) : (
      <Login onShowRegister={() => setAuthScreen("register")} />
    );
  }

  if (pantalla === "desayuno") {
    return <Desayuno volver={() => setPantalla("home")} />;
  }

  if (pantalla === "comida") {
    return <Comida volver={() => setPantalla("home")} />;
  }

  if (pantalla === "cena") {
    return <Cena volver={() => setPantalla("home")} />;
  }

  if (pantalla === "entrenamiento") {
    return <Entrenamiento volver={() => setPantalla("home")} />;
  }

  if (pantalla === "historial") {
    return <Historial volver={() => setPantalla("home")} />;
  }

  if (pantalla === "plandia") {
  return <PlanDia volver={() => setPantalla("home")} />;
  }
  
  if (pantalla === "agenda") {
  return <Agenda volver={() => setPantalla("home")} />;
}

  return <Home setPantalla={setPantalla} />;
}

export default App;
