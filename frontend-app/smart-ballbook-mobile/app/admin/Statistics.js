// app/admin/Statistics.js
import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { AuthContext } from "../../context/AuthContext";
import apiClient from "../../api/apiClient"; 
export default function Statistics() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/bookings/statistics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê doanh thu</Text>
      <FlatList
        data={stats}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.date}: {item.revenue} VND</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});
