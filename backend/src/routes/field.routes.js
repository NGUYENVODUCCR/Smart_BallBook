import express from "express";
import {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
} from "../controllers/field.controller.js";

import verifyToken from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/", getAllFields);
router.get("/:id", getFieldById);

router.post("/", verifyToken, permit("Admin", "Manager"), createField);
router.put("/:id", verifyToken, permit("Admin", "Manager"), updateField);
router.delete("/:id", verifyToken, permit("Admin", "Manager"), deleteField);

export default router;
