import apiClient from "./apiClient";
import axios from "axios";

export const getAllFields = async (token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await apiClient.get("/fields", { headers });
  return res.data;
};

export const getFieldById = async (id, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await apiClient.get(`/fields/${id}`, { headers });
  return res.data;
};

export const createField = async (fieldData, token) => {
  if (!token) throw new Error("Bạn cần đăng nhập để tạo sân");

  const payload = {
    name: fieldData.name,
    location: fieldData.location,
    price_per_hour: fieldData.price_per_hour,
    description: fieldData.description || null,
    image_url: fieldData.image_url || null,
    status: fieldData.status || "trống",   
  };

  const res = await apiClient.post("/fields", payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const updateField = async (id, fieldData, token) => {
  if (!token) throw new Error("Bạn cần đăng nhập để cập nhật sân");

  const res = await apiClient.put(`/fields/${id}`, fieldData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const updateFieldStatus = async (id, status, token) => {
  if (!token) throw new Error("Bạn cần đăng nhập");

  const res = await apiClient.patch(
    `/fields/${id}/status`,
    { status },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};

export const resetFieldStatus = async (id, token) => {
  if (!token) throw new Error("Bạn cần đăng nhập");

  const res = await apiClient.patch(`/fields/${id}/reset`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const deleteField = async (id, token) => {
  console.log("DELETE FIELD TOKEN:", token);
  if (!token) throw new Error("Bạn cần đăng nhập để xóa sân");

  const res = await apiClient.delete(`/fields/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

const API_BASE = "http://192.168.1.139:5000/api";

export const searchFieldByAI = async (query) => {
  if (!query || query.trim() === "") return [];

  try {
    const res = await axios.get(`${API_BASE}/fields/search`, {
      params: { q: query }
    });

    return res.data?.results ?? [];
  } catch (err) {
    console.log("AI Search error:", err.message);
    return [];
  }
};