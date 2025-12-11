import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";

const backgroundImage = require("../../assets/images/hinh2.jpg");
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const API_BASE = "http://192.168.1.139:5000/api";

export default function AdminProfile() {
  const router = useRouter();
  const { user, logout, token, setUser, loadingStorage } =
    useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    address: "",
    facebook: "",
  });

  useEffect(() => {
    if (!loadingStorage) {
      setLoading(false);

      if (user) {
        setForm({
          name: user.name || "",
          phone: user.phone || "",
          gender: user.gender || "",
          address: user.address || "",
          facebook: user.facebook || "",
        });
      }
    }
  }, [loadingStorage, user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // ================= PICK + UPLOAD AVATAR =================
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (res.canceled) return;

    const file = res.assets[0];

    const formData = new FormData();
    formData.append("avatar", {
      uri: file.uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    });

    try {
      setUploading(true);

      const response = await axios.post(
        `${API_BASE}/auth/profile/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.avatar) {
        setUser((prev) => ({
          ...prev,
          avatar: response.data.avatar,
        }));
      }
    } catch (err) {
      console.log("Upload error:", err?.response?.data || err.message);
      alert("❌ Upload ảnh thất bại!");
    } finally {
      setUploading(false);
    }
  };

  // ================= UPDATE PROFILE =================
  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        {
          name: form.name,
          phone: form.phone,
          gender: form.gender,
          address: form.address,
          facebook: form.facebook,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.user) {
        setUser(res.data.user);
        setEditMode(false);
      } else {
        alert("❌ Cập nhật thất bại!");
      }
    } catch (err) {
      console.log("Update profile error:", err?.response?.data || err.message);
      alert("❌ Lỗi server!");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#43a047" />
      </View>
    );
  }

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={{ alignItems: "center", paddingBottom: 70 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: user?.avatar || DEFAULT_AVATAR }}
              style={styles.avatar}
            />

            {uploading && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>Đang tải...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.changeAvatarBtn}
            onPress={pickImage}
            disabled={uploading}
          >
            <Text style={styles.changeAvatarText}>
              {uploading ? "Đang upload..." : "Đổi ảnh đại diện"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {!editMode ? (
            <View style={styles.card}>
              <InfoRow label="Giới tính" value={user?.gender} />
              <InfoRow label="Số điện thoại" value={user?.phone} />
              <InfoRow label="Địa chỉ" value={user?.address} isAddress />
              <InfoRow label="Facebook" value={user?.facebook} isLink />
            </View>
          ) : (
            <View style={styles.card}>
              <Input
                label="Họ tên"
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
              />
              <Input
                label="Số điện thoại"
                value={form.phone}
                onChangeText={(v) => setForm({ ...form, phone: v })}
              />
              <Input
                label="Giới tính"
                value={form.gender}
                onChangeText={(v) => setForm({ ...form, gender: v })}
              />
              <Input
                label="Địa chỉ"
                value={form.address}
                onChangeText={(v) => setForm({ ...form, address: v })}
              />
              <Input
                label="Facebook"
                value={form.facebook}
                onChangeText={(v) => setForm({ ...form, facebook: v })}
              />
            </View>
          )}

          {!editMode ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setEditMode(true)}
            >
              <Text style={styles.primaryText}>Cập nhật thông tin</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: "#43a047" }]}
                onPress={handleSave}
              >
                <Text style={styles.primaryText}>Lưu thay đổi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditMode(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

// =============== COMPONENT SHOW INFO ===============
function InfoRow({ label, value, isAddress, isLink }) {
  if (!value) value = "Chưa cập nhật";

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      value
    )}`;
    Linking.openURL(url);
  };

  const openLink = () => {
    let url = value;
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    Linking.openURL(url);
  };

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>

      {isAddress && value !== "Chưa cập nhật" ? (
        <TouchableOpacity onPress={openGoogleMaps}>
          <Text style={styles.linkText}>Xem trên bản đồ</Text>
        </TouchableOpacity>
      ) : isLink && value !== "Chưa cập nhật" ? (
        <TouchableOpacity onPress={openLink}>
          <Text style={styles.linkText}>Mở link</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.rowValue}>{value}</Text>
      )}
    </View>
  );
}

function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput style={styles.input} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  avatarWrapper: {
    marginTop: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "#a5d6a7",
  },

  avatar: { width: "100%", height: "100%" },

  loadingOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: { color: "#fff", fontSize: 12 },

  changeAvatarBtn: {
    marginTop: 12,
    backgroundColor: "#43a047",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },

  changeAvatarText: { color: "#fff", fontWeight: "bold" },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
  },

  email: {
    color: "#e0e0e0",
    marginBottom: 20,
  },

  card: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  rowLabel: { fontWeight: "600", color: "#555" },

  rowValue: {
    color: "#2e7d32",
    fontWeight: "600",
    maxWidth: "60%",
  },

  linkText: { color: "#1e88e5", fontWeight: "bold" },

  inputLabel: { color: "#777", fontSize: 13 },

  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },

  primaryBtn: {
    backgroundColor: "#1e88e5",
    paddingVertical: 14,
    width: "90%",
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  primaryText: { color: "#fff", fontWeight: "bold" },

  cancelBtn: {
    width: "90%",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: "#fbc02d",
    elevation: 3,
  },

  cancelText: {
    color: "#000",
    fontWeight: "bold",
  },

  logoutBtn: {
    marginTop: 30,
    backgroundColor: "#e53935",
    paddingVertical: 14,
    width: "90%",
    borderRadius: 14,
    alignItems: "center",
  },

  logoutText: { color: "#fff", fontWeight: "bold" },
});
