import { theme } from "../styles/theme";

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
    const plan = JSON.parse(
      localStorage.getItem("plan_" + d.fecha)
    ) || {};

    const checks = JSON.parse(
      localStorage.getItem("checks_" + d.fecha)
    ) || {};

    const entreno = JSON.parse(
      localStorage.getItem("entreno_check_" + d.fecha)
    );

    const cardio = JSON.parse(
      localStorage.getItem("cardio_" + d.fecha)
    );

    const total = 6; // aprox (comidas + entreno + cardio)

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