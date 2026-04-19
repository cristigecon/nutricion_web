import { useState, useEffect } from "react";
import {
  getWorkoutByDate,
  saveWorkoutByDate,
  getCardio,
  setCardio as setCardioStorage,
  getEntrenoCheck,
  setEntrenoCheck,
  getAgenda,
} from "../services/storage";
import {
  formatRoutineForWorkout,
  getTrainingRoutines,
} from "../services/trainingPlan";
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
  botonSerie,
} from "../styles/styles";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const nombres = {
  inferior: "Tren inferior + abdomen",
  superior: "Tren superior",
  descanso: "Descanso",
};

const metricBadge = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  backgroundColor: "#eef2f7",
  color: "#4d5b6b",
  fontSize: 12,
  fontWeight: "600",
};

function Entrenamiento({ volver }) {
  const fecha = getFechaHoy();
  const trainingRoutines = getTrainingRoutines();
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

  useEffect(() => {
    if (cardioAuto && !cardio) {
      setCardio(true);
    }
  }, [cardioAuto, cardio]);

  useEffect(() => {
    if (ejercicios.length > 0) return;
    if (!tipoAuto || tipoAuto === "descanso") return;

    const rutina = trainingRoutines[tipoAuto];
    if (!rutina) return;

    setEjercicios(formatRoutineForWorkout(rutina));
    setTipo(tipoAuto);
  }, [ejercicios.length, tipoAuto, trainingRoutines]);

  const cargarRutina = (tipoSeleccionado) => {
    if (tipoSeleccionado === "descanso") {
      setEjercicios([]);
      setTipo("descanso");
      return;
    }

    const rutina = trainingRoutines[tipoSeleccionado];
    if (!rutina) {
      setEjercicios([]);
      return;
    }

    setEjercicios(formatRoutineForWorkout(rutina));
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

  const anadirSerie = (index) => {
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
    <div
      style={{
        padding: 20,
        backgroundColor: "#f2f2f7",
        minHeight: "100vh",
      }}
    >
      <button onClick={volver} style={botonVolver}>
        ← Volver
      </button>

      <h1>Entrenamiento</h1>

      <p style={{ color: "#666" }}>
        Hoy toca: {nombres[tipoAuto] || "Sin plan"}
      </p>

      <Section titulo="Tipo de entrenamiento">
        <div style={{ display: "flex", gap: 10 }}>
          <Boton
            activo={tipo === "inferior"}
            onClick={() => cargarRutina("inferior")}
          >
            Inferior
          </Boton>

          <Boton
            activo={tipo === "superior"}
            onClick={() => cargarRutina("superior")}
          >
            Superior
          </Boton>
        </div>
      </Section>

      {ejercicios.map((ej, i) => (
        <div key={`${ej.nombre}-${i}`} style={cardEjercicio}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
              gap: 10,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: "#eef6ff",
                color: "#007AFF",
                fontSize: 12,
                fontWeight: "700",
              }}
            >
              Ejercicio {i + 1}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                fontWeight: "600",
              }}
            >
              {tipo === "superior" ? "Superior" : "Inferior"}
            </div>
          </div>

          <div style={imagenBox}>
            <img
              src={ej.imagen || "/img/exercise-placeholder.svg"}
              alt={ej.nombre}
              style={{
                maxHeight: 120,
                objectFit: "contain",
              }}
            />
          </div>

          <input
            value={ej.nombre}
            onChange={(event) => actualizarEjercicio(i, "nombre", event.target.value)}
            style={inputTitulo}
          />

          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={metricBadge}>Series: {ej.series.length}</span>
            <span style={metricBadge}>
              Reps objetivo: {ej.series[0]?.reps || "-"}
            </span>
            <span style={metricBadge}>Cadencia: {ej.cadencia || "-"}</span>
            <span style={metricBadge}>Descanso: {ej.descanso || "-"} s</span>
          </div>

          {ej.series.map((serie, j) => (
            <div key={`${ej.nombre}-serie-${j}`} style={fila}>
              <input
                value={serie.reps}
                onChange={(event) =>
                  actualizarSerie(i, j, "reps", event.target.value)
                }
                style={inputSerie}
                placeholder="Reps"
              />

              <input
                value={serie.peso}
                onChange={(event) =>
                  actualizarSerie(i, j, "peso", event.target.value)
                }
                style={inputSerie}
                placeholder="Peso"
              />
            </div>
          ))}

          <button
            onClick={() => anadirSerie(i)}
            style={botonSerie}
          >
            + Anadir serie
          </button>
        </div>
      ))}

      <Section titulo="Entrenamiento">
        <Boton
          activo={entrenoHecho}
          onClick={toggleEntreno}
        >
          {entrenoHecho ? "Completado" : "Marcar entrenamiento"}
        </Boton>
      </Section>

      <Section titulo="Cardio">
        <Boton
          activo={cardio}
          onClick={() => setCardio(!cardio)}
        >
          {cardio ? "Completado" : "Marcar cardio"}
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
