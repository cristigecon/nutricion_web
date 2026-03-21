import { useState, useEffect } from "react";
import { estructuraDias } from "../data/plan";
import CheckCircle from "../components/CheckCircle";
import Card from "../components/Card";
import { theme } from "../styles/theme";
import { calcularStreak } from "../utils/streak";
import Confetti from "../components/Confetti";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Home({ setPantalla }) {
  const fecha = getFechaHoy();

  const data = JSON.parse(
    localStorage.getItem("plan_" + fecha)
  ) || {};

  const tipo = data.tipo || "entrenamiento";

  const checks = JSON.parse(
    localStorage.getItem("checks_" + fecha)
  ) || {};

  const diaSemana = new Date(fecha)
    .toLocaleDateString("es-ES", { weekday: "long" });

  const agenda = JSON.parse(
    localStorage.getItem("agenda_entreno")
  ) || {};

  const datosDia = agenda[diaSemana] || {};

  const entrenoHoy = datosDia.entreno;
  const cardioHoy = datosDia.cardio;

  const entrenoHecho = JSON.parse(
    localStorage.getItem("entreno_check_" + fecha)
  ) || false;

  const [cardio, setCardio] = useState(
    JSON.parse(localStorage.getItem("cardio_" + fecha)) || false
  );

  const [showConfetti, setShowConfetti] = useState(false);

  const streak = calcularStreak();

  // progreso comidas
  let completados = 0;
  const total = estructuraDias[tipo]?.length || 0;

  estructuraDias[tipo]?.forEach((item) => {
    if (checks[item.nombre]) completados++;
  });

  const totalFinal = total + 2;

  const completadosFinal =
    completados +
    (entrenoHecho ? 1 : 0) +
    (cardio ? 1 : 0);

  const diaPerfecto =
    totalFinal > 0 && completadosFinal === totalFinal;

  const porcentaje =
    totalFinal > 0 ? (completadosFinal / totalFinal) * 100 : 0;

  // 🎉 activar confetti
  useEffect(() => {
    if (diaPerfecto) {
      setShowConfetti(true);
    }
  }, [diaPerfecto]);

  const nombresEntreno = {
    inferior: "Tren inferior + abdomen",
    superior: "Tren superior",
    descanso: "Descanso"
  };

  const toggleCardio = () => {
    const nuevo = !cardio;
    setCardio(nuevo);

    localStorage.setItem(
      "cardio_" + fecha,
      JSON.stringify(nuevo)
    );
  };

  return (
    <>
      <Confetti trigger={showConfetti} />

      <div
        style={{
          padding: 20,
          fontFamily: "system-ui",
          backgroundColor: theme.colors.background,
          minHeight: "100vh"
        }}
      >
        {/* HEADER */}
        <h3 style={{ color: theme.colors.subtext, marginBottom: 0 }}>
          Buenos días
        </h3>

        <h1 style={{ marginTop: 5, color: theme.colors.text }}>
          Plan de hoy
        </h1>

        {/* STREAK */}
        <p style={{ color: theme.colors.subtext, marginTop: 5 }}>
          🔥 {streak} días seguidos
        </p>

        {/* BADGE */}
        {diaPerfecto && (
          <div
            style={{
              marginTop: 10,
              backgroundColor: theme.colors.success,
              color: "white",
              padding: "8px 12px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "fit-content",
              fontWeight: "600",
              fontSize: 14,
              transform: "scale(1.05)",
              transition: "all 0.3s ease"
            }}
          >
            🔥 Día perfecto
          </div>
        )}

        <BarraProgreso porcentaje={porcentaje} />

        <div style={{ marginTop: 25 }}>
          {/* ENTRENAMIENTO */}
          <Card onClick={() => setPantalla("entrenamiento")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={icon(theme.colors.warning)}>🏋️</div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  {nombresEntreno[entrenoHoy] || "Sin plan"}
                </div>
                <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                  Entrenamiento
                </div>
              </div>
            </div>

            {entrenoHecho && <CheckCircle checked />}
          </Card>

          {/* CARDIO */}
          {cardioHoy && (
            <Card>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={icon(theme.colors.danger)}>🔥</div>

                <div>
                  <div style={{ fontWeight: "600" }}>Cardio</div>
                  <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                    25 min
                  </div>
                </div>
              </div>

              <CheckCircle
                checked={cardio}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCardio();
                }}
              />
            </Card>
          )}

          {/* PLAN */}
          <Card onClick={() => setPantalla("plandia")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={icon(theme.colors.success)}>📋</div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  Plan nutricional
                </div>
                <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                  Ver comidas
                </div>
              </div>
            </div>
          </Card>

          {/* AGENDA */}
          <Card onClick={() => setPantalla("agenda")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={icon(theme.colors.primary)}>📅</div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  Agenda
                </div>
                <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                  Plan semanal
                </div>
              </div>
            </div>
          </Card>

          {/* HISTORIAL */}
          <Card onClick={() => setPantalla("historial")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={icon(theme.colors.purple)}>📊</div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  Historial
                </div>
                <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                  Ver progreso
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

// barra progreso
function BarraProgreso({ porcentaje }) {
  const segmentos = 4;
  const activos = Math.round((porcentaje / 100) * segmentos);

  return (
    <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
      {[...Array(segmentos)].map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 10,
            backgroundColor:
              i < activos ? theme.colors.success : theme.colors.border
          }}
        />
      ))}
    </div>
  );
}

const icon = (color) => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  backgroundColor: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  marginRight: 12
});

export default Home;