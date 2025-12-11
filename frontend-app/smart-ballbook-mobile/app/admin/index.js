import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
  Image,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

import AdminUsers from "./AdminUsers";
import CreateUser from "./CreateUser";
import CreateField from "./CreateField";
import AdminQR from "./AdminQR";
import Statistics from "./Statistics";
import FieldList from "./FieldList";
import AdminProfile from "./AdminProfile";

import { getAllFields } from "../../api/fieldApi";

const logoImage = require("../../assets/images/logo.png");

export default function AdminHomeScreen() {
  const { token, user, loadingStorage } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("home");
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);

  const logoAnim = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get("window").width;
  const grassCount = 50;
  const [grassLayers] = useState(
    Array.from({ length: grassCount }, () => new Animated.Value(Math.random()))
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    grassLayers.forEach((anim, i) => {
      const animateGrass = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 800 + i * 10,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800 + i * 10,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start(() => animateGrass());
      };
      animateGrass();
    });
  }, []);

  const fetchFields = async () => {
    if (!token || loadingStorage) return;
    setLoadingFields(true);
    try {
      const data = await getAllFields(token);
      setFields(data);
    } catch (err) {
      console.error("Lỗi load fields:", err);
    } finally {
      setLoadingFields(false);
    }
  };

  useEffect(() => {
    if (activeTab === "home") fetchFields();
  }, [activeTab, token, loadingStorage]);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        if (loadingFields)
          return <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 20 }} />;
        return <FieldList fields={fields} />;
      case "users":
        return <AdminUsers />;
      case "createUser":
        return <CreateUser />;
      case "createField":
        return <CreateField onCreated={fetchFields} />;
      case "qr":
        return <AdminQR />;
      case "stats":
        return <Statistics />;
      case "profile":
        return <AdminProfile />;
      default:
        return <Text>Trang chính</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header gradient + cỏ + logo + greeting */}
      <LinearGradient
        colors={["#f1c453ff", "#43a047"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.header}
      >
        {grassLayers.map((anim, index) => {
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
          const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["-5deg", "5deg"] });
          const color = ["#43a047", "#66bb6a", "#81c784", "#388e3c"][index % 4];
          return (
            <Animated.View
              key={index}
              style={[
                styles.grass,
                {
                  left: (screenWidth / grassCount) * index,
                  backgroundColor: color,
                  transform: [{ translateY }, { rotate }],
                  height: 4 + Math.random() * 3,
                  width: 2,
                },
              ]}
            />
          );
        })}

        <Animated.Image source={logoImage} style={[styles.logo, { transform: [{ scale: logoScale }] }]} />
        <Text style={styles.greeting}>Xin chào, {user?.name || user?.email}</Text>
      </LinearGradient>

      {/* Nội dung tab */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Bottom tab */}
      <View style={styles.bottomTab}>
        <TabButton icon={<FontAwesome5 name="home" size={22} />} label="Trang chủ" active={activeTab === "home"} onPress={() => setActiveTab("home")} />
        <TabButton icon={<MaterialIcons name="people" size={24} />} label="Tài khoản" active={activeTab === "users"} onPress={() => setActiveTab("users")} />
        <TabButton icon={<Ionicons name="person-add" size={24} />} label="Tạo user" active={activeTab === "createUser"} onPress={() => setActiveTab("createUser")} />
        <TabButton icon={<FontAwesome5 name="futbol" size={22} />} label="Tạo sân" active={activeTab === "createField"} onPress={() => setActiveTab("createField")} />
        <TabButton icon={<Ionicons name="qr-code-outline" size={24} />} label="QR" active={activeTab === "qr"} onPress={() => setActiveTab("qr")} />
        <TabButton icon={<MaterialIcons name="analytics" size={24} />} label="Doanh thu" active={activeTab === "stats"} onPress={() => setActiveTab("stats")} />
        <TabButton icon={<Ionicons name="person-circle-outline" size={26} />} label="Hồ sơ" active={activeTab === "profile"} onPress={() => setActiveTab("profile")} />
      </View>
    </View>
  );
}

function TabButton({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      {React.cloneElement(icon, { color: active ? "#43a047" : "#777" })}
      <Text style={[styles.tabText, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    position: "relative",
  },
  grass: { position: "absolute", bottom: 5, borderRadius: 2 },
  logo: { width: 60, height: 60, marginRight: 15, zIndex: 2 },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#fff", zIndex: 2 },
  content: { flex: 1 },
  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 70,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  tabButton: { justifyContent: "center", alignItems: "center" },
  tabText: { fontSize: 12, color: "#777", marginTop: 4 },
  activeText: { color: "#43a047", fontWeight: "bold" },
});
