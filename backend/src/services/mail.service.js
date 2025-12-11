import { transporter, mailOptions } from "../config/mailer.js";


export const sendMail = async (to, subject, html) => {
  try {
    if (!to || typeof to !== "string" || to.trim() === "") {
      console.warn("⚠️ Mail sending skipped: No recipients defined");
      return null;
    }

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
