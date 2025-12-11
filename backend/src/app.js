import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import fieldRoutes from "./routes/field.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import userRoutes from "./routes/user.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import reportRoutes from "./routes/report.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import { swaggerUi, swaggerSpec } from "./config/swagger.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/revenue", reportRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ ok: true, msg: "⚽ Football Booking API is running" });
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to ${process.env.DB_DIALECT.toUpperCase()} database`);

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

export default app;
