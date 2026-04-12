import express from "express";
import { register, login, me } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("AUTH OK");
});

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);

export default router;