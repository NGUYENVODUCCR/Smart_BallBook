import { createVNPayUrl, verifyVNPayResponse } from "../services/vnpay.service.js";
import Booking from "../models/booking.model.js";
import Field from "../models/field.model.js";
import QRCheckin from "../models/qrcheckin.model.js";
import { generateQRCode } from "../services/qr.service.js";

/**
 * Tạo link thanh toán VNPay
 */
export const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "Missing bookingId" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Không cho thanh toán lại booking đã confirmed/cancelled
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Booking is not eligible for payment",
      });
    }

    const paymentUrl = createVNPayUrl(req, booking.total_price, booking.id);
    res.json({ paymentUrl });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VNPay redirect về sau thanh toán
 */
export const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;

    const isValid = verifyVNPayResponse(vnp_Params);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const bookingId = vnp_Params.vnp_OrderInfo?.split("#")[1];
    const rspCode = vnp_Params.vnp_ResponseCode;

    if (!bookingId) {
      return res.status(400).json({ message: "Invalid booking info" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (rspCode === "00") {
      // ✅ Thanh toán thành công
      booking.status = "confirmed";
      await booking.save();

      // ✅ Update trạng thái sân
      const field = await Field.findByPk(booking.field_id);
      if (field) {
        field.status = "đã thuê";
        await field.save();
      }

      // ✅ Tạo QR code
      const qrData = {
        bookingId: booking.id,
        userId: booking.user_id,
        fieldId: booking.field_id,
      };

      const qrCode = await generateQRCode(qrData);

      await QRCheckin.create({
        booking_id: booking.id,
        qr_code: qrCode,
        is_scanned: false,
      });

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success`
      );
    } else {
      // ❌ Thanh toán thất bại
      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-failed`
      );
    }
  } catch (error) {
    console.error("vnpayReturn error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
