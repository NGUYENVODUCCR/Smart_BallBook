import express from "express";
import {
  createQRForBooking,
  scanQR,
  getQRByBooking,
} from "../controllers/qr.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/:bookingId/create", verifyToken, permit("Admin", "Manager"), createQRForBooking);

router.post("/scan", verifyToken, scanQR);
router.get("/:bookingId", verifyToken, getQRByBooking);

export default router;
