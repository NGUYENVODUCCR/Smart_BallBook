import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import permit from "../middlewares/role.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng (Admin)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách user
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, permit("Admin"), getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy user theo ID (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Trả về user
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.get("/:id", verifyToken, permit("Admin"), getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tạo user mới (Admin)
 *     tags: [Users]
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
 *               - emailOrPhone
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               emailOrPhone:
 *                 type: string
 *                 description: Email hoặc số điện thoại (được lưu vào field email trong DB)
 *                 example: example@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 enum: [User, Admin]
 *                 example: User
 *     responses:
 *       201:
 *         description: User được tạo thành công
 *         content:
 *           application/json:
 *             example:
 *               msg: User created
 *               user:
 *                 id: 1
 *                 name: Nguyễn Văn A
 *                 email: example@gmail.com
 *                 role: User
 *                 is_active: true
 *                 is_verified: true
 *       400:
 *         description: Thiếu thông tin hoặc người dùng đã tồn tại
 *         content:
 *           application/json:
 *             examples:
 *               missingInfo:
 *                 summary: Thiếu trường bắt buộc
 *                 value:
 *                   msg: Thiếu thông tin bắt buộc
 *               exists:
 *                 summary: Email đã tồn tại
 *                 value:
 *                   msg: Người dùng đã tồn tại
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               msg: Server error
 */
router.post("/", verifyToken, permit("Admin"), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User được cập nhật
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, permit("Admin"), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User bị xóa
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, permit("Admin"), deleteUser);

/**
 * @swagger
 * /api/users/{id}/toggle:
 *   patch:
 *     summary: Khóa/Mở khóa user (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Trạng thái user được thay đổi
 *       404:
 *         description: User không tồn tại
 *       500:
 *         description: Server error
 */
router.patch("/:id/toggle", verifyToken, permit("Admin"), toggleUserStatus);

export default router;
