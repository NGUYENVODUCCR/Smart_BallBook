import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";
import {
  getFieldReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/field/:fieldId", getFieldReviews);
router.post("/", authMiddleware, createReview);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
