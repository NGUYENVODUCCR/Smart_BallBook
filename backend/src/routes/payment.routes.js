import express from "express";
import { createPayment, vnpayReturn } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, createPayment);
router.get("/vnpay_return", vnpayReturn);

export default router;
