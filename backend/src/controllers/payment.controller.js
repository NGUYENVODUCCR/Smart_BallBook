import { createVNPayUrl, verifyVNPayResponse } from "../services/vnpay.service.js";
import Booking from "../models/booking.model.js";

export const createPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const paymentUrl = createVNPayUrl(req, booking.total_price, booking.id);
    res.json({ paymentUrl });
  } catch (error) {
    console.error("createPayment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;

    const isValid = verifyVNPayResponse(vnp_Params);
    if (!isValid) return res.status(400).json({ message: "Invalid signature" });

    const bookingId = vnp_Params.vnp_OrderInfo.split("#")[1];
    const rspCode = vnp_Params.vnp_ResponseCode;

    if (rspCode === "00") {
      await Booking.update(
        { status: "paid" },
        { where: { id: bookingId } }
      );
      return res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }
  } catch (error) {
    console.error("vnpayReturn error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
