import express from "express";
import {
  getAllBookings,
  getMyBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);
router.delete("/:id", verifyToken, cancelBooking);

router.get("/", verifyToken, permit("Admin", "Manager"), getAllBookings);
router.put("/:id/status", verifyToken, permit("Admin", "Manager"), updateBookingStatus);

export default router;
