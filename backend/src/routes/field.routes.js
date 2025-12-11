import express from "express";
import {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  updateFieldStatus,
  searchFieldByAI,
  resetFieldStatus, 
} from "../controllers/field.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Field
 *   description: Quản lý sân bóng
 */

/**
 * @swagger
 * /api/fields:
 *   get:
 *     summary: Lấy tất cả sân
 *     tags: [Field]
 *     responses:
 *       200:
 *         description: Danh sách tất cả sân
 *       500:
 *         description: Server error
 */
router.get("/", getAllFields);

/**
 * @swagger
 * /api/fields/search:
 *   get:
 *     summary: Tìm sân bằng AI NLP
 *     tags: [Field]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Chuỗi tìm kiếm (tên sân, địa điểm, giá)
 *         schema:
 *           type: string
 *           example: "sân 500k quận 1"
 *     responses:
 *       200:
 *         description: Danh sách sân khớp với AI NLP
 *       400:
 *         description: Missing query text
 *       500:
 *         description: Server error
 */
router.get("/search", searchFieldByAI);

/**
 * @swagger
 * /api/fields/{id}:
 *   get:
 *     summary: Lấy thông tin sân theo ID
 *     tags: [Field]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Thông tin sân
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getFieldById);

/**
 * @swagger
 * /api/fields:
 *   post:
 *     summary: Tạo sân mới (Admin/Manager)
 *     tags: [Field]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - price_per_hour
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sân A"
 *               location:
 *                 type: string
 *                 example: "Quận 1"
 *               price_per_hour:
 *                 type: number
 *                 example: 500000
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               description:
 *                 type: string
 *                 example: "Sân mới, sạch đẹp"
 *     responses:
 *       201:
 *         description: Field created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, permit("Admin", "Manager"), createField);

/**
 * @swagger
 * /api/fields/{id}:
 *   put:
 *     summary: Cập nhật thông tin sân (Admin/Manager)
 *     tags: [Field]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               price_per_hour:
 *                 type: number
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Field updated successfully
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, permit("Admin", "Manager"), updateField);

/**
 * @swagger
 * /api/fields/{id}:
 *   delete:
 *     summary: Xóa sân (Admin/Manager)
 *     tags: [Field]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Field deleted successfully
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, permit("Admin", "Manager"), deleteField);

/**
 * @swagger
 * /api/fields/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái sân (Admin/Manager)
 *     tags: [Field]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
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
 *                 enum: [trống, đã thuê]
 *                 example: "trống"
 *     responses:
 *       200:
 *         description: Field status updated successfully
 *       400:
 *         description: Status invalid
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/status", verifyToken, permit("Admin", "Manager"), updateFieldStatus);

/**
 * @swagger
 * /api/fields/{id}/reset:
 *   patch:
 *     summary: Reset sân về trống + update booking thành cancelled (Admin/Manager)
 *     tags: [Field]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Field reset successfully. All bookings marked as cancelled.
 *       404:
 *         description: Field not found
 *       500:
 *         description: Server error
 */
router.patch("/:id/reset", verifyToken, permit("Admin", "Manager"), resetFieldStatus);

export default router;
