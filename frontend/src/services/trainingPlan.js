import { defaultTrainingPlan, normalizeTrainingPlan } from "../data/entrenamientos";
import { getTrainingPlanDefinition, saveTrainingPlanDefinition } from "./storage";

const clone = (value) => JSON.parse(JSON.stringify(value));

export const getTrainingPlan = () => {
  return normalizeTrainingPlan(getTrainingPlanDefinition() || defaultTrainingPlan);
};

export const hydrateTrainingPlan = (trainingPlan, options = {}) => {
  const normalizedPlan = normalizeTrainingPlan(trainingPlan);
  saveTrainingPlanDefinition(normalizedPlan, options);
  return normalizedPlan;
};

export const getTrainingRoutines = () => {
  return getTrainingPlan().routines;
};

export const formatRoutineForWorkout = (routine = []) => {
  return clone(routine).map((exercise) => ({
    nombre: exercise.nombre,
    imagen: exercise.imagen || "",
    cadencia: exercise.cadencia || "",
    descanso: exercise.descanso || "",
    series: Array.from({ length: Number(exercise.series) || 0 }).map(() => ({
      reps: exercise.reps ?? "",
      peso: "",
    })),
  }));
};
