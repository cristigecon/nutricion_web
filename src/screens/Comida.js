import { useState } from "react";
import Bloque from "../components/Bloque";
import { boton } from "../styles";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Comida({ volver }) {
 const fecha = getFechaHoy();
const datosGuardados = JSON.parse(
  localStorage.getItem("comida_" + fecha)
) || {};

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

  localStorage.setItem("comida_" + fecha, JSON.stringify(datos));

  alert("Comida guardada ✅");
};

  return (
    <div style={{ padding: 20 }}>
      <button onClick={volver}>⬅ Volver</button>

      <h1>Comida</h1>

      <Bloque
        titulo="Proteína"
        opciones={[
          "Pollo",
          "Ternera",
          "Pescado"
        ]}
        valor={proteina}
        setValor={setProteina}
      />

      <Bloque
        titulo="Carbohidrato"
        opciones={[
          "Arroz",
          "Pasta",
          "Patata"
        ]}
        valor={carbo}
        setValor={setCarbo}
      />

      <Bloque
        titulo="Grasa"
        opciones={[
          "Aceite de oliva",
          "Aguacate"
        ]}
        valor={grasa}
        setValor={setGrasa}
      />

      <button onClick={guardar} style={boton}>
        Guardar comida
      </button>
    </div>
  );
}


export default Comida;