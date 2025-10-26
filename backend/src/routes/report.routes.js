import express from "express";
import {
  getRevenueByDay,
  getRevenueByMonth,
  getDailyChart,
} from "../controllers/report.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/day", verifyToken, permit("Admin"), getRevenueByDay);
router.get("/month", verifyToken, permit("Admin"), getRevenueByMonth);
router.get("/chart", verifyToken, permit("Admin"), getDailyChart);

export default router;
