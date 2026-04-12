import { theme } from "../styles/theme";
import { getDay, getMealChecks, getEntrenoCheck, getCardio } from "../services/storage";

function getUltimos7Dias() {
  const dias = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    dias.push({
      fecha: d.toISOString().split("T")[0],
      nombre: d.toLocaleDateString("es-ES", { weekday: "short" })
    });
  }

  return dias;
}

function GraficoSemanal() {
  const dias = getUltimos7Dias();

  const data = dias.map((d) => {
    const day = getDay(d.fecha) || {};

    const checks = getMealChecks(d.fecha) || {};

    const entreno = getEntrenoCheck(d.fecha);

    const cardio = getCardio(d.fecha);

    const total = day.tipo === "descanso" ? 4 : 6;

    let completados = 0;

    Object.values(checks).forEach((v) => {
      if (v) completados++;
    });

    if (entreno) completados++;
    if (cardio) completados++;

    const porcentaje =
      total > 0 ? (completados / total) * 100 : 0;

    return {
      ...d,
      porcentaje
    };
  });

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 20,
        padding: 10,
        backgroundColor: theme.colors.card,
        borderRadius: 16
      }}
    >
      {data.map((d) => (
        <div
          key={d.fecha}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1
          }}
        >
          {/* BARRA */}
          <div
            style={{
              width: 10,
              height: Math.max(d.porcentaje, 5),
              backgroundColor:
                d.porcentaje === 100
                  ? theme.colors.success
                  : theme.colors.primary,
              borderRadius: 10,
              transition: "0.3s"
            }}
          />

          {/* DIA */}
          <span
            style={{
              fontSize: 10,
              marginTop: 5,
              color: theme.colors.subtext
            }}
          >
            {d.nombre}
          </span>
        </div>
      ))}
    </div>
  );
}

export default GraficoSemanal;
