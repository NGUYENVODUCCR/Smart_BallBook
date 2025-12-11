import { Link } from "react-router-dom";
//
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-200 to-green-400 flex flex-col">
      <nav className="flex justify-between items-center p-6 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.png"
            alt="SmartBallBook Logo"
             className="w-15 h-20 animate-bounce-slow"></img>
          <h1 className="text-2xl font-bold text-green-700 tracking-tight">
            SmartBallBook
          </h1>
        </div>
        <div className="space-x-4">
          <Link
            to="/login"
            className="text-green-700 font-medium hover:text-green-900 transition"
          >
            Đăng nhập
          </Link>
          <Link
            to="/register"
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition shadow"
          >
            Đăng ký
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center justify-center text-center flex-grow px-6 py-20">
        <h2 className="heading">Giải pháp đặt sân bóng thông minh ⚽</h2>
        <p className="subheading max-w-2xl mb-10">
          Kết nối đam mê – Dễ dàng tìm và đặt sân bóng đá chỉ trong vài cú nhấp.
          SmartBallBook giúp bạn tiết kiệm thời gian, tập trung vào trận cầu đỉnh cao!
        </p>
        <div className="space-x-4">
          <Link to="/register" className="btn-primary">
            Bắt đầu ngay
          </Link>
          <Link to="/login" className="btn-outline">
            Đăng nhập
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16 text-center">
        <h3 className="heading">Tại sao chọn SmartBallBook?</h3>
        <div className="grid md:grid-cols-3 gap-8 mt-10 px-8 md:px-20">
          <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <span className="text-5xl">⚡</span>
            <h4 className="text-xl font-semibold mt-3 mb-2">Đặt sân nhanh chóng</h4>
            <p className="text-gray-600">
              Tìm sân gần bạn và đặt trong vài giây – không cần gọi điện.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <span className="text-5xl">💰</span>
            <h4 className="text-xl font-semibold mt-3 mb-2">Giá minh bạch</h4>
            <p className="text-gray-600">
              So sánh và chọn giá tốt nhất cho khung giờ bạn mong muốn.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
            <span className="text-5xl">📱</span>
            <h4 className="text-xl font-semibold mt-3 mb-2">Quản lý dễ dàng</h4>
            <p className="text-gray-600">
              Xem lịch đặt sân, hủy hoặc đổi sân nhanh chóng ngay trên điện thoại.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-green-700 text-white text-center py-6 mt-auto">
        © {new Date().getFullYear()} SmartBallBook – Kết nối đam mê bóng đá Việt Nam ⚽
      </footer>
    </div>
  );
}
