import { useState } from "react";
import { botonVolver } from "../styles/styles";
import BotonGuardar from "../components/BotonGuardar";
import Section from "../components/Section";
import Boton from "../components/Boton";
import { theme } from "../styles/theme";

function getSemana() {
  const hoy = new Date();
  const dias = [];

  for (let i = -7; i <= 7; i++) {
    const d = new Date();
    d.setDate(hoy.getDate() + i);

    dias.push({
      fecha: d.toISOString().split("T")[0],
      dia: d.getDate(),
      nombre: d.toLocaleDateString("es-ES", { weekday: "short" })
    });
  }

  return dias;
}

function Agenda({ volver }) {
  const semana = getSemana();

  const [seleccionado, setSeleccionado] = useState(semana[7].fecha);

  const agendaGuardada = JSON.parse(
    localStorage.getItem("agenda_entreno")
  ) || {};

  const diaSemana = new Date(seleccionado)
    .toLocaleDateString("es-ES", { weekday: "long" });

  const [datos, setDatos] = useState(
    agendaGuardada[diaSemana] || {}
  );

  const actualizar = (campo, valor) => {
    setDatos((prev) => ({
      ...prev,
      [campo]: valor
    }));
  };

  const guardar = () => {
    const nuevaAgenda = {
      ...agendaGuardada,
      [diaSemana]: datos
    };

    localStorage.setItem(
      "agenda_entreno",
      JSON.stringify(nuevaAgenda)
    );

    volver();
  };

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: theme.colors.background,
        minHeight: "100vh"
      }}
    >
      <button onClick={volver} style={botonVolver}>
        ← Volver
      </button>

      <h1>Agenda</h1>

      {/* 🔥 CALENDARIO PRO */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          gap: 12,
          marginTop: 15,
          marginBottom: 25,
          paddingBottom: 5
        }}
      >
        {semana.map((d) => {
          const activo = seleccionado === d.fecha;

          return (
            <div
              key={d.fecha}
              onClick={() => {
                setSeleccionado(d.fecha);

                const nuevoDia = new Date(d.fecha)
                  .toLocaleDateString("es-ES", { weekday: "long" });

                setDatos(agendaGuardada[nuevoDia] || {});
              }}
              style={{
                minWidth: 70,
                padding: "12px 10px",
                borderRadius: 20,
                textAlign: "center",
                cursor: "pointer",
                backgroundColor: activo
                  ? theme.colors.text
                  : theme.colors.card,
                color: activo ? "white" : theme.colors.text,
                transition: "0.2s",
                boxShadow: activo
                  ? "0 6px 15px rgba(0,0,0,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ fontSize: 12 }}>
                {d.nombre}
              </div>

              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                {d.dia}
              </div>
            </div>
          );
        })}
      </div>

      {/* ENTRENAMIENTO */}
      <Section titulo="🏋️ Entrenamiento">
        <div style={{ display: "flex", gap: 10 }}>
          <Boton
            activo={datos.entreno === "inferior"}
            onClick={() => actualizar("entreno", "inferior")}
          >
            🦵 Inferior
          </Boton>

          <Boton
            activo={datos.entreno === "superior"}
            onClick={() => actualizar("entreno", "superior")}
          >
            💪 Superior
          </Boton>

          <Boton
            activo={datos.entreno === "descanso"}
            onClick={() => actualizar("entreno", "descanso")}
          >
            😴 Descanso
          </Boton>
        </div>
      </Section>

      {/* CARDIO */}
      <Section titulo="🔥 Cardio">
        <Boton
          activo={datos.cardio}
          onClick={() => actualizar("cardio", !datos.cardio)}
        >
          {datos.cardio ? "✔️ Activado" : "Activar"}
        </Boton>
      </Section>

      <BotonGuardar onClick={guardar} />
    </div>
  );
}

export default Agenda;