import { useState } from "react";
import Home from "./screens/Home";
import Desayuno from "./screens/Desayuno";
import Comida from "./screens/Comida";
import Cena from "./screens/Cena";
import Entrenamiento from "./screens/Entrenamiento";
import Historial from "./screens/Historial";
import PlanDia from "./screens/PlanDia";
import Agenda from "./screens/Agenda";

function App() {
  const [pantalla, setPantalla] = useState("home");

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