import { transporter, mailOptions } from "../config/mailer.js";

/**
 * Gửi email bằng SMTP (dùng cho quên mật khẩu, xác nhận đặt sân, v.v.)
 * @param {string} to - Email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} html - Nội dung HTML của email
 */
export const sendMail = async (to, subject, html) => {
  try {
   
    const info = await transporter.sendMail(mailOptions(to, subject, html));

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📨 Message ID: ${info.messageId}`);

    return info;
  } catch (error) {
    console.error("❌ Mail sending failed:", error.message);
    console.error(error);
    throw new Error("Failed to send email");
  }
};
