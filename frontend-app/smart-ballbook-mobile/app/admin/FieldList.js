// app/user/UserHomeFields.js
import React, { useState, useContext, useEffect } from "react";
import { searchFieldByAI } from "../../api/fieldApi";
import useVoice from "../../hooks/useVoice";

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import Icon from "react-native-vector-icons/Feather";
import axios from "axios";

export default function UserHomeFields({ fields = [], setFields, onCreateBooking }) {
  const { user, token } = useContext(AuthContext);

  const [selectedField, setSelectedField] = useState(null);
  const [bookingField, setBookingField] = useState(null);
  const [bookingData, setBookingData] = useState({ field: null, hours: 1, amount: 0 });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [aiResults, setAIResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);


  const PAYMENT_ACCOUNT = "0207729018888";
  const PAYMENT_BANK = "MB Bank";
  const QR_IMAGE =
    "https://api.vietqr.io/image/970422-0207729018888-qr_only.png?accountName=TRAN%20VAN%20ABC";

  // Fetch bookings từ server dựa trên role
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!token) return;

        let url = "http://192.168.1.139:5000/api/bookings";
        if (user.role.toLowerCase() === "user") {
          url = "http://192.168.1.139:5000/api/bookings/my"; 
        }

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mapped = res.data.map((b) => ({
          ...b,
          amount: b.amount ?? ((b.field?.price_per_hour ?? 0) * (b.hours ?? 1)),
          field: b.field ?? { id: 0, name: "Không xác định", price_per_hour: 0 },
          user: b.user ?? { id: 0, name: "Unknown" },
          status: b.status ?? "pending",
        }));

        setPendingBookings(mapped);
      } catch (err) {
        console.error("Fetch bookings error:", err.response?.status, err.message);
      }
    };
    fetchBookings();
  }, [token, user]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!searchText.trim()) {
        setAIResults([]);
        return;
      }

      setSearchLoading(true);

      const results = await searchFieldByAI(searchText);

      setAIResults(results);
      setSearchLoading(false);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchText]);


  const openGoogleMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const getFieldStatus = (field) => {
    const pending = pendingBookings.find(
      (b) => b.field.id === field.id && b.status === "pending"
    );
    if (pending) return "Đang chờ thanh toán";
    return field.status || "trống";
  };

  const handleConfirmBooking = () => {
    const newPending = {
      id: Date.now(),
      field: bookingData.field ?? { id: 0, name: "Không xác định", price_per_hour: 0 },
      hours: bookingData.hours,
      amount: bookingData.amount,
      user: { id: user.id, name: user.name },
      status: "pending",
    };

    setPendingBookings((prev) => [...prev, newPending]);
    setShowBookingModal(false);
    setBookingField(newPending);

    if (setFields) {
      setFields((prev) =>
        prev.map((f) =>
          f.id === newPending.field.id ? { ...f, status: "đang chờ thanh toán" } : f
        )
      );
    }

    setSelectedField((prev) =>
      prev && prev.id === newPending.field.id ? { ...prev } : prev
    );

    if (onCreateBooking) onCreateBooking(newPending);
  };

  const handlePayBooking = async () => {
    const amountNumber = Number(amountInput);
    if (amountNumber !== (bookingField?.amount ?? 0)) {
      Alert.alert("❌ Số tiền không đúng!");
      return;
    }

    try {
      setLoading(true);
      const body = {
        field_id: bookingField.field.id,
        date: new Date().toISOString().split("T")[0],
        start_time: "18:00",
        end_time: `${18 + bookingField.hours}:00`,
        total_price: bookingField.amount,
        status: "paid",
      };

      await axios.post("http://192.168.1.139:5000/api/bookings", body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingBookings((prev) =>
        prev.map((b) =>
          b.id === bookingField.id ? { ...b, status: "paid" } : b
        )
      );

      if (setFields) {
        setFields((prev) =>
          prev.map((f) =>
            f.id === bookingField.field.id ? { ...f, status: "đã thuê" } : f
          )
        );
      }

      setBookingField({ ...bookingField, status: "paid" });
      setAmountInput("");
      Alert.alert("✅ Thanh toán thành công!");
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi thanh toán", err.message);
    } finally {
      setLoading(false);
    }
  };

  const { WebViewVoice, startVoice, result } = useVoice();

  useEffect(() => {
    if (result) {
      setSearchText(result);
      searchFieldByAI(result).then(setAIResults);   // 🔥 gọi backend lấy kết quả thật
    }
  }, [result]);
  


  const filteredFields =
    searchText.trim().length > 0 && aiResults.length > 0
      ? aiResults
        .map((r) => fields.find((f) => f.id === r.id))
        .filter(Boolean)
      : fields;


  const renderItem = ({ item }) => {
    const status = getFieldStatus(item).toLowerCase();
    const role = user?.role?.toLowerCase();
    const isBookable = status === "trống" && role !== "admin" && role !== "manager";

    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelectedField(item)}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View
            style={[
              styles.image,
              { backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
            ]}
          >
            <Text style={{ color: "#fff" }}>Không có ảnh</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => openGoogleMaps(item.location)}
          >
            <Icon name="map-pin" size={16} color="#3b82f6" />
            <Text style={styles.locationText}>{item.location}</Text>
          </TouchableOpacity>

          <Text style={styles.price}>
            💰 {(item.price_per_hour ?? 0).toLocaleString()} VND/giờ
          </Text>

          <Text
            style={[
              styles.status,
              status === "trống" ? styles.empty : status === "đã thuê" ? styles.full : styles.pending,
            ]}
          >
            {status === "trống" ? "Trống" : status === "đã thuê" ? "Đã thuê" : "Đang chờ thanh toán"}
          </Text>

          {isBookable && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#22c55e" }]}
              onPress={() => {
                setBookingData({
                  field: item,
                  hours: 1,
                  amount: item.price_per_hour ?? 0,
                });
                setShowBookingModal(true);
              }}
            >
              <Text style={styles.buttonText}>Đặt sân</Text>
            </TouchableOpacity>
          )}

          {(role === "manager" || role === "admin") && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#43a047" }]}
              onPress={() => setSelectedField(item)}
            >
              <Text style={styles.buttonText}>Check thông tin</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {WebViewVoice}
      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#6b7280" style={{ marginHorizontal: 8 }} />

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sân..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            searchFieldByAI(text).then(setAIResults);
          }}          
        />

        <TouchableOpacity onPress={startVoice} style={styles.voiceButton}>
          <Icon name="mic" size={20} color="#2563eb" />
        </TouchableOpacity>

      </View>

      <FlatList
        data={filteredFields}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* Modal đặt sân */}
      <Modal visible={showBookingModal} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setShowBookingModal(false)} style={styles.modalClose}>
              <Text>✖</Text>
            </TouchableOpacity>

            <Text style={styles.name}>Đặt sân: {bookingData.field?.name}</Text>
            <Text>
              Giá/giờ: {(bookingData.field?.price_per_hour ?? 0).toLocaleString()} VND
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={bookingData.hours.toString()}
              onChangeText={(text) =>
                setBookingData({
                  ...bookingData,
                  hours: Number(text),
                  amount: Number(text) * (bookingData.field?.price_per_hour ?? 0),
                })
              }
            />

            <Text>Tổng tiền: {(bookingData.amount ?? 0).toLocaleString()} VND</Text>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#22c55e", marginTop: 10 }]}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.buttonText}>Xác nhận đặt sân</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal thanh toán */}
      <Modal visible={!!bookingField && bookingField.status === "pending"} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity onPress={() => setBookingField(null)} style={styles.modalClose}>
              <Text>✖</Text>
            </TouchableOpacity>

            {bookingField && (
              <>
                <Text style={styles.name}>Thanh toán: {bookingField.field?.name}</Text>
                <Text>Số giờ: {bookingField.hours ?? 0}</Text>
                <Text>Tổng tiền: {(bookingField.amount ?? 0).toLocaleString()} VND</Text>

                <Text style={{ marginTop: 10 }}>📌 Quét QR để thanh toán:</Text>
                <Image
                  source={{ uri: QR_IMAGE }}
                  style={{ width: 200, height: 200, alignSelf: "center", marginVertical: 10 }}
                />
                <Text>Số tài khoản: {PAYMENT_ACCOUNT} ({PAYMENT_BANK})</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Nhập số tiền đã chuyển"
                  value={amountInput}
                  onChangeText={setAmountInput}
                />

                <TouchableOpacity
                  onPress={handlePayBooking}
                  style={[styles.button, { backgroundColor: "#22c55e", marginTop: 10 }]}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Modal xem chi tiết sân + bookings */}
      <Modal visible={!!selectedField} transparent animationType="fade">
        <ScrollView contentContainerStyle={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setSelectedField(null)} style={styles.modalClose}>
              <Text>✖</Text>
            </TouchableOpacity>

            {selectedField && (
              <>
                <Text style={styles.name}>{selectedField.name}</Text>
                {selectedField.image_url && (
                  <Image source={{ uri: selectedField.image_url }} style={styles.image} />
                )}
                <Text>Vị trí: {selectedField.location}</Text>
                <Text>Giá/giờ: {(selectedField.price_per_hour ?? 0).toLocaleString()} VND</Text>
                <Text>Trạng thái: {getFieldStatus(selectedField)}</Text>

                {(user.role.toLowerCase() === "manager" || user.role.toLowerCase() === "admin") && (
                  <>
                    <Text style={{ marginTop: 10, fontWeight: "bold" }}>Danh sách đặt sân:</Text>
                    {pendingBookings
                      .filter((b) => b.field.id === selectedField.id)
                      .map((b) => (
                        <View
                          key={b.id}
                          style={{ paddingVertical: 4, borderBottomWidth: 1, borderColor: "#ddd" }}
                        >
                          <Text>Người đặt: {b.user?.name ?? "Unknown"}</Text>
                          <Text>Số giờ: {b.hours ?? 0}</Text>
                          <Text>Tổng tiền: {(b.amount ?? 0).toLocaleString()} VND</Text>
                          <Text>Trạng thái: {b.status ?? "pending"}</Text>
                        </View>
                      ))}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { margin: 12, borderRadius: 12, backgroundColor: "#fff", elevation: 3, overflow: "hidden" },
  image: { width: "100%", height: 160, borderRadius: 12 },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: "bold" },
  price: { fontSize: 14, marginBottom: 2 },
  status: { fontSize: 14, fontWeight: "bold" },
  empty: { color: "green" },
  full: { color: "red" },
  pending: { color: "orange" },
  locationContainer: { flexDirection: "row", marginBottom: 4, alignItems: "center" },
  locationText: { color: "#3b82f6", marginLeft: 4, textDecorationLine: "underline" },
  button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", paddingVertical: 20 },
  modalContainer: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalClose: { position: "absolute", top: 10, right: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 8, marginVertical: 8 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  searchInput: {
    flex: 1,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 15,
  },

  voiceButton: {
    padding: 6,
  }

});
