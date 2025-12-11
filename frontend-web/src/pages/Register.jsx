import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register, googleSignIn } from "../api/auth";
import { GoogleLogin } from "@react-oauth/google";
//
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.password || (!form.email && !form.phone)) {
      alert(
        "Vui lòng nhập họ tên, mật khẩu và ít nhất một trong Email hoặc Số điện thoại"
      );
      return;
    }

    setLoading(true);
    try {
      const emailOrPhone = form.email || form.phone;
      const payload = {
        name: form.name,
        emailOrPhone,
        password: form.password,
      };

      await register(payload);
      alert("🎉 Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Lỗi đăng ký. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("Google credential not found");

      const res = await googleSignIn(idToken);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("🎉 Đăng ký/Đăng nhập bằng Google thành công!");

      const user = res.data.user;
      if (user.role === "Admin" || user.role === "Manager") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Lỗi đăng ký với Google!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-300 relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 right-5 bg-white shadow px-4 py-2 rounded-lg text-green-700 font-semibold hover:bg-green-50 transition"
      >
        🏠 Về trang chủ
      </button>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-5">
          <img
            src="/logo.png"
            alt="SmartBallBook Logo"
            className="w-15 h-20 mx-auto mb-2 animate-bounce-slow"
          />
          <h2 className="text-2xl font-bold text-green-700">
            Tạo tài khoản SmartBallBook
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              name="name"
              type="text"
              placeholder="Nhập họ tên của bạn"
              value={form.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (hoặc bỏ trống nếu nhập số điện thoại)
            </label>
            <input
              name="email"
              type="email"
              placeholder="Nhập email (tùy chọn)"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại (hoặc bỏ trống nếu nhập email)
            </label>
            <input
              name="phone"
              type="tel"
              placeholder="Nhập số điện thoại (tùy chọn)"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              name="password"
              type="password"
              placeholder="Tạo mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500 text-sm">hoặc</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => alert("Lỗi đăng ký Google")}
          />
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold hover:underline"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
