import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

const API = "http://192.168.1.139:5000/api";

export default function CreateUser() {
  const { token } = useContext(AuthContext);

  // ================= STATES =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [loading, setLoading] = useState(false);

  const roles = ["User", "Manager", "Admin"];

  // ================= HANDLER =================
  const handleCreate = async () => {
    if (!name || (!email && !phone) || !password) {
      return Alert.alert("Lỗi", "Điền đầy đủ thông tin (Email hoặc Phone bắt buộc)");
    }
    if (!token) {
      return Alert.alert("Lỗi", "Bạn chưa đăng nhập hoặc token không hợp lệ");
    }

    const emailOrPhone = email || phone;
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/users`,
        { name, emailOrPhone, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Thành công", "Tạo tài khoản thành công");
      setName(""); setEmail(""); setPhone(""); setPassword(""); setRole("User");
      console.log("User created:", res.data);
    } catch (err) {
      console.error("Lỗi khi tạo user:", err.response || err.message || err);
      const msg = err.response?.data?.msg || "Tạo thất bại";
      Alert.alert("Lỗi", msg);
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT FIELD =================
  const InputField = useCallback(
    ({ icon, placeholder, value, setValue, secure = false, keyboard = "default" }) => (
      <View style={styles.inputWrapper}>
        <Icon name={icon} size={24} color="#43a047" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
          secureTextEntry={secure}
          keyboardType={keyboard}
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType="next"
        />
      </View>
    ),
    []
  );

  // ================= RENDER =================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#43a047" />
              <Text style={{ marginTop: 10, fontSize: 16 }}>Đang tạo tài khoản...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Tạo tài khoản mới</Text>

              <InputField icon="person" placeholder="Họ tên" value={name} setValue={setName} />
              <InputField icon="email" placeholder="Email (hoặc để trống)" value={email} setValue={setEmail} keyboard="email-address" />
              <InputField icon="phone" placeholder="Số điện thoại (hoặc để trống)" value={phone} setValue={setPhone} keyboard="phone-pad" />
              <InputField icon="lock" placeholder="Mật khẩu" value={password} setValue={setPassword} secure />

              <Text style={styles.label}>Chọn vai trò</Text>
              <View style={styles.roleContainer}>
                {roles.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleButton, role === r && styles.roleSelected]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={role === r ? styles.roleTextSelected : styles.roleText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>Tạo tài khoản</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#eef2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#eef2ff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 30, color: "#43a047", textAlign: "center" },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  input: { flex: 1, height: 50, fontSize: 16, color: "#111827" },
  label: { alignSelf: "flex-start", fontSize: 14, fontWeight: "600", marginBottom: 10, color: "#374151" },
  button: { backgroundColor: "#43a047", paddingVertical: 15, paddingHorizontal: 40, borderRadius: 15, marginTop: 20, width: "100%" },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700", fontSize: 18 },
  roleContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: "#d1d5db", marginHorizontal: 5, borderRadius: 12, alignItems: "center", backgroundColor: "#fff" },
  roleSelected: { backgroundColor: "#43a047", borderColor: "#4338ca" },
  roleText: { color: "#374151", fontWeight: "600" },
  roleTextSelected: { color: "#fff", fontWeight: "700" },
});
