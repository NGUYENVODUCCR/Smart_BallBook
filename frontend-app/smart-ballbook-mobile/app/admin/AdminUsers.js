import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { getAllUsers, toggleUserStatus, deleteUser } from "../../api/userApi";

export default function AdminUsers() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("Lỗi khi load users:", err.response?.data || err.message || err);
      Alert.alert("Lỗi", "Không thể tải danh sách người dùng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    if (!token) return;
    try {
      await toggleUserStatus(id, token);
      fetchUsers();
    } catch (err) {
      console.error("Lỗi khi toggle user:", err.response?.data || err.message || err);
      Alert.alert("Lỗi", "Không thể thay đổi trạng thái user.");
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa người dùng này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(id, token);
              fetchUsers();
            } catch (err) {
              console.error("Lỗi khi xóa user:", err.response?.data || err.message || err);
              Alert.alert("Lỗi", "Không thể xóa user.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name[0]?.toUpperCase()}</Text>
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.userRoleContainer}>
          <FontAwesome name="user-circle" size={14} color="#555" />
          <Text style={styles.userRole}>{item.role.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: item.is_active ? "#FF9800" : "#4CAF50" }]}
          onPress={() => handleToggle(item.id)}
        >
          <Ionicons name={item.is_active ? "lock-closed" : "lock-open"} size={18} color="#fff" />
          <Text style={styles.actionText}>{item.is_active ? "Khóa" : "Mở"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#F44336" }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.actionText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quản lý tài khoản</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Không có người dùng nào</Text>}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#333", textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  userInfo: { marginBottom: 12 },
  userHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#43a047",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontWeight: "bold", fontSize: 20 },
  userName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 2 },
  userRoleContainer: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 },
  userRole: { fontSize: 12, color: "#555" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: { color: "#fff", fontWeight: "bold", marginLeft: 6 },
});
