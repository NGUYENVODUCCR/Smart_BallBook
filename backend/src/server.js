import app, { connectDB } from "./app.js";
import dotenv from "dotenv";
import { startBookingCronJob } from "./services/cron.service.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

  startBookingCronJob();
  console.log("🕓 Cronjob for booking status started");
};

startServer();
