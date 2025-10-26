import cron from "node-cron";
import { Op } from "sequelize";
import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Field from "../models/field.model.js";
import { sendMail } from "./mail.service.js";

export function startBookingCronJob() {
  cron.schedule("*/1 * * * *", async () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      const timeStr = now.toTimeString().slice(0, 5);

      const expiredBookings = await Booking.findAll({
        where: {
          [Op.or]: [
            { date: { [Op.lt]: dateStr } },
            {
              date: dateStr,
              end_time: { [Op.lt]: timeStr },
            },
          ],
          status: { [Op.notIn]: ["cancelled", "expired"] },
        },
        include: [
          { model: User, as: "user" },
          { model: Field, as: "field" },
        ],
      });

      if (expiredBookings.length > 0) {
        console.log(`⏰ Found ${expiredBookings.length} expired bookings`);

        for (const booking of expiredBookings) {
          booking.status = "expired";
          await booking.save();

          if (booking.user?.email) {
            const html = `
              <h3>Xin chào ${booking.user.name || "người dùng"},</h3>
              <p>Đặt sân của bạn tại <b>${booking.field.name}</b> vào ngày <b>${booking.date}</b> 
              từ <b>${booking.start_time}</b> đến <b>${booking.end_time}</b> đã <b>hết hạn</b>.</p>
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi ⚽</p>
              <hr>
              <p style="font-size:12px;color:gray;">Football Booking System</p>
            `;

            await sendMail({
              to: booking.user.email,
              subject: "⚽ Thông báo: Booking đã hết hạn",
              html,
            });

            console.log(`📩 Mail sent to ${booking.user.email}`);
          }
        }
      }
    } catch (error) {
      console.error("❌ Cronjob error:", error);
    }
  });
}
