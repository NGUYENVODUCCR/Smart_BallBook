// api/statisticsApi.js
import apiClient from "./apiClient";

export const getStatistics = async (token) => {
  const res = await apiClient.get("/bookings/statistics", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
