import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  createField,
  deleteField,
  getAllFields,
  updateField,
  updateFieldStatus,
} from "../../api/fieldApi";
import { AuthContext } from "../../context/AuthContext";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfyw4nwi4/upload";
const UPLOAD_PRESET = "product_img";

export default function CreateField({ onCreated }) {
  const { token, loadingStorage } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [status, setStatus] = useState("trống");

  const [fields, setFields] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editField, setEditField] = useState(null);

  // ---------------- FETCH FIELDS ----------------
  const fetchFields = async () => {
    if (loadingStorage || !token) return;
    setFetching(true);
    try {
      const data = await getAllFields(token);
      setFields(data);
    } catch (err) {
      console.error("FETCH FIELDS ERROR:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách sân!");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [token, loadingStorage]);

  // ---------------- PICK IMAGE ----------------
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Bạn cần cấp quyền truy cập ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setUploadingImage(true);

      try {
        const formData = new FormData();
        formData.append("file", {
          uri: localUri,
          type: "image/jpeg",
          name: "field.jpg",
        });
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        const data = await response.json();
        if (data.secure_url) {
          setImage(data.secure_url.replace("http://", "https://"));
        } else {
          Alert.alert("Lỗi", "Upload ảnh thất bại!");
        }
      } catch (err) {
        Alert.alert("Lỗi", "Upload ảnh thất bại!");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  // ---------------- RESET FORM ----------------
  const resetForm = () => {
    setName("");
    setLocation("");
    setPricePerHour("");
    setDescription("");
    setImage(null);
    setStatus("trống");
    setEditField(null);
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Bạn chưa đăng nhập");
      return;
    }

    if (!name || !location || !pricePerHour) {
      Alert.alert("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    const price = parseFloat(pricePerHour);
    if (isNaN(price)) {
      Alert.alert("Giá/giờ phải là số!");
      return;
    }

    const fieldData = {
      name,
      location,
      price_per_hour: price,
      description,
      image_url: image || null,
      status,
    };

    setLoadingSubmit(true);
    try {
      if (editField) {
        await updateField(editField.id, fieldData, token);

        await updateFieldStatus(editField.id, status, token);

        setFields((prev) =>
          prev.map((f) =>
            f.id === editField.id ? { ...f, ...fieldData } : f
          )
        );
        Alert.alert("Thành công", "Cập nhật sân thành công!");
      } else {
        const res = await createField(fieldData, token);
        const newField = res.field || fieldData;

        setFields((prev) => [newField, ...prev]);
        Alert.alert("Thành công", "Tạo sân mới thành công!");
      }

      resetForm();
      setShowModal(false);
      onCreated?.();
    } catch (err) {
      Alert.alert("Lỗi", err?.response?.data?.msg || "Thử lại sau!");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa sân này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          await deleteField(id, token);
          setFields((prev) => prev.filter((f) => f.id !== id));
        },
      },
    ]);
  };

  // ---------------- EDIT ----------------
  const handleEdit = (field) => {
    setEditField(field);
    setName(field.name);
    setLocation(field.location);
    setPricePerHour(field.price_per_hour.toString());
    setDescription(field.description || "");
    setImage(field.image_url || null);
    setStatus(field.status || "trống");
    setShowModal(true);
  };

  // ---------------- RENDER ITEM ----------------
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.image_url && (
        <Image source={{ uri: item.image_url }} style={styles.fieldImage} />
      )}
      <View style={{ padding: 12 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.info}>📍 {item.location}</Text>
        <Text style={styles.info}>💰 {item.price_per_hour}/giờ</Text>
        <Text style={styles.info}>⚙️ Trạng thái: {item.status}</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#4CAF50" }]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.btnText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#F44336" }]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => {
          resetForm();
          setShowModal(true);
        }}
      >
        <Ionicons name="add-circle" size={20} color="#fff" />
        <Text style={styles.createText}>Tạo sân mới</Text>
      </TouchableOpacity>

      {loadingStorage || fetching ? (
        <ActivityIndicator
          size="large"
          color="#2196F3"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={fields}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.label}>Tên sân *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Địa điểm *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Giá/giờ *</Text>
          <TextInput
            style={styles.input}
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Trạng thái *</Text>
          <View style={styles.statusRow}>
            {["trống", "đã thuê", "bảo trì"].map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  status === s && styles.statusBtnActive,
                ]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={{
                    color: status === s ? "#fff" : "#333",
                    fontWeight: "bold",
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            <Ionicons name="images" size={18} color="#fff" />
            <Text style={styles.uploadText}>
              {uploadingImage ? "Đang upload..." : "Chọn hình sân"}
            </Text>
          </TouchableOpacity>

          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loadingSubmit || uploadingImage}
          >
            {loadingSubmit ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {editField ? "Cập nhật sân" : "Tạo sân"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => {
              setShowModal(false);
              resetForm();
            }}
          >
            <Text style={styles.closeText}>Đóng</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 4,
  },
  fieldImage: { width: "100%", height: 180 },
  name: { fontWeight: "bold", fontSize: 16 },
  info: { fontSize: 14, color: "#555" },
  actions: { flexDirection: "row", marginTop: 8, gap: 8 },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 6,
  },
  btnText: { color: "#fff", marginLeft: 4 },

  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#43a047",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },

  createText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  modalContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    flexGrow: 1,
  },

  label: { fontWeight: "bold", marginBottom: 6 },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  statusBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
  },

  statusBtnActive: {
    backgroundColor: "#2196F3",
  },

  uploadBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  uploadText: { color: "#fff", marginLeft: 6 },

  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },

  submitBtn: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  submitText: { color: "#fff", fontWeight: "bold" },

  closeModalBtn: {
    backgroundColor: "#F44336",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  closeText: { color: "#fff", fontWeight: "bold" },
});
