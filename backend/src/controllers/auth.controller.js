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

