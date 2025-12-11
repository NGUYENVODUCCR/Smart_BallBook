import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext.js";
import ProfileScreen from "./profile.js";
import CreateField from "./CreateField.js";
import UserHomeFields from "./UserHomeFields.js";
import { getAllFields } from "../../api/fieldApi.js";
import { LinearGradient } from "expo-linear-gradient"; // cần cài: expo install expo-linear-gradient

const logoImage = require("../../assets/images/logo.png");

export default function UserHomeScreen() {
  const router = useRouter();
  const { user, loadingStorage } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("home");
  const [fields, setFields] = useState([]);
  const [loadingFields, setLoadingFields] = useState(true);

  const logoAnim = useRef(new Animated.Value(0)).current;

  // Cỏ động
  const screenWidth = Dimensions.get("window").width;
  const grassCount = 50;
  const [grassLayers] = useState(
    Array.from({ length: grassCount }, () => new Animated.Value(Math.random()))
  );

  useEffect(() => {
    // Logo nhún
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

    // Cỏ chuyển động
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

  useEffect(() => {
    if (!user) return;
    const fetchFields = async () => {
      try {
        setLoadingFields(true);
        const data = await getAllFields(user.token);
        setFields(data);
      } catch (err) {
        console.error("Lỗi load fields:", err);
      } finally {
        setLoadingFields(false);
      }
    };
    fetchFields();
  }, [user]);

  useEffect(() => {
    if (!loadingStorage && !user) {
      router.replace("/login");
    }
  }, [loadingStorage, user]);

  if (loadingStorage || (activeTab === "home" && loadingFields)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (!user) return null;

  const role = user.role?.toLowerCase();

  const handleCreateBooking = (booking) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === booking.field.id ? { ...f, status: "Đang chờ thanh toán" } : f
      )
    );
  };

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#4fc3f7", "#43a047"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.header}
      >
        {/* Cỏ động phủ ngang header */}
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

        {/* Logo */}
        <Animated.Image
          source={logoImage}
          style={[styles.logo, { transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />

        {/* Greeting */}
        <Text style={styles.greeting}>Xin chào, {user.name || user.email}</Text>
      </LinearGradient>

      {/* Nội dung tab */}
      <View style={styles.content}>
        {activeTab === "home" && (
          <UserHomeFields
            fields={fields}
            setFields={setFields}
            onCreateBooking={handleCreateBooking}
          />
        )}
        {activeTab === "profile" && <ProfileScreen />}
        {activeTab === "createField" && role === "manager" && <CreateField />}
        {activeTab === "settings" && <Text style={styles.title}>Cài đặt</Text>}
      </View>

      {/* Bottom tab */}
      <View style={styles.bottomTab}>
        <TabButton
          icon={<FontAwesome5 name="home" size={22} />}
          label="Trang chủ"
          active={activeTab === "home"}
          onPress={() => setActiveTab("home")}
        />
        <TabButton
          icon={<Ionicons name="person-circle-outline" size={26} />}
          label="Hồ sơ"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
        />
        {role === "manager" && (
          <TabButton
            icon={<FontAwesome5 name="futbol" size={22} />}
            label="Tạo sân"
            active={activeTab === "createField"}
            onPress={() => setActiveTab("createField")}
          />
        )}
        <TabButton
          icon={<MaterialIcons name="settings" size={24} />}
          label="Cài đặt"
          active={activeTab === "settings"}
          onPress={() => setActiveTab("settings")}
        />
      </View>
    </View>
  );
}

function TabButton({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      {React.cloneElement(icon, { color: active ? "#2196F3" : "#777" })}
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
  grass: {
    position: "absolute",
    bottom: 5,
    borderRadius: 2,
  },
  logo: { width: 60, height: 60, marginRight: 15, zIndex: 2 },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#fff", zIndex: 2 },
  content: { flex: 1 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
