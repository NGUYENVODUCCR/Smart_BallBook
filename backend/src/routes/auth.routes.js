import express from "express";
import {
  register,
  login,
  googleSignIn,
  profile,
  refreshToken,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import verifyToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleSignIn);
router.get("/profile", verifyToken, profile);
router.post("/refresh", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
