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

export default function ResetPassword({ route, navigation }) {
  const { resetPassword, loading } = useContext(AuthContext);

  const initialEmailOrPhone = route?.params?.emailOrPhone || "";
  const [emailOrPhone, setEmailOrPhone] = useState(initialEmailOrPhone);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    const safeEmailOrPhone = emailOrPhone.trim();
    const safeOtp = otp.trim();
    const safePassword = newPassword.trim();

    if (!safeEmailOrPhone || !safeOtp || !safePassword) {
      Alert.alert(
        "Lỗi",
        "Vui lòng nhập đầy đủ email hoặc số điện thoại, OTP và mật khẩu mới"
      );
      return;
    }

    try {
      await resetPassword({
        emailOrPhone: safeEmailOrPhone,
        otp: safeOtp,
        newPassword: safePassword,
      });

      Alert.alert("✅ Thành công", "Đổi mật khẩu thành công", [
        {
          text: "OK",
          onPress: () => {
            // Reset stack về Login
            if (navigation && typeof navigation.reset === "function") {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert(
        "Lỗi",
        e?.msg || e?.response?.data?.msg || "Có lỗi xảy ra"
      );
    }
  };

  const handleBackToLogin = () => {
    if (navigation && typeof navigation.reset === "function") {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>

      <TextInput
        placeholder="Email hoặc số điện thoại"
        value={emailOrPhone}
        onChangeText={setEmailOrPhone}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mã OTP"
        value={otp}
        onChangeText={setOtp}
        style={styles.input}
        keyboardType="number-pad"
      />

      <TextInput
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleReset}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        )}
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
