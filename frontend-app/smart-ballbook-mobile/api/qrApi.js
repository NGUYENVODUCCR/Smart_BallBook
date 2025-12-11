// api/qrApi.js
import apiClient from "./apiClient";

export const createQR = async (bookingId, token) => {
  const res = await apiClient.post(`/qr/${bookingId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getQRByBooking = async (bookingId, token) => {
  const res = await apiClient.get(`/qr/${bookingId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
