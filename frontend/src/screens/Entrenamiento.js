import { useState, useEffect } from "react";
import { entrenamientos } from "../data/entrenamientos";
import {
  getWorkoutByDate,
  saveWorkoutByDate,
  getCardio,
  setCardio as setCardioStorage,
  getEntrenoCheck,
  setEntrenoCheck,
  getAgenda
} from "../services/storage";

import BotonGuardar from "../components/BotonGuardar";
import Boton from "../components/Boton";
import Section from "../components/Section";

import {
  botonVolver,
  cardEjercicio,
  imagenBox,
  inputTitulo,
  fila,
  inputSerie,
  botonSerie
} from "../styles/styles";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Entrenamiento({ volver }) {
  const fecha = getFechaHoy();

  const datosGuardados = getWorkoutByDate(fecha) || [];

  const [ejercicios, setEjercicios] = useState(datosGuardados);
  const [tipo, setTipo] = useState("inferior");

  const [cardio, setCardio] = useState(getCardio(fecha));

  const [entrenoHecho, setEntrenoHecho] = useState(getEntrenoCheck(fecha));

  const diaSemana = new Date()
    .toLocaleDateString("es-ES", { weekday: "long" });

  const agenda = getAgenda();

  const datosDia = agenda[diaSemana] || {};

  const tipoAuto = datosDia.entreno;
  const cardioAuto = datosDia.cardio;

  const nombres = {
    inferior: "Tren inferior + abdomen",
    superior: "Tren superior",
    descanso: "Descanso"
  };

  useEffect(() => {
    if (cardioAuto && !cardio) {
      setCardio(true);
    }
  }, [cardioAuto, cardio]);

  useEffect(() => {
    if (ejercicios.length > 0) return;
    if (!tipoAuto || tipoAuto === "descanso") return;

    const rutina = entrenamientos[tipoAuto];
    if (!rutina) return;

    const formateado = rutina.map((ej) => ({
      nombre: ej.nombre,
      imagen: ej.imagen,
      series: Array.from({ length: ej.series }).map(() => ({
        reps: ej.reps,
        peso: ""
      }))
    }));

    setEjercicios(formateado);
    setTipo(tipoAuto);
  }, [ejercicios.length, tipoAuto]);

  const cargarRutina = (tipoSeleccionado) => {
    if (tipoSeleccionado === "descanso") {
      setEjercicios([]);
      setTipo("descanso");
      return;
    }

    const rutina = entrenamientos[tipoSeleccionado];

    const formateado = rutina.map((ej) => ({
      nombre: ej.nombre,
      imagen: ej.imagen,
      series: Array.from({ length: ej.series }).map(() => ({
        reps: ej.reps,
        peso: ""
      }))
    }));

    setEjercicios(formateado);
    setTipo(tipoSeleccionado);
  };

  const actualizarEjercicio = (index, campo, valor) => {
    const copia = [...ejercicios];
    copia[index][campo] = valor;
    setEjercicios(copia);
  };

  const actualizarSerie = (eIndex, sIndex, campo, valor) => {
    const copia = [...ejercicios];
    copia[eIndex].series[sIndex][campo] = valor;
    setEjercicios(copia);
  };

  const añadirSerie = (index) => {
    const copia = [...ejercicios];
    copia[index].series.push({ reps: "", peso: "" });
    setEjercicios(copia);
  };

  const toggleEntreno = () => {
    const nuevo = !entrenoHecho;
    setEntrenoHecho(nuevo);

    setEntrenoCheck(fecha, nuevo);
  };

  const guardar = () => {
    saveWorkoutByDate(fecha, ejercicios);
    setCardioStorage(fecha, cardio);
  };

  return (
    <div style={{
      padding: 20,
      backgroundColor: "#f2f2f7",
      minHeight: "100vh"
    }}>
      <button onClick={volver} style={botonVolver}>
        ← Volver
      </button>

      <h1>Entrenamiento</h1>

      <p style={{ color: "#666" }}>
        Hoy toca: {nombres[tipoAuto] || "Sin plan"}
      </p>

      {/* SELECTOR */}
      <Section titulo="Tipo de entrenamiento">
        <div style={{ display: "flex", gap: 10 }}>
          <Boton
            activo={tipo === "inferior"}
            onClick={() => cargarRutina("inferior")}
          >
            🦵 Inferior
          </Boton>

          <Boton
            activo={tipo === "superior"}
            onClick={() => cargarRutina("superior")}
          >
            💪 Superior
          </Boton>
        </div>
      </Section>

      {/* EJERCICIOS */}
      {ejercicios.map((ej, i) => (
        <div key={i} style={cardEjercicio}>
          {ej.imagen && (
            <div style={imagenBox}>
              <img
                src={ej.imagen}
                alt={ej.nombre}
                style={{
                  maxHeight: 120,
                  objectFit: "contain"
                }}
              />
            </div>
          )}

          <input
            value={ej.nombre}
            onChange={(e) =>
              actualizarEjercicio(i, "nombre", e.target.value)
            }
            style={inputTitulo}
          />

          {ej.series.map((serie, j) => (
            <div key={j} style={fila}>
              <input
                value={serie.reps}
                onChange={(e) =>
                  actualizarSerie(i, j, "reps", e.target.value)
                }
                style={inputSerie}
              />

              <input
                value={serie.peso}
                onChange={(e) =>
                  actualizarSerie(i, j, "peso", e.target.value)
                }
                style={inputSerie}
              />
            </div>
          ))}

          <button
            onClick={() => añadirSerie(i)}
            style={botonSerie}
          >
            + Añadir serie
          </button>
        </div>
      ))}

      {/* ENTRENAMIENTO CHECK */}
      <Section titulo="🏋️ Entrenamiento">
        <Boton
          activo={entrenoHecho}
          onClick={toggleEntreno}
        >
          {entrenoHecho ? "✔️ Completado" : "Marcar entrenamiento"}
        </Boton>
      </Section>

      {/* CARDIO */}
      <Section titulo="🔥 Cardio">
        <Boton
          activo={cardio}
          onClick={() => setCardio(!cardio)}
        >
          {cardio ? "✔️ Completado" : "Marcar cardio"}
        </Boton>
      </Section>

      <BotonGuardar
        onClick={guardar}
        texto="Guardar entrenamiento"
      />
    </div>
  );
}

export default Entrenamiento;
