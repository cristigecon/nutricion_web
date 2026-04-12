import Card from "../components/Card";
import { botonVolver } from "../styles/styles";
import { theme } from "../styles/theme";
import { estructuraDias } from "../data/plan";
import GraficoSemanal from "../components/GraficoSemanal";
import { getMealChecks, getEntrenoCheck, getCardio, getDay, getAllDayDates } from "../services/storage";

function Historial({ volver }) {
  const datos = [];

  const fechas = getAllDayDates();

  fechas.forEach((fecha) => {
    const plan = getDay(fecha) || {};
    const checks = getMealChecks(fecha) || {};

    const entreno = getEntrenoCheck(fecha);
    const cardio = getCardio(fecha);

    const tipo = plan.tipo || "entrenamiento";

    const total = estructuraDias[tipo].length + 2;

    let completados = 0;

    // comidas
    Object.values(checks).forEach((v) => {
      if (v) completados++;
    });

    // entreno + cardio
    if (entreno) completados++;
    if (cardio) completados++;

    const porcentaje =
      total > 0 ? Math.round((completados / total) * 100) : 0;

    datos.push({
      fecha,
      completados,
      total,
      porcentaje,
      entreno,
      cardio
    });
  });

  // ordenar por fecha (más reciente arriba)
  datos.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

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

      <h1>Historial</h1>

<div style={{ marginTop: 15, marginBottom: 20 }}>
  <GraficoSemanal />
</div>     

      {datos.length === 0 && (
        <p style={{ color: theme.colors.subtext }}>
          No hay datos todavía
        </p>
      )}

      {datos.map((dia) => (
        <Card key={dia.fecha}>
          <div>
            <strong>{dia.fecha}</strong>

            <p style={{ margin: 0, color: theme.colors.subtext }}>
              {dia.completados} / {dia.total} completado
            </p>

            <p style={{ margin: 0 }}>
              🏋️ {dia.entreno ? "✔" : "—"} &nbsp;
              🔥 {dia.cardio ? "✔" : "—"}
            </p>
          </div>

          <div
            style={{
              fontWeight: "700",
              color:
                dia.porcentaje === 100
                  ? theme.colors.success
                  : theme.colors.text
            }}
          >
            {dia.porcentaje}%
          </div>
        </Card>
      ))}
    </div>
  );
}

export default Historial;