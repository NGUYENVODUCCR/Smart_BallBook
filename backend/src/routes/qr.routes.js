import express from "express";
import {
  createQRForBooking,
  scanQR,
  getQRByBooking,
} from "../controllers/qr.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: QR
 *   description: Quản lý QR check-in
 */

/**
 * @swagger
 * /api/qr/{bookingId}/create:
 *   post:
 *     summary: Tạo QR code cho booking đã confirmed (Admin/Manager)
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của booking
 *     responses:
 *       201:
 *         description: QR code được tạo thành công
 *       400:
 *         description: Booking chưa confirmed hoặc QR đã tồn tại
 *       404:
 *         description: Booking không tồn tại
 *       500:
 *         description: Server error
 */
router.post("/:bookingId/create", verifyToken, permit("Admin", "Manager"), createQRForBooking);

/**
 * @swagger
 * /api/qr/scan:
 *   post:
 *     summary: Check-in bằng QR code (User)
 *     tags: [QR]
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
 *         description: Check-in thành công
 *       400:
 *         description: Thiếu bookingId hoặc đã check-in
 *       404:
 *         description: QR không tồn tại
 *       500:
 *         description: Server error
 */
router.post("/scan", verifyToken, scanQR);

/**
 * @swagger
 * /api/qr/{bookingId}:
 *   get:
 *     summary: Lấy QR code theo booking (User/Admin/Manager)
 *     tags: [QR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của booking
 *     responses:
 *       200:
 *         description: Trả về QR code
 *       400:
 *         description: Thiếu bookingId
 *       404:
 *         description: QR không tồn tại
 *       500:
 *         description: Server error
 */
router.get("/:bookingId", verifyToken, getQRByBooking);

export default router;
