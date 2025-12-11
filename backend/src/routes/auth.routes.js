import express from "express";
import {
  register,
  login,
  googleSignIn,
  profile,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateAvatar,
} from "../controllers/auth.controller.js";

import verifyToken from "../middlewares/auth.middleware.js";
import cloudinaryUpload from "../middlewares/cloudinaryUpload.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               emailOrPhone:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [User, Manager, Admin]
 *                 default: User
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             example:
 *               msg: "Đăng ký thành công"
 *               token: "jwt_token_here"
 *               user:
 *                 id: 1
 *                 name: "Nguyen Van A"
 *                 email: "example@gmail.com"
 *                 phone: null
 *                 role: "User"
 *       400:
 *         description: Email/SĐT đã tồn tại hoặc thiếu dữ liệu
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập bằng email hoặc số điện thoại
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - password
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: "example@gmail.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             example:
 *               msg: "Đăng nhập thành công"
 *               token: "jwt_token_here"
 *               user:
 *                 id: 1
 *                 name: "Nguyen Van A"
 *                 email: "example@gmail.com"
 *                 phone: null
 *                 role: "User"
 *       400:
 *         description: Thông tin đăng nhập không hợp lệ
 *       403:
 *         description: Tài khoản bị khóa
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Đăng nhập bằng Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 example: "google_id_token_here"
 *     responses:
 *       200:
 *         description: Đăng nhập Google thành công
 *       400:
 *         description: idToken thiếu hoặc không lấy được email
 *       403:
 *         description: Tài khoản bị khóa
 *       500:
 *         description: Server error
 */
router.post("/google", googleSignIn);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Lấy thông tin profile người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 *       401:
 *         description: Token không hợp lệ
 *       500:
 *         description: Server error
 */
router.get("/profile", verifyToken, profile);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Cập nhật profile người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Nam, Nữ, Khác]
 *               address:
 *                 type: string
 *               facebook:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Người dùng không tồn tại
 *       500:
 *         description: Server error
 */
router.put("/profile", verifyToken, updateProfile);

/**
 * @swagger
 * /api/auth/profile/avatar:
 *   post:
 *     summary: Cập nhật avatar người dùng
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật avatar thành công
 *       400:
 *         description: Không có file upload
 *       500:
 *         description: Server error
 */
router.post(
  "/profile/avatar",
  verifyToken,
  cloudinaryUpload.single("avatar"),
  updateAvatar
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Lấy token mới từ token cũ
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "old_jwt_token_here"
 *     responses:
 *       200:
 *         description: Token mới
 *       400:
 *         description: Token bắt buộc
 *       401:
 *         description: Token không hợp lệ
 *       500:
 *         description: Server error
 */
router.post("/refresh", refreshToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Yêu cầu OTP để reset mật khẩu
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: "example@gmail.com"
 *     responses:
 *       200:
 *         description: OTP đã được gửi
 *       404:
 *         description: Email/SĐT không tồn tại
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset mật khẩu bằng OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - otp
 *               - newPassword
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật mật khẩu thành công
 *       400:
 *         description: OTP không hợp lệ hoặc hết hạn
 *       500:
 *         description: Server error
 */
router.post("/reset-password", resetPassword);

export default router;
