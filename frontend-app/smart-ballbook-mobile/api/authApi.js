import apiClient from "./apiClient";

export const login = async (emailOrPhone, password) => {
  try {
    const safeEmailOrPhone =
      typeof emailOrPhone === "string" ? emailOrPhone.trim() : "";
    const safePassword =
      typeof password === "string" ? password.trim() : "";

    if (!safeEmailOrPhone || !safePassword) {
      throw { msg: "Email/SĐT và mật khẩu bắt buộc" };
    }

    const payload = {
      emailOrPhone: safeEmailOrPhone,
      password: safePassword,
    };

    console.log("👉 LOGIN payload gửi lên:", payload);

    const res = await apiClient.post("/auth/login", payload);

    console.log("✅ LOGIN response:", res.data);

    return res.data;
  } catch (err) {
    console.log("❌ Login error:", err?.response?.data || err);
    throw err?.response?.data || err;
  }
};

export const register = async ({ name, emailOrPhone, password }) => {
  try {
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeEmailOrPhone =
      typeof emailOrPhone === "string" ? emailOrPhone.trim() : "";
    const safePassword =
      typeof password === "string" ? password.trim() : "";

    if (!safeEmailOrPhone || !safePassword) {
      throw { msg: "Email/SĐT và mật khẩu bắt buộc" };
    }

    const payload = {
      name: safeName,
      emailOrPhone: safeEmailOrPhone,
      password: safePassword,
    };

    console.log("👉 REGISTER payload gửi lên:", payload);

    const res = await apiClient.post("/auth/register", payload);

    console.log("✅ REGISTER response:", res.data);

    return res.data;
  } catch (err) {
    console.log("❌ Register error:", err?.response?.data || err);
    throw err?.response?.data || err;
  }
};

export const forgotPassword = async (data) => {

  const res = await apiClient.post("/auth/forgot-password", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await apiClient.post("/auth/reset-password", data);
  return res.data;
};

export const getProfile = async (token) => {
  try {
    if (!token) throw { msg: "Missing token" };

    const res = await apiClient.get("/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (err) {
    console.log("❌ GetProfile error:", err?.response?.data || err);
    throw err?.response?.data || err;
  }
};
