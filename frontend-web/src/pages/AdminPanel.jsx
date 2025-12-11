import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FieldManager from "./FieldManager";
import Dashboard from "./Dashboard";
const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editAcc, setEditAcc] = useState(null);

  const navigate = useNavigate();

  const fetchAccounts = async (role) => {
    if (role !== "Admin") return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts(res.data.users || res.data);
    } catch (err) {
      console.error("Load accounts error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setAdmin(u);
      fetchAccounts(u.role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleLock = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${API}/users/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts(admin?.role);
    } catch (err) {
      console.error("Toggle lock error:", err);
    }
  };


  const handleCreate = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);

    const email = f.get("email")?.trim() || null;
    const phone = f.get("phone")?.trim() || null;

    if (!email && !phone) {
      alert("Vui lòng nhập ít nhất Email hoặc Số điện thoại!");
      return;
    }

    const emailOrPhone = email || phone;
    const newAcc = {
      name: f.get("name"),
      emailOrPhone,
      password: f.get("password") || "123456",
      role: f.get("role"),
    };

    try {
      await axios.post(`${API}/auth/register`, newAcc);
      setShowCreateModal(false);
      fetchAccounts(admin?.role);
    } catch (err) {
      console.error("Create error:", err);
      alert(err.response?.data?.msg || "Lỗi tạo tài khoản!");
    }
  };

  const openEditModal = (acc) => {
    setEditAcc(acc);
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);

    const email = f.get("email")?.trim() || null;
    const phone = f.get("phone")?.trim() || null;

    if (!email && !phone) {
      alert("Vui lòng nhập ít nhất Email hoặc Số điện thoại!");
      return;
    }

    const emailOrPhone = email || phone;
    const updated = {
      name: f.get("name"),
      emailOrPhone,
      role: f.get("role"),
    };

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/users/${editAcc.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowEditModal(false);
      fetchAccounts(admin?.role);
    } catch (err) {
      console.error("Edit error:", err);
      alert(err.response?.data?.msg || "Lỗi chỉnh sửa tài khoản!");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa tài khoản này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAccounts(admin?.role);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <aside className="w-64 bg-white shadow-lg p-5 flex flex-col border-r">
        <h2 className="text-2xl font-bold text-blue-700 mb-6">⚙️ Trang Quản Lý</h2>

        <SidebarButton
          active={activeTab === "dashboard"}
          label="📊 Dashboard"
          onClick={() => setActiveTab("dashboard")}
        />

        {admin?.role === "Admin" && (
          <SidebarButton
            active={activeTab === "accounts"}
            label="👥 Quản lý tài khoản"
            onClick={() => setActiveTab("accounts")}
          />
        )}

        <SidebarButton
          active={activeTab === "fields"}
          label="⚽ Quản lý sân bóng"
          onClick={() => setActiveTab("fields")}
        />

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 mt-auto"
        >
          Đăng xuất
        </button>
      </aside>

      <main className="flex-1 min-h-0 overflow-auto p-6">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "accounts" && admin?.role === "Admin" && (
          <AccountTable
            accounts={accounts}
            loading={loading}
            toggleLock={toggleLock}
            openEditModal={openEditModal}
            deleteUser={deleteUser}
            openCreateModal={() => setShowCreateModal(true)}
          />
        )}
        {activeTab === "fields" && <FieldManager userToken={localStorage.getItem("token")} />}
      </main>

      {showCreateModal && admin?.role === "Admin" && (
        <CreateUserModal setShow={setShowCreateModal} handleCreate={handleCreate} />
      )}

      {showEditModal && editAcc && admin?.role === "Admin" && (
        <EditUserModal setShow={setShowEditModal} handleEdit={handleEdit} acc={editAcc} />
      )}
    </div>
  );
}


function SidebarButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-2 rounded-lg mb-2 transition ${active ? "bg-blue-600 text-white" : "hover:bg-blue-100"}`}
    >
      {label}
    </button>
  );
}

function AccountTable({ accounts, loading, toggleLock, openEditModal, deleteUser, openCreateModal }) {
  if (loading) return <p>Đang tải...</p>;
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-700">👥 Quản lý tài khoản</h1>
        <button
          onClick={openCreateModal}
          className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700"
        >
          ➕ Tạo tài khoản mới
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Email/Phone</th>
              <th className="p-3 text-left">Vai trò</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{acc.name}</td>
                <td className="p-3">{acc.email || acc.phone || "-"}</td>
                <td className="p-3 text-blue-600 font-medium">{acc.role}</td>
                <td className="p-3">
                  {acc.is_active === false ? (
                    <span className="text-red-600 font-semibold">Đã khóa</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Hoạt động</span>
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => toggleLock(acc.id)}
                    className={`px-3 py-1 rounded-lg text-white ${acc.is_active ? "bg-red-500" : "bg-green-600"}`}
                  >
                    {acc.is_active ? "Khóa" : "Mở khóa"}
                  </button>
                  <button
                    onClick={() => openEditModal(acc)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => deleteUser(acc.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateUserModal({ setShow, handleCreate }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-blue-700 mb-4">➕ Tạo tài khoản mới</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <input name="name" placeholder="Tên" className="w-full border px-3 py-2 rounded-lg" required />
          <input name="email" type="email" placeholder="Email (hoặc để trống nếu dùng số điện thoại)" className="w-full border px-3 py-2 rounded-lg" />
          <input name="phone" type="tel" placeholder="Số điện thoại (hoặc để trống nếu dùng email)" className="w-full border px-3 py-2 rounded-lg" />
          <input name="password" type="password" placeholder="Mật khẩu" className="w-full border px-3 py-2 rounded-lg" required />
          <select name="role" className="w-full border px-3 py-2 rounded-lg">
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShow(false)} className="px-3 py-2 bg-gray-300 rounded-lg">Hủy</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg">Tạo</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ setShow, handleEdit, acc }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold text-yellow-600 mb-4">✏️ Sửa tài khoản</h2>
        <form onSubmit={handleEdit} className="space-y-3">
          <input name="name" defaultValue={acc.name} className="w-full border px-3 py-2 rounded-lg" required />
          <input name="email" type="email" defaultValue={acc.email || ""} placeholder="Email (hoặc để trống nếu dùng phone)" className="w-full border px-3 py-2 rounded-lg" />
          <input name="phone" type="tel" defaultValue={acc.phone || ""} placeholder="Phone (hoặc để trống nếu dùng email)" className="w-full border px-3 py-2 rounded-lg" />
          <select name="role" defaultValue={acc.role} className="w-full border px-3 py-2 rounded-lg">
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShow(false)} className="px-3 py-2 bg-gray-300 rounded-lg">Hủy</button>
            <button type="submit" className="px-3 py-2 bg-yellow-600 text-white rounded-lg">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
