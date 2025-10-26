import Booking from "../models/booking.model.js";
import { Op, fn, col, literal } from "sequelize";

export const getRevenueByDay = async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ message: "Missing date" });

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const totalRevenue = await Booking.sum("total_price", {
      where: {
        created_at: { [Op.between]: [start, end] },
        status: "confirmed",
      },
    });

    res.json({
      date,
      totalRevenue: totalRevenue || 0,
    });
  } catch (error) {
    console.error("getRevenueByDay error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRevenueByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month)
      return res.status(400).json({ message: "Missing year or month" });

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const totalRevenue = await Booking.sum("total_price", {
      where: {
        created_at: { [Op.between]: [start, end] },
        status: "confirmed",
      },
    });

    res.json({
      year,
      month,
      totalRevenue: totalRevenue || 0,
    });
  } catch (error) {
    console.error("getRevenueByMonth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDailyChart = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month)
      return res.status(400).json({ message: "Missing year or month" });

    const start = new Date(`${year}-${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const data = await Booking.findAll({
      attributes: [
        [fn("DATE", col("created_at")), "date"],
        [fn("SUM", col("total_price")), "totalRevenue"],
      ],
      where: {
        created_at: { [Op.between]: [start, end] },
        status: "confirmed",
      },
      group: [literal("DATE(created_at)")],
      order: [[literal("DATE(created_at)"), "ASC"]],
      raw: true,
    });

    res.json(data);
  } catch (error) {
    console.error("getDailyChart error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
