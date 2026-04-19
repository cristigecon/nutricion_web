import { useState, useEffect } from "react";
import { getEstructuraDia } from "../services/mealPlan";
import CheckCircle from "../components/CheckCircle";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { theme } from "../styles/theme";
import { calcularStreak } from "../utils/streak";
import Confetti from "../components/Confetti";
import {
  getMealChecks,
  getAgenda,
  getEntrenoCheck,
  getCardio,
  setCardio as setCardioStorage
} from "../services/storage";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function Home({ setPantalla }) {
  const { user, logout, syncStatus, syncError, lastSyncedAt, runSync } = useAuth();
  const fecha = getFechaHoy();
  const estructuraDia = getEstructuraDia(fecha);

  const checks = getMealChecks(fecha);

  const diaSemana = new Date(fecha)
    .toLocaleDateString("es-ES", { weekday: "long" });

  const agenda = getAgenda();
  const datosDia = agenda[diaSemana] || {};

  const entrenoHoy = datosDia.entreno;
  const cardioHoy = datosDia.cardio;

  const entrenoHecho = getEntrenoCheck(fecha);

  const [cardio, setCardio] = useState(getCardio(fecha));

  const [showConfetti, setShowConfetti] = useState(false);

  const streak = calcularStreak();

  // progreso comidas
  const completados = Object.values(checks || {}).filter(Boolean).length;
  const total = estructuraDia.length;

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

    setCardioStorage(fecha, nuevo);
  };

  const syncBadge = {
    idle: {
      label: "Sincronizacion inactiva",
      backgroundColor: "#f4f4f6",
      color: theme.colors.subtext,
    },
    syncing: {
      label: "Sincronizando...",
      backgroundColor: "#eef6ff",
      color: theme.colors.primary,
    },
    success: {
      label: "Sincronizado",
      backgroundColor: "#edf8ef",
      color: theme.colors.success,
    },
    pending: {
      label: "Sync pendiente",
      backgroundColor: "#fff7e8",
      color: "#9a6700",
    },
    offline: {
      label: "Sin conexion",
      backgroundColor: "#fff7e8",
      color: "#9a6700",
    },
    error: {
      label: "Error de sync",
      backgroundColor: "#fff3f1",
      color: theme.colors.danger,
    },
  }[syncStatus] || {
    label: "Sin estado",
    backgroundColor: "#f4f4f6",
    color: theme.colors.subtext,
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
        <div
          style={{
            marginTop: 14,
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.05)"
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: theme.colors.subtext }}>
              Sesion iniciada
            </div>
            <div style={{ fontWeight: "600", color: theme.colors.text }}>
              {user?.email || "Usuario"}
            </div>
            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                backgroundColor: syncBadge.backgroundColor,
                color: syncBadge.color,
                fontSize: 12,
                fontWeight: "600"
              }}
            >
              <span>{syncBadge.label}</span>
              {syncStatus === "success" && lastSyncedAt ? (
                <span style={{ opacity: 0.8 }}>
                  {new Date(lastSyncedAt).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              ) : null}
            </div>
            {syncError ? (
              <div style={{ marginTop: 8, fontSize: 12, color: theme.colors.danger }}>
                {syncError}
              </div>
            ) : null}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <button
              type="button"
              onClick={runSync}
              disabled={syncStatus === "syncing"}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 14px",
                cursor: syncStatus === "syncing" ? "default" : "pointer",
                backgroundColor: "#eef8f0",
                color: theme.colors.success,
                fontWeight: "600",
                opacity: syncStatus === "syncing" ? 0.7 : 1
              }}
            >
              Sync ahora
            </button>
            <button
              type="button"
              onClick={logout}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 14px",
                cursor: "pointer",
                backgroundColor: "#eef6ff",
                color: theme.colors.primary,
                fontWeight: "600"
              }}
            >
              Salir
            </button>
          </div>
        </div>

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

          <Card onClick={() => setPantalla("admin")}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={icon("#111827")}>A</div>

              <div>
                <div style={{ fontWeight: "600" }}>
                  Admin
                </div>
                <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                  Editar planes
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
