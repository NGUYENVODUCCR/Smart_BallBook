import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useContext, useEffect, useState } from "react";
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

export default function LoginScreen() {
  const { login, googleSignIn } = useContext(AuthContext);
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= GOOGLE AUTH ================= */
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      "596176186305-u8olpm6bn0mpek5cfv106lf4irpm2t6n.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.authentication?.accessToken;
      if (token) handleGoogleLogin(token);
    }
  }, [response]);

  // Hàm redirect theo role
const redirectByRole = (user) => {
  const role = user?.role?.toLowerCase();

  if (role === "admin") {
    router.replace("/admin"); // admin dashboard
  } else if (role === "manager" || role === "user") {
    router.replace("/user"); // user dashboard
  } else {
    router.replace("/login"); // fallback
  }
};

  const handleGoogleLogin = async (accessToken) => {
    try {
      const data = await googleSignIn(accessToken);
      const user = data?.user || data?.data?.user;

      if (!user) throw { msg: "Không nhận được user" };

      Alert.alert("✅ Thành công", "Đăng nhập Google thành công!", [
        { text: "OK", onPress: () => redirectByRole(user) },
      ]);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.msg ||
          err?.response?.data?.msg ||
          "Đăng nhập Google thất bại"
      );
    }
  };

  /* ================= LOGIN NORMAL ================= */
  const handleLogin = async () => {
    const safeEmailOrPhone = emailOrPhone?.trim();
    const safePassword = password?.trim();

    if (!safeEmailOrPhone || !safePassword) {
      Alert.alert("Lỗi", "Vui lòng nhập email/sđt và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const data = await login(safeEmailOrPhone, safePassword);
      const user = data?.user;

      if (!user) throw { msg: "Không nhận được thông tin user" };

      Alert.alert("✅ Thành công", "Đăng nhập thành công!", [
        { text: "OK", onPress: () => redirectByRole(user) },
      ]);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.msg ||
          err?.response?.data?.msg ||
          "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập SmartBallBook</Text>

      <TextInput
        style={styles.input}
        placeholder="Email hoặc số điện thoại"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, !request && { opacity: 0.5 }]}
        onPress={() => promptAsync()}
        disabled={!request}
      >
        <Text style={styles.googleText}>Đăng nhập với Google</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
          <Text style={styles.linkText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
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
  links: {
    marginTop: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#00695c",
    fontWeight: "bold",
    marginTop: 5,
  },
});
