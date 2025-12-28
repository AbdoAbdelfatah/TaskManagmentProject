import { Router } from "express";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from "./auth.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;
