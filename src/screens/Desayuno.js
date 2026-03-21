import { useState } from "react";
import Bloque from "../components/Bloque";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Desayuno({ volver }) {
  const fecha = getFechaHoy();
const datosGuardados = JSON.parse(
  localStorage.getItem("desayuno_" + fecha)
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

  localStorage.setItem("desayuno_" + fecha, JSON.stringify(datos));

  alert("Desayuno guardado ✅");
};

  return (
    <div style={{ padding: 20 }}>
      <button onClick={volver}>⬅ Volver</button>

      <h1>Desayuno</h1>

      <Bloque
        titulo="Proteína"
        opciones={[
          "Yogur + pavo",
          "Huevo + claras",
          "Queso fresco + pavo"
        ]}
        valor={proteina}
        setValor={setProteina}
      />

      <Bloque
        titulo="Carbohidrato"
        opciones={[
          "Avena",
          "Pan"
        ]}
        valor={carbo}
        setValor={setCarbo}
      />

      <Bloque
        titulo="Grasa"
        opciones={[
          "Aceite de oliva",
          "Aguacate",
          "Frutos secos"
        ]}
        valor={grasa}
        setValor={setGrasa}
      />

      <button  onClick={guardar}  style={{
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    border: "none",
    backgroundColor: "#000",
    color: "white",
    fontSize: 16,
    width: "100%"
  }}
>
  Guardar desayuno
</button>

      <div style={{ marginTop: 20 }}>
        <strong>Seleccionado:</strong>
        <p>Proteína: {proteina}</p>
        <p>Carbohidrato: {carbo}</p>
        <p>Grasa: {grasa}</p>
      </div>
    </div>
  );
}

export default Desayuno;