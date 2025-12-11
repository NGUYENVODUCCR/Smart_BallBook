import { useState } from "react";
import { forgotPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
//
export default function ForgotPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) {
      alert("Vui lòng nhập email hoặc số điện thoại");
      return;
    }

    try {
      const res = await forgotPassword({ emailOrPhone });
      alert(res.data.msg || "OTP đã được gửi!");
      navigate("/reset-password");
    } catch (err) {
      alert(err.response?.data?.msg || "Lỗi gửi OTP. Vui lòng thử lại!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-100 to-green-300">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-5">
          <img
            src="/logo.png"
            alt="SmartBallBook Logo"
            className="w-15 h-20 mx-auto mb-2 animate-bounce-slow"
          />
          <h2 className="text-2xl font-bold text-green-700">Quên mật khẩu?</h2>
          <p className="text-gray-600 text-sm mt-1">
            Nhập email hoặc số điện thoại để nhận mã OTP khôi phục
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              placeholder="Nhập email hoặc số điện thoại"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Gửi OTP
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Nhớ mật khẩu?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold hover:underline"
          >
            Quay lại đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}
