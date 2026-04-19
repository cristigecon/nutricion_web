import { useState, useEffect } from "react";
import {
  getBloqueLabel,
  getEstructuraDia,
  getPlanTypeForDate,
  getSlotLabel,
  getBloques,
} from "../services/mealPlan";
import Bloque from "../components/Bloque";
import CheckCircle from "../components/CheckCircle";
import Card from "../components/Card";
import BotonGuardar from "../components/BotonGuardar";
import { botonVolver } from "../styles/styles";
import {
  getDay,
  getMealChecks,
  saveMealChecks,
  saveDay,
} from "../services/storage";

const categoryTitles = {
  proteina: "Proteina",
  carbo: "Carbohidrato",
  fruta: "Fruta",
  grasa: "Grasa",
  verduras: "Verduras",
};

const categoryOrder = ["proteina", "carbo", "fruta", "grasa", "verduras"];

function getFechaHoy() {
  const hoy = new Date();
  return hoy.toISOString().split("T")[0];
}

const normalizeLegacyChecks = (savedChecks, estructura) => {
  if (!savedChecks || typeof savedChecks !== "object") {
    return {};
  }

  const usesSlotIds = estructura.some((slot) =>
    Object.prototype.hasOwnProperty.call(savedChecks, slot.id)
  );

  if (usesSlotIds) {
    return savedChecks;
  }

  const nextChecks = {};

  estructura.forEach((slot) => {
    const matchedLegacyBlock = slot.bloques.find((bloque) =>
      Object.prototype.hasOwnProperty.call(savedChecks, bloque)
    );

    if (matchedLegacyBlock) {
      nextChecks[slot.id] = savedChecks[matchedLegacyBlock];
    }
  });

  return nextChecks;
};

const normalizeLegacySelections = (savedSelections, estructura) => {
  if (!savedSelections || typeof savedSelections !== "object") {
    return {};
  }

  const usesSlotIds = estructura.some((slot) =>
    Object.prototype.hasOwnProperty.call(savedSelections, slot.id)
  );

  if (usesSlotIds) {
    return savedSelections;
  }

  const nextSelections = {};

  estructura.forEach((slot) => {
    const matchedLegacyBlock = slot.bloques.find((bloque) => savedSelections[bloque]);

    if (matchedLegacyBlock) {
      nextSelections[slot.id] = {
        bloqueSeleccionado: matchedLegacyBlock,
        ...savedSelections[matchedLegacyBlock],
      };
    }
  });

  return nextSelections;
};

function PlanDia({ volver }) {
  const fecha = getFechaHoy();
  const estructura = getEstructuraDia(fecha);
  const tipo = getPlanTypeForDate(fecha);
  const bloques = getBloques();

  const [abiertos, setAbiertos] = useState({});
  const [selecciones, setSelecciones] = useState({});
  const [checks, setChecks] = useState({});

  useEffect(() => {
    const dayGuardado = getDay(fecha) || {};
    const checksGuardados = getMealChecks(fecha);

    setSelecciones(normalizeLegacySelections(dayGuardado.selecciones, estructura));
    setChecks(normalizeLegacyChecks(checksGuardados, estructura));
  }, [estructura, fecha]);

  const toggleCheck = (slotId) => {
    const nuevos = {
      ...checks,
      [slotId]: !checks[slotId],
    };

    setChecks(nuevos);
    saveMealChecks(fecha, nuevos);
  };

  const toggleBloque = (slotId) => {
    setAbiertos((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  const actualizarBloqueSeleccionado = (slotId, bloqueSeleccionado) => {
    setSelecciones((prev) => ({
      ...prev,
      [slotId]: { bloqueSeleccionado },
    }));
  };

  const actualizarSeleccion = (slotId, bloqueSeleccionado, categoria, valor) => {
    setSelecciones((prev) => ({
      ...prev,
      [slotId]: {
        ...prev[slotId],
        bloqueSeleccionado,
        [categoria]: valor,
      },
    }));
  };

  const guardar = () => {
    saveDay(fecha, { tipo, selecciones });
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

      <h1>Plan del dia</h1>

      {estructura.map((slot) => {
        const abierto = abiertos[slot.id];
        const slotSelection = selecciones[slot.id] || {};
        const bloqueSeleccionado = slot.bloques.includes(slotSelection.bloqueSeleccionado)
          ? slotSelection.bloqueSeleccionado
          : slot.bloques[0];
        const datosBloque = bloques[bloqueSeleccionado];

        return (
          <div key={slot.id} style={{ marginTop: 15 }}>
            <Card onClick={() => toggleBloque(slot.id)}>
              <span>
                {getSlotLabel(slot)} ({slot.hora})
              </span>

              <CheckCircle
                checked={Boolean(checks[slot.id])}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleCheck(slot.id);
                }}
              />
            </Card>

            {abierto && (
              <div style={{ marginTop: 10 }}>
                {slot.bloques.length > 1 ? (
                  <Bloque
                    titulo="Elegir bloque"
                    opciones={slot.bloques.map((bloque) => ({
                      label: getBloqueLabel(bloque),
                      value: bloque,
                    }))}
                    valor={bloqueSeleccionado}
                    setValor={(value) => actualizarBloqueSeleccionado(slot.id, value)}
                  />
                ) : null}

                {categoryOrder.map((categoria) => {
                  if (!datosBloque?.[categoria]) {
                    return null;
                  }

                  return (
                    <Bloque
                      key={`${slot.id}-${categoria}`}
                      titulo={categoryTitles[categoria]}
                      opciones={datosBloque[categoria]}
                      valor={slotSelection[categoria]}
                      setValor={(value) =>
                        actualizarSeleccion(slot.id, bloqueSeleccionado, categoria, value)
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <BotonGuardar onClick={guardar} />
    </div>
  );
}

export default PlanDia;
