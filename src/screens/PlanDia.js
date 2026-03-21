import { useState, useEffect } from "react";
import { bloques, estructuraDias } from "../data/plan";
import Bloque from "../components/Bloque";
import CheckCircle from "../components/CheckCircle";
import Card from "../components/Card";
import BotonGuardar from "../components/BotonGuardar";

import { botonVolver } from "../styles/styles";

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

function PlanDia({ volver }) {
  const fecha = getFechaHoy();

  const diaSemana = new Date(fecha)
    .toLocaleDateString("es-ES", { weekday: "long" });

  const agenda = JSON.parse(
    localStorage.getItem("agenda_entreno")
  ) || {};

  const datosDia = agenda[diaSemana] || {};

  const hayEntreno =
    datosDia.entreno && datosDia.entreno !== "descanso";

  const [tipo, setTipo] = useState(
    hayEntreno ? "entrenamiento" : "descanso"
  );

  const [abiertos, setAbiertos] = useState({});
  const [selecciones, setSelecciones] = useState({});
  const [checks, setChecks] = useState({});

  useEffect(() => {
    const checksGuardados = JSON.parse(
      localStorage.getItem("checks_" + fecha)
    );

    if (checksGuardados) {
      setChecks(checksGuardados);
    }
  }, []);

  const toggleCheck = (bloque) => {
    const nuevos = {
      ...checks,
      [bloque]: !checks[bloque]
    };

    setChecks(nuevos);

    localStorage.setItem(
      "checks_" + fecha,
      JSON.stringify(nuevos)
    );
  };

  const toggleBloque = (nombre, index) => {
    const key = nombre + index;

    setAbiertos((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const actualizar = (bloque, categoria, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [bloque]: {
        ...prev[bloque],
        [categoria]: valor
      }
    }));
  };

  const guardar = () => {
    localStorage.setItem(
      "plan_" + fecha,
      JSON.stringify({ tipo, selecciones })
    );
  };

  return (
    <div style={{
      padding: 20,
      backgroundColor: "#f2f2f7",
      minHeight: "100vh"
    }}>
      {/* VOLVER */}
      <button onClick={volver} style={botonVolver}>
        ← Volver
      </button>

      <h1>Plan del día</h1>

      {estructuraDias[tipo].map((item, index) => {
        const datos = bloques[item.nombre];
        const key = item.nombre + index;
        const abierto = abiertos[key];

        return (
          <div key={index} style={{ marginTop: 15 }}>
            
            {/* HEADER BLOQUE */}
            <Card onClick={() => toggleBloque(item.nombre, index)}>
              <span>
                {item.nombre} ({item.hora})
              </span>

              <CheckCircle
                checked={checks[item.nombre]}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCheck(item.nombre);
                }}
              />
            </Card>

            {/* CONTENIDO */}
            {abierto && (
              <div style={{ marginTop: 10 }}>
                {datos.proteina && (
                  <Bloque
                    titulo="Proteína"
                    opciones={datos.proteina}
                    valor={selecciones[item.nombre]?.proteina}
                    setValor={(v) =>
                      actualizar(item.nombre, "proteina", v)
                    }
                  />
                )}

                {datos.carbo && (
                  <Bloque
                    titulo="Carbohidrato"
                    opciones={datos.carbo}
                    valor={selecciones[item.nombre]?.carbo}
                    setValor={(v) =>
                      actualizar(item.nombre, "carbo", v)
                    }
                  />
                )}

                {datos.grasa && (
                  <Bloque
                    titulo="Grasa"
                    opciones={datos.grasa}
                    valor={selecciones[item.nombre]?.grasa}
                    setValor={(v) =>
                      actualizar(item.nombre, "grasa", v)
                    }
                  />
                )}

                {datos.extra && (
                  <Bloque
                    titulo="Verduras"
                    opciones={datos.extra}
                    valor={selecciones[item.nombre]?.extra}
                    setValor={(v) =>
                      actualizar(item.nombre, "verduras", v)
                    }
                  />
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* GUARDAR */}
      <BotonGuardar onClick={guardar} />
    </div>
  );
}

export default PlanDia;