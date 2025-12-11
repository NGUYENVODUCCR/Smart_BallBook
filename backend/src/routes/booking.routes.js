import express from "express";
import {
  getAllBookings,
  getMyBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingByField,
  payBooking,
  deleteBookingsOfField,
  deleteBookingsOfUser,
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Quản lý booking sân bóng
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Tạo booking mới
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - field_id
 *               - date
 *               - start_time
 *               - end_time
 *             properties:
 *               field_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-12"
 *               start_time:
 *                 type: string
 *                 example: "08:00"
 *               end_time:
 *                 type: string
 *                 example: "10:00"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Missing fields or time slot conflict
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, createBooking);

/**
 * @swagger
 * /api/bookings/my:
 *   get:
 *     summary: Lấy tất cả booking của user hiện tại
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách booking
 *       500:
 *         description: Server error
 */
router.get("/my", verifyToken, getMyBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Hủy booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, cancelBooking);

/**
 * @swagger
 * /api/bookings/{id}/pay:
 *   put:
 *     summary: Thanh toán booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Booking already paid
 *       404:
 *         description: Booking or Field not found
 *       500:
 *         description: Server error
 */
router.put("/:id/pay", verifyToken, payBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Lấy tất cả booking (Admin/Manager)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tất cả booking
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, permit("Admin", "Manager"), getAllBookings);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái booking (Admin/Manager)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled]
 *                 example: "paid"
 *     responses:
 *       200:
 *         description: Booking status updated
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put("/:id/status", verifyToken, permit("Admin", "Manager"), updateBookingStatus);

/**
 * @swagger
 * /api/bookings/field/{fieldId}:
 *   get:
 *     summary: Lấy booking theo field (Admin/Manager)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fieldId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Booking theo field
 *       404:
 *         description: Không có booking active
 *       500:
 *         description: Server error
 */
router.get("/field/:fieldId", verifyToken, permit("Admin", "Manager"), getBookingByField);

/**
 * @swagger
 * /api/bookings/delete/field/{fieldId}:
 *   delete:
 *     summary: Xóa tất cả booking của một field + trả sân về trống (Admin/Manager)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fieldId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All bookings deleted for field
 *       500:
 *         description: Server error
 */
router.delete("/delete/field/:fieldId", verifyToken, permit("Admin", "Manager"), deleteBookingsOfField);

/**
 * @swagger
 * /api/bookings/delete/user/{userId}:
 *   delete:
 *     summary: Xóa tất cả booking của một user + trả sân về trống (Admin/Manager)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All bookings deleted for user
 *       500:
 *         description: Server error
 */
router.delete("/delete/user/:userId", verifyToken, permit("Admin", "Manager"), deleteBookingsOfUser);

export default router;
