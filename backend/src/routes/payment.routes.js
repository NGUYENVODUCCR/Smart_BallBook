import express from "express";
import { createPayment, vnpayReturn } from "../controllers/payment.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Thanh toán VNPay
 */

/**
 * @swagger
 * /api/payment/create:
 *   post:
 *     summary: Tạo link thanh toán VNPay cho booking (User)
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Trả về URL thanh toán VNPay
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentUrl:
 *                   type: string
 *                   example: "https://sandbox.vnpayment.vn/payment/..."
 *       400:
 *         description: Missing bookingId hoặc booking không hợp lệ
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.post("/create", verifyToken, createPayment);

/**
 * @swagger
 * /api/payment/vnpay_return:
 *   get:
 *     summary: VNPay redirect về sau thanh toán
 *     tags: [Payment]
 *     parameters:
 *       - name: vnp_Amount
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: vnp_BankCode
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: vnp_OrderInfo
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: vnp_ResponseCode
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: vnp_TransactionNo
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirect về frontend thành công hoặc thất bại
 *       400:
 *         description: Invalid signature hoặc invalid booking info
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get("/vnpay_return", vnpayReturn);

export default router;
