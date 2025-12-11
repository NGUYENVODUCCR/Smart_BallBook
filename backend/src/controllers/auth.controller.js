import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { sendMail } from "../services/mail.service.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "");
const otpStore = new Map();

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email, phone: user.phone },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}


export async function register(req, res) {
  try {
    console.log("📦 REGISTER BODY:", req.body);
    console.log("📦 CONTENT TYPE:", req.headers["content-type"]);

    const {
      name = "",
      emailOrPhone = "",
      password = "",
      role = "User",
    } = req.body || {};

    if (!emailOrPhone || !password) {
      return res.status(400).json({ msg: "Email/SĐT và mật khẩu bắt buộc" });
    }

    const isEmail = emailOrPhone.includes("@");
    const whereClause = isEmail
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const existing = await User.findOne({ where: whereClause });
    if (existing) {
      return res
        .status(400)
        .json({ msg: `${isEmail ? "Email" : "SĐT"} đã tồn tại` });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const userData = {
      name,
      password: hash,
      is_verified: false,
      is_active: true,
      role,
    };

    if (isEmail) userData.email = emailOrPhone;
    else userData.phone = emailOrPhone;

    const user = await User.create(userData);

    const token = createToken(user);

    return res.status(201).json({
      msg: "Đăng ký thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function login(req, res) {
  try {
    console.log("📦 LOGIN BODY:", req.body);

    const { emailOrPhone = "", password = "" } = req.body || {};

    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ msg: "Email/SĐT và mật khẩu bắt buộc" });
    }

    const isEmail = emailOrPhone.includes("@");
    const whereClause = isEmail
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const user = await User.findOne({ where: whereClause });
    if (!user)
      return res.status(400).json({ msg: "Thông tin đăng nhập không hợp lệ" });

    if (!user.password) {
      return res
        .status(400)
        .json({ msg: "Tài khoản này đăng nhập bằng Google" });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ msg: "Tài khoản đã bị khóa, liên hệ Admin" });
    }

    const matched = bcrypt.compareSync(password, user.password);
    if (!matched)
      return res.status(400).json({ msg: "Thông tin đăng nhập không hợp lệ" });

    const token = createToken(user);

    return res.json({
      msg: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function googleSignIn(req, res) {
  try {
    const { idToken = "" } = req.body || {};

    if (!idToken) {
      return res.status(400).json({ msg: "idToken bắt buộc" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email || "";
    const name = payload?.name || "";
    const googleId = payload?.sub || "";

    if (!email) {
      return res.status(400).json({ msg: "Không lấy được email từ Google" });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        google_id: googleId,
        is_verified: true,
        is_active: true,
        role: "User",
      });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ msg: "Tài khoản bị khóa, liên hệ Admin" });
    }

    const token = createToken(user);

    return res.json({
      msg: "Đăng nhập Google thành công",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    return res.status(500).json({ msg: "Đăng nhập Google thất bại" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { emailOrPhone = "" } = req.body || {};

    if (!emailOrPhone) {
      return res.status(400).json({ msg: "Email hoặc SĐT bắt buộc" });
    }

    const isEmail = emailOrPhone.includes("@");
    const whereClause = isEmail
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const user = await User.findOne({ where: whereClause });
    if (!user) {
      return res
        .status(404)
        .json({ msg: `${isEmail ? "Email" : "SĐT"} không tồn tại` });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(emailOrPhone, { otp, expiresAt });

    if (isEmail) {
      const html = `
        <h3>Yêu cầu đặt lại mật khẩu</h3>
        <p>Mã OTP của bạn: <b>${otp}</b></p>
        <p>OTP có hiệu lực trong 5 phút</p>
      `;
      await sendMail(emailOrPhone, "OTP Reset Password", html);
    } else {
      console.log(`📱 OTP cho ${emailOrPhone}: ${otp}`);
    }

    return res.json({ msg: "OTP đã được gửi" });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function resetPassword(req, res) {
  try {
    const {
      emailOrPhone = "",
      otp = "",
      newPassword = "",
    } = req.body || {};

    if (!emailOrPhone || !otp || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Thiếu dữ liệu bắt buộc" });
    }

    const stored = otpStore.get(emailOrPhone);
    if (!stored)
      return res.status(400).json({ msg: "OTP không tồn tại" });

    if (stored.otp !== otp)
      return res.status(400).json({ msg: "OTP không hợp lệ" });

    if (Date.now() > stored.expiresAt)
      return res.status(400).json({ msg: "OTP đã hết hạn" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    const isEmail = emailOrPhone.includes("@");
    const whereClause = isEmail
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    await User.update({ password: hash }, { where: whereClause });
    otpStore.delete(emailOrPhone);

    return res.json({ msg: "Cập nhật mật khẩu thành công" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function profile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "role",
        "is_verified",
        "avatar",
        "gender",
        "address",
        "facebook",
      ],
    });
    return res.json({ user });
  } catch (err) {
    console.error("PROFILE ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const {
      name = "",
      phone = "",
      gender = "",
      address = "",
      facebook = "",
    } = req.body || {};

    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ msg: "Người dùng không tồn tại" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (address) user.address = address;
    if (facebook) user.facebook = facebook;

    await user.save();

    return res.json({ msg: "Cập nhật thông tin thành công", user });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function updateAvatar(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file || !req.file.path) {
      return res.status(400).json({ msg: "Không có file upload" });
    }

    const avatarUrl = req.file.path;
    await User.update({ avatar: avatarUrl }, { where: { id: userId } });

    return res.json({
      msg: "Cập nhật avatar thành công",
      avatar: avatarUrl,
    });
  } catch (err) {
    console.error("UPDATE AVATAR ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function refreshToken(req, res) {
  try {
    const { token = "" } = req.body || {};

    if (!token) {
      return res.status(400).json({ msg: "Token bắt buộc" });
    }

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ msg: "Token không hợp lệ" });
      }

      const newToken = jwt.sign(
        {
          id: decoded.id,
          role: decoded.role,
          email: decoded.email,
          phone: decoded.phone,
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      return res.json({ token: newToken });
    });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}
