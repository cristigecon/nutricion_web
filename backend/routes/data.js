import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  createDay,
  getDays,
  getWeeklyPlan,
  updateDay,
  upsertWeeklyPlan,
} from "../controllers/dataController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/days", getDays);
router.post("/days", createDay);
router.put("/days/:id", updateDay);
router.get("/weekly-plan", getWeeklyPlan);
router.put("/weekly-plan", upsertWeeklyPlan);

export default router;
