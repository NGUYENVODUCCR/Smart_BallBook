import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://smart-ballbook.onrender.com/api",
});


export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const googleSignIn = (idToken) =>
  API.post("/auth/google", { idToken });
export const getProfile = (token) =>
  API.get("/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);
