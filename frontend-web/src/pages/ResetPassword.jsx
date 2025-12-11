import { useState } from "react";
import { resetPassword } from "../api/auth";
import { useNavigate } from "react-router-dom";
//
export default function ResetPassword() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailOrPhone || !otp || !newPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await resetPassword({ emailOrPhone, otp, newPassword });
      alert(res.data.msg);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Lỗi đặt lại mật khẩu");
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
          <h2 className="text-2xl font-bold text-green-700">Đặt lại mật khẩu</h2>
          <p className="text-sm text-gray-500 mt-1">
            Nhập thông tin để đặt lại mật khẩu của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã OTP
            </label>
            <input
              type="text"
              placeholder="Nhập mã OTP đã gửi"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Xác nhận đặt lại
          </button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-5">
          <button
            onClick={() => navigate("/login")}
            className="text-green-700 font-semibold hover:underline"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
