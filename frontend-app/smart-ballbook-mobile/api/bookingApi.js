// api/bookingApi.js
import apiClient from "./apiClient";

// Lấy tất cả booking của user
export const getMyBookings = async (token) => {
  const res = await apiClient.get("/bookings/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Tạo booking mới
export const createBooking = async (field_id, date, start_time, end_time, token) => {
  const res = await apiClient.post(
    "/bookings",
    { field_id, date, start_time, end_time },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Thanh toán booking
export const payBooking = async (bookingId, token) => {
  const res = await apiClient.put(
    `/bookings/pay/${bookingId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Hủy booking
export const cancelBooking = async (bookingId, token) => {
  const res = await apiClient.put(
    `/bookings/cancel/${bookingId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Lấy booking theo field
export const getBookingByField = async (fieldId, token) => {
  const res = await apiClient.get(`/bookings/field/${fieldId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Xóa tất cả booking của một field (Admin/Manager)
export const clearBookingsOfField = async (fieldId, token) => {
  const res = await apiClient.delete(`/bookings/delete/field/${fieldId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Xóa tất cả booking của một user (Admin/Manager)
export const clearBookingsOfUser = async (userId, token) => {
  const res = await apiClient.delete(`/bookings/delete/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// Lấy tất cả booking (Admin/Manager)
export const getAllBookings = async (token) => {
  const res = await apiClient.get("/bookings", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Cập nhật trạng thái booking (Admin/Manager)
export const updateBookingStatus = async (bookingId, status, token) => {
  const res = await apiClient.put(
    `/bookings/status/${bookingId}`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
