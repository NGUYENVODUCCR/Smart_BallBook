import { useRouter } from "expo-router";
import { useContext, useState } from "react";
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

export default function ForgotPassword() {
  const { forgotPassword, loading } = useContext(AuthContext);
  const router = useRouter();

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    const value = emailOrPhone.trim();

    if (!value) {
      Alert.alert("Lỗi", "Vui lòng nhập Email hoặc SĐT");
      return;
    }

    if (sending) return;

    try {
      setSending(true);

      const res = await forgotPassword({ emailOrPhone: value });
      console.log("✅ Server trả về:", res);

      Alert.alert("✅ Thành công", "Đã gửi mã OTP", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "/ResetPassword",
              params: { emailOrPhone: value },
            }),
        },
      ]);
    } catch (e) {
      console.log("❌ Lỗi ForgotPassword:", e?.message);
      Alert.alert(
        "Lỗi",
        e?.msg || e?.response?.data?.msg || "Không kết nối được tới server"
      );
    } finally {
      setSending(false);
    }
  };

  const handleBackToLogin = () => {
    // Thay đường dẫn thành đúng tên file trong app/ 
    // VD: nếu app/login.js → "/login"
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>

      <TextInput
        placeholder="Email hoặc SĐT"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, (loading || sending) && { opacity: 0.7 }]}
        onPress={handleSendOtp}
        disabled={loading || sending}
      >
        {loading || sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Gửi OTP</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleBackToLogin} style={styles.backLogin}>
        <Text style={styles.backLoginText}>
          Nhớ mật khẩu? <Text style={styles.backLoginLink}>Quay lại đăng nhập</Text>
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
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#00695c",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  backLogin: {
    marginTop: 15,
    alignItems: "center",
  },
  backLoginText: {
    color: "#333",
  },
  backLoginLink: {
    color: "#00695c",
    fontWeight: "bold",
  },
});
