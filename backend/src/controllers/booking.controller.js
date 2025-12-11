import Booking from "../models/booking.model.js";
import Field from "../models/field.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";

export async function getAllBookings(req, res) {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Field, as: "field" },
        { model: User, as: "user", attributes: ["id", "name", "email", "phone"] },
      ],
      order: [["date", "DESC"], ["start_time", "ASC"]],
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
      order: [["date", "DESC"], ["start_time", "ASC"]],
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
    if (field.status === "bảo trì") return res.status(400).json({ msg: "Field under maintenance" });

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
        status: { [Op.not]: "cancelled" },
      },
    });

    if (overlap) return res.status(400).json({ msg: "Time slot already booked" });

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
      status: "paid", 
    });

    field.status = "đã thuê";
    await field.save();

    res.status(201).json({ msg: "Booking created successfully", booking, field });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}


export async function payBooking(req, res) {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.status === "paid") return res.status(400).json({ msg: "Booking already paid" });

    const field = await Field.findByPk(booking.field_id);
    if (!field) return res.status(404).json({ msg: "Field not found" });

    booking.status = "paid";
    await booking.save();

    field.status = "đã thuê";
    await field.save();

    res.json({ msg: "Payment successful", booking, field });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function updateBookingStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "cancelled"].includes(status))
      return res.status(400).json({ msg: "Invalid status" });

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    booking.status = status;
    await booking.save();

    const field = await Field.findByPk(booking.field_id);
    if (field) {
      if (status === "paid") field.status = "đã thuê";
      else if (status === "cancelled") field.status = "trống";
      await field.save();
    }

    res.json({ msg: "Booking status updated", booking, field });
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

    const field = await Field.findByPk(booking.field_id);
    if (field) {
      field.status = "trống";
      await field.save();
    }

    res.json({ msg: "Booking cancelled", booking, field });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function getBookingByField(req, res) {
  const { fieldId } = req.params;
  try {
    const booking = await Booking.findOne({
      where: { field_id: fieldId, status: "paid" },
      include: [{ model: User, as: "user", attributes: ["id", "name", "email", "phone"] }],
      order: [["date", "DESC"], ["start_time", "ASC"]],
    });

    if (!booking)
      return res.status(404).json({ msg: "No active booking for this field" });

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
  
}
export async function deleteBookingsOfField(req, res) {
  const { fieldId } = req.params;
  try {
    const bookings = await Booking.findAll({
      where: { field_id: fieldId }
    });

    const deletedCount = await Booking.destroy({ where: { field_id: fieldId } });

    const field = await Field.findByPk(fieldId);
    if (field) {
      field.status = "trống";
      await field.save();
    }

    res.json({
      msg: "All bookings deleted for field",
      field,
      deletedBookings: deletedCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function deleteBookingsOfUser(req, res) {
  const { userId } = req.params;
  try {
    const bookings = await Booking.findAll({ where: { user_id: userId } });

    const fieldIds = bookings.map(b => b.field_id).filter(Boolean);

    const deletedCount = await Booking.destroy({ where: { user_id: userId } });

    await Field.update(
      { status: "trống" },
      { where: { id: fieldIds } }
    );

    res.json({
      msg: "All bookings deleted for user",
      deletedBookings: deletedCount,
      affectedFields: fieldIds.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}