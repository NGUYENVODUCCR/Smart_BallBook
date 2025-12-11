import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, googleSignIn } from "../api/auth";
import { GoogleLogin } from "@react-oauth/google";
//
export default function Login() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone || !password) {
      alert("Vui lòng nhập email/số điện thoại và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await login({ emailOrPhone, password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin" || user.role === "Manager") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error("Google credential not found");

      const res = await googleSignIn(idToken);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin" || user.role === "Manager") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Đăng nhập Google thất bại!");
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
          <h2 className="text-2xl font-bold text-green-700">Đăng nhập</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Nhập email hoặc số điện thoại"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Nhập mật khẩu"
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
            onError={() => alert("Lỗi đăng nhập Google")}
          />
        </div>

        {/* Links */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-green-700 font-semibold hover:underline"
            >
              Đăng ký
            </Link>
          </p>
          <p className="mt-2">
            <Link
              to="/forgot-password"
              className="text-green-700 font-semibold hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
