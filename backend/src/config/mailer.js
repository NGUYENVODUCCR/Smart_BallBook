import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.MAIL_PORT) || 465,
  secure: Number(process.env.MAIL_PORT) === 465, 
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

export const mailOptions = (to, subject, html) => ({
  from: `"Football Booking" <${process.env.MAIL_USER}>`,
  to,
  subject,
  html,
});
