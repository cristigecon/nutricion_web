import { useEffect, useState } from "react";
import Card from "../components/Card";
import Section from "../components/Section";
import { defaultTrainingPlan, normalizeTrainingPlan } from "../data/entrenamientos";
import { defaultMealPlan, normalizeMealPlan } from "../data/plan";
import {
  getMealPlanRequest,
  getTrainingPlanRequest,
  updateMealPlanRequest,
  updateTrainingPlanRequest,
} from "../services/api";
import { hydrateMealPlan } from "../services/mealPlan";
import { hydrateTrainingPlan } from "../services/trainingPlan";
import { botonVolver } from "../styles/styles";
import { theme } from "../styles/theme";

const categoryTitles = {
  proteina: "Proteina",
  carbo: "Carbohidrato",
  fruta: "Fruta",
  grasa: "Grasa",
  verduras: "Verduras",
};

const categoryOrder = ["proteina", "carbo", "fruta", "grasa", "verduras"];

const planSections = {
  semana: "Lunes a viernes",
  finde: "Sabado y domingo",
};

const routineTitles = {
  inferior: "Tren inferior + abdomen",
  superior: "Tren superior",
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const baseFieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: `1px solid ${theme.colors.border}`,
  fontSize: 14,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  color: theme.colors.text,
  fontSize: 13,
  fontWeight: "600",
};

const helperTextStyle = {
  color: theme.colors.subtext,
  fontSize: 12,
  marginTop: -4,
};

const sectionChipStyle = (active) => ({
  border: "none",
  borderRadius: 999,
  padding: "10px 14px",
  backgroundColor: active ? theme.colors.primary : theme.colors.card,
  color: active ? "#fff" : theme.colors.text,
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: active ? "0 6px 18px rgba(0,122,255,0.25)" : "0 4px 12px rgba(0,0,0,0.05)",
});

const actionButtonStyle = (tone = "primary") => {
  const tones = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: "#fff",
    },
    neutral: {
      backgroundColor: "#eef2f7",
      color: theme.colors.text,
    },
    danger: {
      backgroundColor: "#fff1ef",
      color: theme.colors.danger,
    },
  };

  return {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: "700",
    cursor: "pointer",
    ...tones[tone],
  };
};

const parseLines = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const formatLines = (items = []) => items.join("\n");

const parseBlockIds = (value) =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const formatBlockIds = (items = []) => items.join(", ");

const createSlot = (fallbackBlockKey) => ({
  id: `comida_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
  hora: "",
  bloques: fallbackBlockKey ? [fallbackBlockKey] : [],
});

const createExercise = () => ({
  nombre: "",
  imagen: "/img/exercise-placeholder.svg",
  series: 4,
  reps: "15",
  cadencia: "3",
  descanso: "30",
});

const buildCleanMealPlan = (mealPlanDraft) => {
  const normalized = normalizeMealPlan(mealPlanDraft);
  const cleanPlan = clone(normalized);

  Object.keys(cleanPlan.estructuraDias).forEach((planKey) => {
    cleanPlan.estructuraDias[planKey] = (cleanPlan.estructuraDias[planKey] || []).map((slot) => ({
      id: String(slot.id || "").trim(),
      hora: String(slot.hora || "").trim(),
      bloques: (slot.bloques || [])
        .map((blockId) => String(blockId || "").trim())
        .filter(Boolean),
    }));
  });

  Object.keys(cleanPlan.bloques).forEach((blockKey) => {
    const block = cleanPlan.bloques[blockKey] || {};
    const nextBlock = {};

    categoryOrder.forEach((category) => {
      const values = Array.isArray(block[category])
        ? block[category].map((item) => String(item || "").trim()).filter(Boolean)
        : [];

      if (values.length > 0) {
        nextBlock[category] = values;
      }
    });

    cleanPlan.bloques[blockKey] = nextBlock;
  });

  return cleanPlan;
};

const buildCleanTrainingPlan = (trainingPlanDraft) => {
  const normalized = normalizeTrainingPlan(trainingPlanDraft);
  const cleanPlan = clone(normalized);

  Object.keys(cleanPlan.routines).forEach((routineKey) => {
    cleanPlan.routines[routineKey] = (cleanPlan.routines[routineKey] || []).map((exercise) => ({
      nombre: String(exercise.nombre || "").trim(),
      imagen: String(exercise.imagen || "").trim(),
      series: Number.parseInt(exercise.series, 10) || 0,
      reps: String(exercise.reps || "").trim(),
      cadencia: String(exercise.cadencia || "").trim(),
      descanso: String(exercise.descanso || "").trim(),
    }));
  });

  return cleanPlan;
};

const validateMealPlan = (mealPlanDraft) => {
  const cleanPlan = buildCleanMealPlan(mealPlanDraft);
  const blockKeys = new Set(Object.keys(cleanPlan.bloques));

  if (blockKeys.size === 0) {
    return "Necesitas al menos un bloque en el plan nutricional.";
  }

  for (const [planKey, slots] of Object.entries(cleanPlan.estructuraDias)) {
    if (!Array.isArray(slots) || slots.length === 0) {
      return `La seccion ${planSections[planKey] || planKey} necesita al menos una toma.`;
    }

    const ids = new Set();

    for (const slot of slots) {
      if (!slot.id) {
        return `Hay una toma sin identificador en ${planSections[planKey] || planKey}.`;
      }

      if (ids.has(slot.id)) {
        return `El identificador ${slot.id} esta repetido en ${planSections[planKey] || planKey}.`;
      }

      ids.add(slot.id);

      if (!slot.hora) {
        return `La toma ${slot.id} necesita una hora.`;
      }

      if (!Array.isArray(slot.bloques) || slot.bloques.length === 0) {
        return `La toma ${slot.id} necesita al menos un bloque.`;
      }

      const invalidBlock = slot.bloques.find((blockId) => !blockKeys.has(blockId));

      if (invalidBlock) {
        return `La toma ${slot.id} usa ${invalidBlock}, pero ese bloque no existe.`;
      }
    }
  }

  return "";
};

const validateTrainingPlan = (trainingPlanDraft) => {
  const cleanPlan = buildCleanTrainingPlan(trainingPlanDraft);

  for (const [routineKey, exercises] of Object.entries(cleanPlan.routines)) {
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return `La rutina ${routineTitles[routineKey] || routineKey} necesita al menos un ejercicio.`;
    }

    for (let index = 0; index < exercises.length; index += 1) {
      const exercise = exercises[index];

      if (!exercise.nombre) {
        return `El ejercicio ${index + 1} de ${routineTitles[routineKey] || routineKey} necesita nombre.`;
      }

      if (!exercise.series || exercise.series < 1) {
        return `El ejercicio ${exercise.nombre} necesita al menos una serie.`;
      }
    }
  }

  return "";
};

function StatusNote({ status }) {
  if (!status?.message) {
    return null;
  }

  const palette = status.tone === "error"
    ? {
        backgroundColor: "#fff3f1",
        color: theme.colors.danger,
      }
    : {
        backgroundColor: "#edf8ef",
        color: theme.colors.success,
      };

  return (
    <div
      style={{
        marginTop: 12,
        padding: "12px 14px",
        borderRadius: 14,
        fontWeight: "600",
        ...palette,
      }}
    >
      {status.message}
    </div>
  );
}

function Admin({ volver }) {
  const [activeTab, setActiveTab] = useState("meal");
  const [mealPlanDraft, setMealPlanDraft] = useState(() => normalizeMealPlan(defaultMealPlan));
  const [trainingPlanDraft, setTrainingPlanDraft] = useState(() =>
    normalizeTrainingPlan(defaultTrainingPlan)
  );
  const [loadingState, setLoadingState] = useState({ loading: true, error: "" });
  const [mealStatus, setMealStatus] = useState({ tone: "", message: "" });
  const [trainingStatus, setTrainingStatus] = useState({ tone: "", message: "" });
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  const [isSavingTraining, setIsSavingTraining] = useState(false);
  const [newBlockKey, setNewBlockKey] = useState("");

  useEffect(() => {
    let active = true;

    const loadPlans = async () => {
      setLoadingState({ loading: true, error: "" });

      try {
        const [mealData, trainingData] = await Promise.all([
          getMealPlanRequest(),
          getTrainingPlanRequest(),
        ]);

        if (!active) {
          return;
        }

        setMealPlanDraft(normalizeMealPlan(mealData.mealPlan));
        setTrainingPlanDraft(normalizeTrainingPlan(trainingData.trainingPlan));
        setLoadingState({ loading: false, error: "" });
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadingState({
          loading: false,
          error: error.message || "No se pudieron cargar los planes.",
        });
      }
    };

    loadPlans();

    return () => {
      active = false;
    };
  }, []);

  const updateSlot = (planKey, slotIndex, field, value) => {
    setMealPlanDraft((prev) => {
      const next = clone(prev);
      next.estructuraDias[planKey][slotIndex][field] = value;
      return next;
    });
  };

  const addSlot = (planKey) => {
    setMealPlanDraft((prev) => {
      const next = clone(prev);
      const firstBlockKey = Object.keys(next.bloques)[0] || "bloque1";
      next.estructuraDias[planKey].push(createSlot(firstBlockKey));
      return next;
    });
  };

  const removeSlot = (planKey, slotIndex) => {
    setMealPlanDraft((prev) => {
      const next = clone(prev);
      next.estructuraDias[planKey].splice(slotIndex, 1);
      return next;
    });
  };

  const updateBlockCategory = (blockKey, category, rawValue) => {
    setMealPlanDraft((prev) => {
      const next = clone(prev);
      next.bloques[blockKey][category] = parseLines(rawValue);
      return next;
    });
  };

  const addBlock = () => {
    const trimmedKey = newBlockKey.trim();

    if (!trimmedKey) {
      setMealStatus({
        tone: "error",
        message: "Escribe un identificador antes de crear un bloque nuevo.",
      });
      return;
    }

    if (mealPlanDraft.bloques[trimmedKey]) {
      setMealStatus({
        tone: "error",
        message: `El bloque ${trimmedKey} ya existe.`,
      });
      return;
    }

    setMealPlanDraft((prev) => {
      const next = clone(prev);
      next.bloques[trimmedKey] = {};
      return next;
    });
    setNewBlockKey("");
    setMealStatus({
      tone: "success",
      message: `Bloque ${trimmedKey} preparado para editar.`,
    });
  };

  const resetMealDraft = () => {
    setMealPlanDraft(normalizeMealPlan(defaultMealPlan));
    setMealStatus({
      tone: "success",
      message: "Borrador de nutricion restaurado a la plantilla base.",
    });
  };

  const saveMealPlan = async () => {
    const validationError = validateMealPlan(mealPlanDraft);

    if (validationError) {
      setMealStatus({ tone: "error", message: validationError });
      return;
    }

    setIsSavingMeal(true);
    setMealStatus({ tone: "", message: "" });

    try {
      const payload = buildCleanMealPlan(mealPlanDraft);
      const data = await updateMealPlanRequest(payload);
      const hydratedPlan = hydrateMealPlan(data.mealPlan, {
        notify: false,
        updatedAt: data.mealPlan?.updatedAt,
      });

      setMealPlanDraft(hydratedPlan);
      setMealStatus({
        tone: "success",
        message: "Plan nutricional guardado en Mongo.",
      });
    } catch (error) {
      setMealStatus({
        tone: "error",
        message: error.message || "No se pudo guardar el plan nutricional.",
      });
    } finally {
      setIsSavingMeal(false);
    }
  };

  const updateExercise = (routineKey, exerciseIndex, field, value) => {
    setTrainingPlanDraft((prev) => {
      const next = clone(prev);
      next.routines[routineKey][exerciseIndex][field] = value;
      return next;
    });
  };

  const addExercise = (routineKey) => {
    setTrainingPlanDraft((prev) => {
      const next = clone(prev);
      next.routines[routineKey].push(createExercise());
      return next;
    });
  };

  const removeExercise = (routineKey, exerciseIndex) => {
    setTrainingPlanDraft((prev) => {
      const next = clone(prev);
      next.routines[routineKey].splice(exerciseIndex, 1);
      return next;
    });
  };

  const resetTrainingDraft = () => {
    setTrainingPlanDraft(normalizeTrainingPlan(defaultTrainingPlan));
    setTrainingStatus({
      tone: "success",
      message: "Borrador de entrenamiento restaurado a la plantilla base.",
    });
  };

  const saveTrainingPlan = async () => {
    const validationError = validateTrainingPlan(trainingPlanDraft);

    if (validationError) {
      setTrainingStatus({ tone: "error", message: validationError });
      return;
    }

    setIsSavingTraining(true);
    setTrainingStatus({ tone: "", message: "" });

    try {
      const payload = buildCleanTrainingPlan(trainingPlanDraft);
      const data = await updateTrainingPlanRequest(payload);
      const hydratedPlan = hydrateTrainingPlan(data.trainingPlan, {
        notify: false,
        updatedAt: data.trainingPlan?.updatedAt,
      });

      setTrainingPlanDraft(hydratedPlan);
      setTrainingStatus({
        tone: "success",
        message: "Plan de entrenamiento guardado en Mongo.",
      });
    } catch (error) {
      setTrainingStatus({
        tone: "error",
        message: error.message || "No se pudo guardar el plan de entrenamiento.",
      });
    } finally {
      setIsSavingTraining(false);
    }
  };

  const mealBlockKeys = Object.keys(mealPlanDraft.bloques).sort((left, right) =>
    left.localeCompare(right, "es", { numeric: true })
  );

  if (loadingState.loading) {
    return (
      <div
        style={{
          padding: 20,
          backgroundColor: theme.colors.background,
          minHeight: "100vh",
        }}
      >
        <button onClick={volver} style={botonVolver}>
          {"<-"} Volver
        </button>
        <Card>
          <div style={{ color: theme.colors.subtext, fontWeight: "600" }}>
            Cargando panel de admin...
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 20,
        backgroundColor: theme.colors.background,
        minHeight: "100vh",
      }}
    >
      <button onClick={volver} style={botonVolver}>
        {"<-"} Volver
      </button>

      <h1 style={{ marginBottom: 6, color: theme.colors.text }}>Admin</h1>
      <p style={{ marginTop: 0, color: theme.colors.subtext }}>
        Desde aqui puedes editar el plan maestro que usa tu cuenta.
      </p>

      {loadingState.error ? (
        <StatusNote status={{ tone: "error", message: loadingState.error }} />
      ) : null}

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 18,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("meal")}
          style={sectionChipStyle(activeTab === "meal")}
        >
          Nutricion
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("training")}
          style={sectionChipStyle(activeTab === "training")}
        >
          Entrenamiento
        </button>
      </div>

      {activeTab === "meal" ? (
        <>
          <Section titulo="Estructura del dia">
            <p style={{ ...helperTextStyle, marginTop: 0 }}>
              Edita horas e identificadores. Si una toma admite dos bloques, separalos con comas.
            </p>

            {Object.entries(planSections).map(([planKey, title]) => (
              <div key={planKey} style={{ marginTop: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3 style={{ margin: 0 }}>{title}</h3>
                  <button
                    type="button"
                    onClick={() => addSlot(planKey)}
                    style={actionButtonStyle("neutral")}
                  >
                    + Anadir toma
                  </button>
                </div>

                {(mealPlanDraft.estructuraDias[planKey] || []).map((slot, slotIndex) => (
                  <div
                    key={`${planKey}-${slot.id}-${slotIndex}`}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      backgroundColor: "#f8f9fc",
                      marginBottom: 12,
                      display: "grid",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <label style={labelStyle}>
                        ID
                        <input
                          aria-label={`ID ${title} ${slotIndex + 1}`}
                          value={slot.id}
                          onChange={(event) => updateSlot(planKey, slotIndex, "id", event.target.value)}
                          style={baseFieldStyle}
                        />
                      </label>

                      <label style={labelStyle}>
                        Hora
                        <input
                          aria-label={`Hora ${title} ${slotIndex + 1}`}
                          value={slot.hora}
                          onChange={(event) => updateSlot(planKey, slotIndex, "hora", event.target.value)}
                          style={baseFieldStyle}
                          placeholder="06:30"
                        />
                      </label>
                    </div>

                    <label style={labelStyle}>
                      Bloques
                      <input
                        aria-label={`Bloques ${title} ${slotIndex + 1}`}
                        value={formatBlockIds(slot.bloques)}
                        onChange={(event) =>
                          updateSlot(planKey, slotIndex, "bloques", parseBlockIds(event.target.value))
                        }
                        style={baseFieldStyle}
                        placeholder="bloque1, bloque2"
                      />
                    </label>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => removeSlot(planKey, slotIndex)}
                        style={actionButtonStyle("danger")}
                      >
                        Eliminar toma
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </Section>

          <Section titulo="Bloques">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
                marginBottom: 16,
                alignItems: "end",
              }}
            >
              <label style={labelStyle}>
                Nuevo bloque
                <input
                  aria-label="Nuevo bloque"
                  value={newBlockKey}
                  onChange={(event) => setNewBlockKey(event.target.value)}
                  style={baseFieldStyle}
                  placeholder="bloque6"
                />
              </label>

              <button type="button" onClick={addBlock} style={actionButtonStyle("neutral")}>
                Crear bloque
              </button>
            </div>

            {mealBlockKeys.map((blockKey) => (
              <div
                key={blockKey}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: 14 }}>{blockKey}</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 12,
                  }}
                >
                  {categoryOrder.map((category) => (
                    <label key={`${blockKey}-${category}`} style={labelStyle}>
                      {categoryTitles[category]}
                      <textarea
                        aria-label={`${blockKey} ${categoryTitles[category]}`}
                        value={formatLines(mealPlanDraft.bloques[blockKey]?.[category] || [])}
                        onChange={(event) => updateBlockCategory(blockKey, category, event.target.value)}
                        style={{
                          ...baseFieldStyle,
                          minHeight: 140,
                          resize: "vertical",
                        }}
                        placeholder="Una opcion por linea"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </Section>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={resetMealDraft} style={actionButtonStyle("neutral")}>
              Restaurar plantilla
            </button>
            <button
              type="button"
              onClick={saveMealPlan}
              disabled={isSavingMeal}
              style={{
                ...actionButtonStyle("primary"),
                opacity: isSavingMeal ? 0.7 : 1,
                cursor: isSavingMeal ? "default" : "pointer",
              }}
            >
              {isSavingMeal ? "Guardando..." : "Guardar plan nutricional"}
            </button>
          </div>

          <StatusNote status={mealStatus} />
        </>
      ) : (
        <>
          {Object.entries(routineTitles).map(([routineKey, title]) => (
            <Section key={routineKey} titulo={title}>
              {(trainingPlanDraft.routines[routineKey] || []).map((exercise, exerciseIndex) => (
                <div
                  key={`${routineKey}-${exerciseIndex}`}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: `1px solid ${theme.colors.border}`,
                    marginBottom: 14,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>Ejercicio {exerciseIndex + 1}</strong>
                    <button
                      type="button"
                      onClick={() => removeExercise(routineKey, exerciseIndex)}
                      style={actionButtonStyle("danger")}
                    >
                      Eliminar
                    </button>
                  </div>

                  <label style={labelStyle}>
                    Nombre
                    <input
                      aria-label={`Nombre ${title} ${exerciseIndex + 1}`}
                      value={exercise.nombre}
                      onChange={(event) =>
                        updateExercise(routineKey, exerciseIndex, "nombre", event.target.value)
                      }
                      style={baseFieldStyle}
                    />
                  </label>

                  <label style={labelStyle}>
                    Imagen
                    <input
                      aria-label={`Imagen ${title} ${exerciseIndex + 1}`}
                      value={exercise.imagen || ""}
                      onChange={(event) =>
                        updateExercise(routineKey, exerciseIndex, "imagen", event.target.value)
                      }
                      style={baseFieldStyle}
                      placeholder="/img/mi-ejercicio.png"
                    />
                  </label>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 12,
                    }}
                  >
                    <label style={labelStyle}>
                      Series
                      <input
                        aria-label={`Series ${title} ${exerciseIndex + 1}`}
                        type="number"
                        min="1"
                        value={exercise.series}
                        onChange={(event) =>
                          updateExercise(routineKey, exerciseIndex, "series", event.target.value)
                        }
                        style={baseFieldStyle}
                      />
                    </label>

                    <label style={labelStyle}>
                      Reps
                      <input
                        aria-label={`Reps ${title} ${exerciseIndex + 1}`}
                        value={exercise.reps}
                        onChange={(event) =>
                          updateExercise(routineKey, exerciseIndex, "reps", event.target.value)
                        }
                        style={baseFieldStyle}
                      />
                    </label>

                    <label style={labelStyle}>
                      Cadencia
                      <input
                        aria-label={`Cadencia ${title} ${exerciseIndex + 1}`}
                        value={exercise.cadencia}
                        onChange={(event) =>
                          updateExercise(routineKey, exerciseIndex, "cadencia", event.target.value)
                        }
                        style={baseFieldStyle}
                      />
                    </label>

                    <label style={labelStyle}>
                      Descanso
                      <input
                        aria-label={`Descanso ${title} ${exerciseIndex + 1}`}
                        value={exercise.descanso}
                        onChange={(event) =>
                          updateExercise(routineKey, exerciseIndex, "descanso", event.target.value)
                        }
                        style={baseFieldStyle}
                      />
                    </label>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addExercise(routineKey)}
                style={actionButtonStyle("neutral")}
              >
                + Anadir ejercicio
              </button>
            </Section>
          ))}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={resetTrainingDraft} style={actionButtonStyle("neutral")}>
              Restaurar plantilla
            </button>
            <button
              type="button"
              onClick={saveTrainingPlan}
              disabled={isSavingTraining}
              style={{
                ...actionButtonStyle("primary"),
                opacity: isSavingTraining ? 0.7 : 1,
                cursor: isSavingTraining ? "default" : "pointer",
              }}
            >
              {isSavingTraining ? "Guardando..." : "Guardar plan de entrenamiento"}
            </button>
          </div>

          <StatusNote status={trainingStatus} />
        </>
      )}
    </div>
  );
}

export default Admin;
