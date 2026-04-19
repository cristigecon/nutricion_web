import Day from "../models/Day.js";
import MealPlan from "../models/MealPlan.js";
import TrainingPlan from "../models/TrainingPlan.js";
import WeeklyPlan from "../models/WeeklyPlan.js";
import { cloneDefaultMealPlan } from "../data/defaultMealPlan.js";
import { cloneDefaultTrainingPlan } from "../data/defaultTrainingPlan.js";
import asyncHandler from "../utils/asyncHandler.js";

const normalizeDayPayload = (body = {}) => {
  return {
    date: body.date,
    tipo: body.tipo ?? "entrenamiento",
    selecciones: body.selecciones ?? {},
    mealChecks: body.mealChecks ?? {},
    workout: body.workout ?? [],
    cardio: body.cardio ?? false,
    entrenoCheck: body.entrenoCheck ?? false,
    meals: body.meals ?? {},
    progress: body.progress ?? 0,
    isPerfectDay: body.isPerfectDay ?? false,
  };
};

const normalizeMealPlanPayload = (body = {}) => {
  const fallback = cloneDefaultMealPlan();

  return {
    estructuraDias: body.estructuraDias ?? fallback.estructuraDias,
    bloques: body.bloques ?? fallback.bloques,
  };
};

const normalizeTrainingPlanPayload = (body = {}) => {
  const fallback = cloneDefaultTrainingPlan();

  return {
    routines: body.routines ?? fallback.routines,
  };
};

export const getDays = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (date) {
    const day = await Day.findOne({ user: req.user._id, date });

    if (!day) {
      return res.status(404).json({ message: "Dia no encontrado" });
    }

    return res.json({ day });
  }

  const days = await Day.find({ user: req.user._id }).sort({ date: -1 });
  return res.json({ days });
});

export const createDay = asyncHandler(async (req, res) => {
  if (!req.body?.date) {
    return res.status(400).json({ message: "date es obligatorio" });
  }

  const existingDay = await Day.findOne({
    user: req.user._id,
    date: req.body.date,
  });

  if (existingDay) {
    return res.status(409).json({
      message: "Ya existe un dia para esa fecha",
      day: existingDay,
    });
  }

  const day = await Day.create({
    user: req.user._id,
    ...normalizeDayPayload(req.body),
  });

  return res.status(201).json({ day });
});

export const updateDay = asyncHandler(async (req, res) => {
  const day = await Day.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!day) {
    return res.status(404).json({ message: "Dia no encontrado" });
  }

  const payload = normalizeDayPayload({
    ...day.toObject(),
    ...req.body,
    date: req.body?.date ?? day.date,
  });

  Object.assign(day, payload);
  await day.save();

  return res.json({ day });
});

export const getWeeklyPlan = asyncHandler(async (req, res) => {
  const weeklyPlan = await WeeklyPlan.findOne({ user: req.user._id });

  if (!weeklyPlan) {
    return res.json({
      weeklyPlan: {
        user: req.user._id,
        days: {},
      },
    });
  }

  return res.json({ weeklyPlan });
});

export const getMealPlan = asyncHandler(async (req, res) => {
  let mealPlan = await MealPlan.findOne({ user: req.user._id });

  if (!mealPlan) {
    mealPlan = await MealPlan.create({
      user: req.user._id,
      ...cloneDefaultMealPlan(),
    });
  }

  return res.json({ mealPlan });
});

export const getTrainingPlan = asyncHandler(async (req, res) => {
  let trainingPlan = await TrainingPlan.findOne({ user: req.user._id });

  if (!trainingPlan) {
    trainingPlan = await TrainingPlan.create({
      user: req.user._id,
      ...cloneDefaultTrainingPlan(),
    });
  }

  return res.json({ trainingPlan });
});

export const upsertWeeklyPlan = asyncHandler(async (req, res) => {
  const days = req.body?.days ?? {};

  const weeklyPlan = await WeeklyPlan.findOneAndUpdate(
    { user: req.user._id },
    { user: req.user._id, days },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.json({ weeklyPlan });
});

export const upsertMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      ...normalizeMealPlanPayload(req.body),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.json({ mealPlan });
});

export const upsertTrainingPlan = asyncHandler(async (req, res) => {
  const trainingPlan = await TrainingPlan.findOneAndUpdate(
    { user: req.user._id },
    {
      user: req.user._id,
      ...normalizeTrainingPlanPayload(req.body),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.json({ trainingPlan });
});
