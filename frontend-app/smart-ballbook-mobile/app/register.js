import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "../context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen() {
  const { register, googleSignIn } = useContext(AuthContext);
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const safeTrim = (value) =>
    typeof value === "string" ? value.trim() : "";

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: typeof value === "string" ? value : "",
    }));
  };

  // ===== Google Sign In Setup =====
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "596176186305-u8olpm6bn0mpek5cfv106lf4irpm2t6n.apps.googleusercontent.com",
    webClientId:
      "596176186305-u8olpm6bn0mpek5cfv106lf4irpm2t6n.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.authentication?.idToken;

      if (idToken) {
        handleGoogleLogin(idToken);
      } else {
        Alert.alert("Lỗi", "Không lấy được Google token");
      }
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      const res = await googleSignIn(idToken);
      const user = res?.user;

      Alert.alert("🎉 Thành công", "Đăng nhập Google thành công!");
      router.replace(
        user.role === "Admin" || user.role === "Manager"
          ? "/admin"
          : "/user/userhome"
      );
    } catch (err) {
      console.error("Google Sign-In error:", err?.response?.data || err.message);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.msg || "Đăng nhập Google thất bại"
      );
    }
  };

  // ===== Đăng ký thường =====
  const handleRegister = async () => {
    const name = safeTrim(form.name);
    const email = safeTrim(form.email);
    const phone = safeTrim(form.phone);
    const password = safeTrim(form.password);

    if (!name || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên và mật khẩu");
      return;
    }

    const emailOrPhone = email || phone;

    if (!emailOrPhone) {
      Alert.alert("Lỗi", "Vui lòng nhập Email hoặc SĐT");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        emailOrPhone,
        password,
      };

      console.log("📤 Register payload:", payload);

      await register(payload);

      Alert.alert("🎉 Thành công", "Đăng ký thành công!", [
        { text: "OK", onPress: () => router.push("/login") },
      ]);

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (err) {
      console.error("❌ Register error:", err?.response?.data || err.message);
      Alert.alert(
        "Lỗi",
        err?.response?.data?.msg || "Đăng ký thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản SmartBallBook</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ tên"
        value={form.name}
        onChangeText={(text) => handleChange("name", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email (không bắt buộc)"
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="SĐT (không bắt buộc)"
        value={form.phone}
        onChangeText={(text) => handleChange("phone", text)}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng ký</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.googleButton,
          !request && { opacity: 0.5 },
        ]}
        disabled={!request}
        onPress={() => promptAsync()}
      >
        <Text style={styles.googleText}>
          Đăng ký / Đăng nhập bằng Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.linkText}>
          Đã có tài khoản? Đăng nhập
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#e0f2f1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#00695c",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#00695c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  googleText: {
    color: "#333",
    fontWeight: "bold",
  },
  linkText: {
    color: "#00695c",
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
});
