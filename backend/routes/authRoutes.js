// backend/routes/authRoutes.js
import express from "express";
import { signup, login } from "../controllers/authController.js";

const router = express.Router();

// POST /api/auth/signup → Signup user and return token
router.post("/signup", signup);

// POST /api/auth/login → Login user and return token
router.post("/login", login);

export default router;
