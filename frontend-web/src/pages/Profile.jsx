import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../api/auth";
import { ArrowLeft } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await getProfile(token);
        setUser(res.data.user);
        setAvatarPreview(res.data.user?.avatar || null);
      } catch {
        alert("Phiên đăng nhập đã hết hạn!");
        localStorage.removeItem("token");
        navigate("/");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("https://smart-ballbook.onrender.com/api/auth/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (data.avatar) {
        setAvatarPreview(data.avatar);
        setUser((prev) => ({ ...prev, avatar: data.avatar }));
      } else {
        alert("Upload ảnh thất bại!");
      }
    } catch {
      alert("Lỗi upload ảnh!");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      gender: user.gender || "",
      address: user.address || "",
      facebook: user.facebook || "",
    });
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://smart-ballbook.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setEditMode(false);
      } else {
        alert("Cập nhật thất bại!");
      }
    } catch {
      alert("Lỗi server!");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-300">
        <p className="text-lg text-gray-700 font-medium animate-pulse">
          Đang tải thông tin người dùng...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-300 p-4 relative">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md hover:bg-white transition z-50"
      >
        <ArrowLeft className="w-5 h-5 text-green-700" />
        <span className="text-sm font-semibold text-green-700">Quay lại</span>
      </button>
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-green-200 shadow-md relative">
              <img
                src={
                  avatarPreview ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="avatar"
                className="w-full h-full object-cover"
              />

              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
                  Đang tải...
                </div>
              )}
            </div>

            <label className="mt-3 cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">
              {loading ? "Đang upload..." : "Đổi ảnh đại diện"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={loading}
              />
            </label>
          </div>

          {!editMode ? (
            <>
              <h2 className="text-2xl font-bold text-center text-green-700 mb-1">
                {user.name}
              </h2>
              <p className="text-center text-gray-500 mb-6">{user.email}</p>

              <div className="space-y-3 text-gray-700">
                <InfoRow label="Giới tính" value={user.gender} />
                <InfoRow label="Số điện thoại" value={user.phone} />
                <InfoRow label="Địa chỉ" value={user.address} isMap />
                <InfoRow label="Facebook" value={user.facebook} isLink />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <Input
                label="Họ tên"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Giới tính"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
              <Input
                label="Địa chỉ"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />
              <Input
                label="Facebook"
                value={form.facebook}
                onChange={(e) =>
                  setForm({ ...form, facebook: e.target.value })
                }
              />
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3">
            {!editMode ? (
              <button
                onClick={openEdit}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
              >
                Cập nhật thông tin
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="w-full bg-gray-400 text-white py-3 rounded-xl font-semibold"
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink = false, isMap = false }) {
  if (!value) value = "Chưa cập nhật";

  const mapUrl =
    isMap && value !== "Chưa cập nhật"
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          value
        )}`
      : "";

  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium">{label}</span>

      {isMap && value !== "Chưa cập nhật" ? (
        <a
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 font-semibold hover:underline text-right"
        >
          {value}
        </a>
      ) : isLink && value !== "Chưa cập nhật" ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 font-semibold hover:underline"
        >
          Xem trang
        </a>
      ) : (
        <span className="text-green-700 font-semibold text-right">
          {value}
        </span>
      )}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}
