import { useState } from "react";
import Bloque from "../components/Bloque";
import { boton } from "../styles";
import { getMealByName, saveMealByName } from "../services/storage";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Cena({ volver }) {
const fecha = getFechaHoy();
const datosGuardados = getMealByName(fecha, "cena") || {};

const [proteina, setProteina] = useState(datosGuardados.proteina || "");
const [carbo, setCarbo] = useState(datosGuardados.carbo || "");
const [grasa, setGrasa] = useState(datosGuardados.grasa || "");

  const guardar = () => {
  const fecha = getFechaHoy();

  const datos = {
    proteina,
    carbo,
    grasa
  };

  saveMealByName(fecha, "cena", datos);

  alert("Cena guardada ✅");
};

 

  return (
    <div style={{ padding: 20 }}>
      <button onClick={volver}>⬅ Volver</button>

      <h1>Cena</h1>

      <Bloque
        titulo="Proteína"
        opciones={[
          "Pollo",
          "Pescado",
          "Huevos"
        ]}
        valor={proteina}
        setValor={setProteina}
      />

      <Bloque
        titulo="Carbohidrato"
        opciones={[
          "Arroz",
          "Verduras",
          "Patata"
        ]}
        valor={carbo}
        setValor={setCarbo}
      />

      <Bloque
        titulo="Grasa"
        opciones={[
          "Aceite de oliva",
          "Frutos secos"
        ]}
        valor={grasa}
        setValor={setGrasa}
      />

      <button onClick={guardar} style={boton}>
        Guardar cena
      </button>
    </div>
  );
}


export default Cena;