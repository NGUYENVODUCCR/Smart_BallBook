// app/admin/AdminQR.js
import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient"; // file API gọi axios

export default function AdminQR() {
  const { token } = useContext(AuthContext);
  const [bookingId, setBookingId] = useState("");
  const [qrData, setQrData] = useState(null);

  const handleCreateQR = async () => {
    if (!bookingId) {
      Alert.alert("Lỗi", "Nhập bookingId");
      return;
    }

    try {
      const res = await apiClient.post(`/qr/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrData(res.data.qr);
      Alert.alert("Thành công", "QR tạo thành công");
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", err?.response?.data?.msg || "Tạo QR thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý QR</Text>

      <TextInput
        style={styles.input}
        placeholder="Booking ID"
        value={bookingId}
        onChangeText={setBookingId}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateQR}>
        <Text style={styles.buttonText}>Tạo QR</Text>
      </TouchableOpacity>

      {qrData && (
        <View style={{ marginTop: 20 }}>
          <Text>QR Code Data:</Text>
          <Text>{JSON.stringify(qrData)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  button: { backgroundColor: "#2196F3", padding: 12, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
