import Booking from "../models/booking.model.js";
import Field from "../models/field.model.js";
import { Op } from "sequelize";

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Field, as: "field" }],
      order: [["date", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}


export async function getMyBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({
      where: { user_id: userId },
      include: [{ model: Field, as: "field" }],
      order: [["date", "DESC"]],
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}


export async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const { field_id, date, start_time, end_time } = req.body;

    if (!field_id || !date || !start_time || !end_time)
      return res.status(400).json({ msg: "Missing required fields" });
  
    const field = await Field.findByPk(field_id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    const overlap = await Booking.findOne({
      where: {
        field_id,
        date,
        [Op.or]: [
          {
            start_time: { [Op.lt]: end_time },
            end_time: { [Op.gt]: start_time },
          },
        ],
      },
    });

    if (overlap) {
      return res.status(400).json({ msg: "Time slot already booked" });
    }

    const start = new Date(`1970-01-01T${start_time}:00`);
    const end = new Date(`1970-01-01T${end_time}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    const total_price = field.price_per_hour * hours;

    const booking = await Booking.create({
      user_id: userId,
      field_id,
      date,
      start_time,
      end_time,
      total_price,
    });

    res.status(201).json({ msg: "Booking created", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json({ msg: "Booking status updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (req.user.role !== "Admin" && booking.user_id !== req.user.id)
      return res.status(403).json({ msg: "Not authorized" });

    booking.status = "cancelled";
    await booking.save();
    res.json({ msg: "Booking cancelled", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}
//