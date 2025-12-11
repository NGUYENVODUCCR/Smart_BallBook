import cron from "node-cron";
import User from "../models/user.model.js";
import { sendMail } from "../services/mail.service.js";

const EMAIL_SUBJECT = "⚽ Trải nghiệm thể thao tuyệt vời cùng chúng tôi!";
const EMAIL_TEMPLATE = `
  <div style="font-family: Arial; padding: 16px;">
    <h2 style="color:#2e89ff;">⚽ Football Booking</h2>
    <p>
      Hãy tận hưởng mọi khoảnh khắc thể thao trữ tình, đầy cảm hứng cùng các sân bóng của chúng tôi.
      <br/>Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong từng trận đấu!
    </p>
    <p>🔥 Chúc bạn có một ngày thật năng lượng!</p>
    <hr/>
    <p style="font-size: 12px; color: gray;">
      Đây là email tự động. Vui lòng không trả lời email này.
    </p>
  </div>
`;

export function startWeeklyMailer() {
  console.log("⏳ Weekly mailer cronjob initialized...");

  cron.schedule(
    "0 19 * * 4",
    async () => {
      console.log("🚀 Cronjob: Sending weekly inspiration emails...");

      try {
        const users = await User.findAll({
          where: { is_active: true },
          attributes: ["email"],
        });

        const emails = users.map((u) => u.email).filter(Boolean);

        if (emails.length === 0) {
          console.log("⚠️ No active user emails found.");
          return;
        }

        console.log(`📧 Sending emails to ${emails.length} users...`);

        for (const email of emails) {
          await sendMail(email, EMAIL_SUBJECT, EMAIL_TEMPLATE);
        }

        console.log("🎉 Weekly inspiration emails sent successfully!");
      } catch (err) {
        console.error("❌ Error in weekly mailer cronjob:", err);
      }
    },
    {
      timezone: "Asia/Ho_Chi_Minh", 
    }
  );
}
