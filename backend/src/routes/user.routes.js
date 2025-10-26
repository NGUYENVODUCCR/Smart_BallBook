import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", authMiddleware, permit("Admin"), getAllUsers);
router.get("/:id", authMiddleware, permit("Admin"), getUserById);
router.put("/:id", authMiddleware, permit("Admin"), updateUser);
router.delete("/:id", authMiddleware, permit("Admin"), deleteUser);
router.patch("/:id/toggle", authMiddleware, permit("Admin"), toggleUserStatus);

export default router;
