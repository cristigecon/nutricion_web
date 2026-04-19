import {
  defaultMealPlan,
  getBloqueLabel,
  getEstructuraDiaFromMealPlan,
  getPlanTypeForDate,
  getSlotLabel,
  normalizeMealPlan,
} from "../data/plan";
import { getMealPlanDefinition, saveMealPlanDefinition } from "./storage";

export const getMealPlan = () => {
  return normalizeMealPlan(getMealPlanDefinition() || defaultMealPlan);
};

export const hydrateMealPlan = (mealPlan, options = {}) => {
  const normalizedPlan = normalizeMealPlan(mealPlan);
  saveMealPlanDefinition(normalizedPlan, options);
  return normalizedPlan;
};

export const getEstructuraDia = (dateString) => {
  return getEstructuraDiaFromMealPlan(dateString, getMealPlan());
};

export const getBloques = () => {
  return getMealPlan().bloques;
};

export { getBloqueLabel, getPlanTypeForDate, getSlotLabel };
