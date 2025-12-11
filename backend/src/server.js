import app, { connectDB } from "./app.js";
import dotenv from "dotenv";
import { startWeeklyMailer } from "./services/cron.service.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
  });
  startWeeklyMailer();
  console.log(`Cronjob đang chạy tự động gửi mailer hàng tuần`)
};

startServer();
