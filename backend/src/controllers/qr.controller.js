import Booking from "../models/booking.model.js";
import QRCheckin from "../models/qrcheckin.model.js";
import { generateQRCode } from "../services/qr.service.js";

export async function createQRForBooking(req, res) {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (booking.status !== "confirmed")
      return res.status(400).json({ msg: "Booking must be confirmed first" });

    let existing = await QRCheckin.findOne({ where: { booking_id: bookingId } });
    if (existing) return res.json({ msg: "QR already exists", qr: existing });

    const qrData = { bookingId: booking.id, userId: booking.user_id, fieldId: booking.field_id };
    const qrCode = await generateQRCode(qrData);

    const qr = await QRCheckin.create({
      booking_id: booking.id,
      qr_code: qrCode,
    });

    res.status(201).json({ msg: "QR created", qr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function scanQR(req, res) {
  try {
    const { bookingId } = req.body;

    const qr = await QRCheckin.findOne({ where: { booking_id: bookingId }, include: ["booking"] });
    if (!qr) return res.status(404).json({ msg: "QR not found" });

    if (qr.is_scanned)
      return res.status(400).json({ msg: "Already checked in", scannedAt: qr.scanned_at });

    qr.is_scanned = true;
    qr.scanned_at = new Date();
    await qr.save();

    res.json({ msg: "Check-in successful", qr });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}

export async function getQRByBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const qr = await QRCheckin.findOne({ where: { booking_id: bookingId } });
    if (!qr) return res.status(404).json({ msg: "QR not found" });
    res.json(qr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
}
