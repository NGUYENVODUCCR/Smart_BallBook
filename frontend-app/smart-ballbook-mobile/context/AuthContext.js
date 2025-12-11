import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import {
  forgotPassword as apiForgotPassword,
  login as apiLogin,
  register as apiRegister,
  resetPassword as apiResetPassword,
} from "../api/authApi";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);

  // ==================== HELPER ====================
  const safeTrim = (value) => (typeof value === "string" ? value.trim() : "");

  // ==================== LOAD USER FROM API ====================
  const loadUserProfile = async (tokenValue) => {
    try {
      const res = await apiClient.get("/auth/profile", {
        headers: {
          Authorization: `Bearer ${tokenValue}`,
        },
      });

      if (res.data?.user) {
        setUser(res.data.user);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.log(
        "❌ Load profile error:",
        err?.response?.data || err.message
      );
    }
  };

  // ==================== LOAD STORAGE ====================
  useEffect(() => {
    const loadStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        if (storedToken) {
          setToken(storedToken);
          apiClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // ✅ Gọi lại API lấy profile mới nhất
          await loadUserProfile(storedToken);
        }
      } catch (err) {
        console.error("Failed to load token from storage:", err);
      } finally {
        setLoadingStorage(false);
      }
    };

    loadStorage();
  }, []);

  // ==================== LOGIN ====================
  const login = async (emailOrPhone, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(safeTrim(emailOrPhone), safeTrim(password));

      setToken(data.token);
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      await AsyncStorage.setItem("token", data.token);

      // ✅ Sau login => load lại profile từ server
      await loadUserProfile(data.token);

      return data;
    } finally {
      setLoading(false);
    }
  };

  // ==================== REGISTER ====================
  const register = async ({ name, emailOrPhone, password }) => {
    setLoading(true);
    try {
      const payload = {
        name: safeTrim(name),
        emailOrPhone: safeTrim(emailOrPhone),
        password: safeTrim(password),
      };

      const data = await apiRegister(payload);

      if (data?.token) {
        setToken(data.token);
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${data.token}`;

        await AsyncStorage.setItem("token", data.token);

        // ✅ Load profile sau khi đăng ký
        await loadUserProfile(data.token);
      }

      return data;
    } catch (err) {
      console.error("Register error:", err?.response?.data || err);
      throw err?.response?.data || err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== GOOGLE SIGN-IN ====================
  const googleSignIn = async (accessToken) => {
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/google", { accessToken });

      setToken(data.token);
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.token}`;

      await AsyncStorage.setItem("token", data.token);

      // ✅ Load full profile
      await loadUserProfile(data.token);

      return data;
    } finally {
      setLoading(false);
    }
  };

  // ==================== LOGOUT ====================
  const logout = async () => {
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  };

  // ==================== FORGOT PASSWORD ====================
  const forgotPassword = async ({ emailOrPhone }) => {
    setLoading(true);
    try {
      const payload = { emailOrPhone: safeTrim(emailOrPhone) };
      const data = await apiForgotPassword(payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  // ==================== RESET PASSWORD ====================
  const resetPassword = async ({ emailOrPhone, otp, newPassword }) => {
    setLoading(true);
    try {
      const payload = {
        emailOrPhone: safeTrim(emailOrPhone),
        otp: safeTrim(otp),
        newPassword: safeTrim(newPassword),
      };
      const data = await apiResetPassword(payload);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loadingStorage,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
        setUser,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
