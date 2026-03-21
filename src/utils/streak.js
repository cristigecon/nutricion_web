export function calcularStreak() {
  const hoy = new Date();

  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(hoy.getDate() - i);

    const fecha = d.toISOString().split("T")[0];

    const checks = JSON.parse(
      localStorage.getItem("checks_" + fecha)
    ) || {};

    const entreno = JSON.parse(
      localStorage.getItem("entreno_check_" + fecha)
    );

    const cardio = JSON.parse(
      localStorage.getItem("cardio_" + fecha)
    );

    const comidasOk =
      Object.values(checks).length > 0 &&
      Object.values(checks).every(Boolean);

    if (comidasOk && entreno && cardio) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}