import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createDay,
  getDays,
  getMealPlan,
  getTrainingPlan,
  getWeeklyPlan,
  updateDay,
  upsertMealPlan,
  upsertTrainingPlan,
  upsertWeeklyPlan,
} from "../controllers/dataController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/days", getDays);
router.post("/days", createDay);
router.put("/days/:id", updateDay);
router.get("/meal-plan", getMealPlan);
router.put("/meal-plan", upsertMealPlan);
router.get("/training-plan", getTrainingPlan);
router.put("/training-plan", upsertTrainingPlan);
router.get("/weekly-plan", getWeeklyPlan);
router.put("/weekly-plan", upsertWeeklyPlan);

export default router;
