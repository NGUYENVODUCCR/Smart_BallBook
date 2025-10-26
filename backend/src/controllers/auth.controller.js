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
    { id: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}


export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body; 
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const user = await User.create({
      name,
      email,
      password: hash,
      is_verified: false,
      role: role || "User",
    });

    const token = createToken(user);
    return res.status(201).json({
      msg: "Registered",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.password)
      return res
        .status(400)
        .json({ msg: "User registered via Google. Use Google Sign-in" });

    const matched = bcrypt.compareSync(password, user.password);
    if (!matched) return res.status(400).json({ msg: "Invalid credentials" });

    const token = createToken(user);
    return res.json({
      msg: "Login success",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function googleSignIn(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ msg: "idToken required" });

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name,
        email,
        google_id: googleId,
        is_verified: true,
      });
    } else {
      if (!user.google_id) {
        user.google_id = googleId;
        user.is_verified = true;
        await user.save();
      }
    }

    const token = createToken(user);
    return res.json({
      msg: "Google sign-in success",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Google sign error:", err);
    return res.status(500).json({ msg: "Google sign-in failed" });
  }
}

export async function profile(req, res) {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "is_verified"],
    });
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}

export async function refreshToken(req, res) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ msg: "Token required" });

    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) return res.status(401).json({ msg: "Invalid token" });
      const newToken = jwt.sign(
        { id: decoded.id, role: decoded.role, email: decoded.email },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );
      return res.json({ token: newToken });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ msg: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    otpStore.set(email, { otp, expiresAt });

    const html = `
      <h3>Yêu cầu đặt lại mật khẩu</h3>
      <p>Mã OTP của bạn là: <b>${otp}</b></p>
      <p>Mã này có hiệu lực trong 5 phút.</p>
    `;

    await sendMail(email, "OTP Reset Password", html);
    return res.json({ msg: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}


export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = otpStore.get(email);
    if (!stored) return res.status(400).json({ msg: "OTP not found" });
    if (stored.otp !== otp) return res.status(400).json({ msg: "Invalid OTP" });
    if (Date.now() > stored.expiresAt)
      return res.status(400).json({ msg: "OTP expired" });

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    await User.update({ password: hash }, { where: { email } });
    otpStore.delete(email);

    return res.json({ msg: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
}
