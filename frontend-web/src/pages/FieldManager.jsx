import { useState, useEffect } from "react";
import {
  getAllFields,
  createField,
  updateField,
  deleteField,
  resetField,
} from "../api/FieldService";
import axios from "axios";

export default function FieldManager({ userToken }) {
  const [fields, setFields] = useState([]);
  const [editingField, setEditingField] = useState(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    price_per_hour: "",
    image_url: "",
    description: "",
    status: "trống",
  });
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [showBox, setShowBox] = useState(false);

  const CLOUDINARY_CLOUD_NAME = "dstkeesio";
  const CLOUDINARY_UPLOAD_PRESET = "field_images";

  const fetchFields = async () => {
    if (!userToken) return;
    setLoading(true);
    try {
      const data = await getAllFields(userToken);
      const mapped = data.map((f) => ({
        id: f.id,
        name: f.name || "",
        location: f.location || "",
        price_per_hour: f.price_per_hour || 0,
        status: f.status,
        description: f.description || "",
        image_url: f.image_url || "",
      }));
      setFields(mapped);
    } catch (err) {
      console.error("Fetch fields error:", err);
      alert(err.response?.data?.msg || "Lỗi khi tải danh sách sân bóng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, [userToken]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userToken) return alert("Token không hợp lệ");

    try {
      const submitData = { ...form };

      // Upload file lên Cloudinary nếu có
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        submitData.image_url = res.data.secure_url;
      }

      if (editingField) {
        await updateField(editingField.id, submitData, userToken);
        alert("Cập nhật sân bóng thành công!");
      } else {
        await createField(submitData, userToken);
        alert("Thêm sân bóng mới thành công!");
      }


      setForm({
        name: "",
        location: "",
        price_per_hour: "",
        image_url: "",
        description: "",
        status: "trống",
      });
      setEditingField(null);
      setFile(null);
      setShowBox(false);
      fetchFields();
    } catch (err) {
      console.error("Submit field error:", err);
      alert(err.response?.data?.msg || "Lỗi khi lưu sân bóng");
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setForm({
      name: field.name,
      location: field.location,
      price_per_hour: field.price_per_hour,
      image_url: field.image_url || "",
      description: field.description || "",
      status: field.status || "trống",
    });
    setFile(null);
    setShowBox(true);
  };

  const handleDelete = async (id) => {
    if (!userToken) return;
    if (window.confirm("Bạn có chắc muốn xóa sân bóng này không?")) {
      try {
        await deleteField(id, userToken);
        alert("Xóa sân bóng thành công!");
        fetchFields();
      } catch (err) {
        console.error("Delete field error:", err);
        alert(err.response?.data?.msg || "Lỗi khi xóa sân bóng");
      }
    }
  };

  const handleReset = async (id) => {
    if (!userToken) return;
  
    if (!window.confirm("Reset sân này về TRỐNG?")) return;
  
    try {
      await resetField(id, userToken);
      alert("Reset sân thành công!");
      fetchFields();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Lỗi khi reset sân");
    }
  };
  

  if (loading) return <p>Đang tải danh sách sân bóng...</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">⚽ Quản lý Sân bóng</h1>
        <button
          onClick={() => {
            setShowBox(true);
            setEditingField(null);
            setForm({
              name: "",
              location: "",
              price_per_hour: "",
              image_url: "",
              description: "",
              status: "trống",
            });
            setFile(null);
          }}
          className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-1"
        >
          + Thêm sân bóng
        </button>
      </div>
      {showBox && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowBox(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold mb-4">
              {editingField ? "Sửa sân bóng" : "Thêm sân bóng mới"}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                name="name"
                placeholder="Tên sân"
                value={form.name}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                name="location"
                placeholder="Địa điểm"
                value={form.location}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                name="price_per_hour"
                type="number"
                placeholder="Giá/giờ"
                value={form.price_per_hour}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
              <input
                name="description"
                placeholder="Mô tả"
                value={form.description}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input
                name="image_url"
                placeholder="URL hình ảnh"
                value={form.image_url}
                onChange={handleChange}
                className="border p-2 rounded w-full"
              />
              <input type="file" onChange={handleFileChange} />

              <label className="mt-2 text-sm font-medium">Trạng thái sân</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="trống">Trống</option>
                <option value="bảo trì">Bảo trì</option>
                <option value="đã thuê">Đã thuê</option>
              </select>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  {editingField ? "Cập nhật" : "Thêm"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBox(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Tên</th>
            <th className="border px-2 py-1">Địa điểm</th>
            <th className="border px-2 py-1">Giá/giờ</th>
            <th className="border px-2 py-1">Hình ảnh</th>
            <th className="border px-2 py-1">Trạng thái</th>
            <th className="border px-2 py-1">Mô tả</th>
            <th className="border px-2 py-1">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {fields.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-4">
                Chưa có sân bóng nào
              </td>
            </tr>
          ) : (
            fields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{field.id}</td>
                <td className="border px-2 py-1">{field.name}</td>
                <td className="border px-2 py-1">{field.location}</td>
                <td className="border px-2 py-1">{field.price_per_hour}</td>
                <td className="border px-2 py-1">{field.image_url ? "*******" : ""}</td>
                <td className="border px-2 py-1">{field.status || ""}</td>
                <td className="border px-2 py-1">{field.description}</td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    onClick={() => handleEdit(field)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(field.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Xóa
                  </button>

                  {field.status === "đã thuê" && (
                    <button
                      onClick={() => handleReset(field.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Reset → Trống
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
