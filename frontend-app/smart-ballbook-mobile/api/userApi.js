import apiClient from "./apiClient";

// Lấy tất cả users
export const getAllUsers = async (token) => {
  const res = await apiClient.get("/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Lấy user theo id
export const getUserById = async (id, token) => {
  const res = await apiClient.get(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Tạo user mới
export const registerUser = async (name, email, password, role, token) => {
  const res = await apiClient.post(
    "/users",
    { name, email, password, role },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Cập nhật user
export const updateUser = async (id, data, token) => {
  const res = await apiClient.put(`/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Xóa user
export const deleteUser = async (id, token) => {
  const res = await apiClient.delete(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const toggleUserStatus = async (id, token) => {
  const res = await apiClient.patch(`/users/${id}/toggle`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};