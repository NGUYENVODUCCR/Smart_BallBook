import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFields, searchFieldByAI } from "../api/FieldService";
import axios from "axios";
import { Menu, MapPin, Mic } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
//
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [bookingField, setBookingField] = useState(null);
  const [checkField, setCheckField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    field: null,
    hours: 1,
    amount: 0,
  });
  const [pendingBookings, setPendingBookings] = useState([]);

  const PAYMENT_ACCOUNT = "0123456789";
  const PAYMENT_BANK = "Ngân hàng A";

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchFields = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const data = await getAllFields(token);
        setFields(data);
      } catch (err) {
        console.error("Fetch fields error:", err);
      }
    };

    fetchFields();
  }, []);

  const openGoogleMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCheckField = async (field) => {
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await axios.get(
        `http://localhost:5000/api/bookings/field/${field.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCheckField(res.data);
    } catch (err) {
      console.error(err);
      setCheckField(null);
      if (err.response?.status === 404) {
        setError("Chưa có booking cho sân này");
      } else {
        setError(err.response?.data?.msg || err.message || "Fetch failed");
      }
    }
  };

  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Trình duyệt không hỗ trợ Speech Recognition");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setSearchKeyword(text);

      const token = localStorage.getItem("token");

      try {
        const results = await searchFieldByAI(text, token);
        setFields(results);
      } catch (err) {
        console.error("Voice search error:", err);
      }
    };

    recognition.onerror = (e) => console.error("Speech error:", e);
  };

  const calcHours = (booking) => {
    if (!booking) return "-";
    const start = booking.start_time.split(":").map(Number);
    const end = booking.end_time.split(":").map(Number);
    return end[0] - start[0];
  };

  const handleConfirmBooking = () => {
    const newPending = {
      id: Date.now(),
      field: bookingData.field,
      hours: bookingData.hours,
      amount: bookingData.amount,
      status: "pending",
    };
    setPendingBookings((prev) => [...prev, newPending]);
    setShowBookingModal(false);
    setBookingField(newPending);
  };

  const handlePayBooking = async (booking) => {
    if (!booking?.field?.id || !user?.id) return;

    try {
      setLoading(true);

      const actualAmountReceived = parseInt(
        prompt(`Nhập số tiền bạn đã chuyển (để xác nhận): ${booking.amount} ₫`)
      );

      if (actualAmountReceived !== booking.amount) {
        alert("Số tiền thanh toán không đúng! Không thể xác nhận đặt sân.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const body = {
        field_id: booking.field.id,
        date: new Date().toISOString().split("T")[0],
        start_time: "18:00",
        end_time: `${18 + booking.hours}:00`,
        total_price: booking.amount,
        status: "paid",
      };

      await axios.post("http://localhost:5000/api/bookings", body, {
        headers: { Authorization: `Bearer ${token}` },
      });


      setPendingBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: "paid" } : b))
      );

      setFields((prev) =>
        prev.map((f) =>
          f.id === booking.field.id ? { ...f, status: "đã thuê" } : f
        )
      );

      setBookingField((prev) => (prev ? { ...prev, status: "paid" } : null));

      alert("✅ Thanh toán thành công, sân đã được đặt!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const getFieldStatus = (field) => {
    const pending = pendingBookings.find(
      (b) => b.field.id === field.id && b.status === "pending"
    );
    if (pending) return "Đang chờ thanh toán";
    if (!field.status) return "trống";
    return field.status;
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-20 bg-white shadow-md px-6 flex justify-between items-center relative">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-15 h-20 animate-bounce-slow"
          />
          <h1 className="text-xl font-bold text-green-700">
            SmartBallBook Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-4 relative">
          {user && (
            <p className="text-gray-700 font-medium">
              👋 Xin chào,{" "}
              <span className="text-green-700 font-semibold">
                {user.name || user.email}
              </span>
            </p>
          )}

          {user && user.role !== "Admin" && user.role !== "Manager" && (
            <button
              onClick={handleLogout}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Đăng xuất
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-green-100 to-green-300 min-h-0">
        <div className="flex items-center justify-between mb-6 relative">
          <h2 className="text-3xl font-bold text-green-700">
            Các sân bóng hiện có
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm sân theo tên..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              onClick={startVoiceSearch}
              className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition"
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>


          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-white transition"
            >
              <Menu className="w-7 h-7 text-green-700" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-lg w-60 z-50 border overflow-hidden">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  👤 Tài khoản của tôi
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/fields");
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100"
                >
                  ⚽ Danh sách sân bóng
                </button>
                <button onClick={() => navigate("/scan-qr")} className="btn btn-primary">
                  Quét QR Check-in
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
          {fields.length === 0 ? (
            <p>Chưa có sân bóng nào</p>
          ) : (
            fields
              .filter(f => {
                const k = searchKeyword.toLowerCase();
                return f.name.toLowerCase().includes(k) ||
                  f.location.toLowerCase().includes(k);
              })
              .map((field) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedField(field)}
                  className="bg-white rounded-lg shadow-md flex flex-col items-center p-2 hover:scale-105 transition-transform cursor-pointer"
                >
                  <img
                    src={field.image_url || "https://via.placeholder.com/150"}
                    alt={field.name}
                    className="w-full h-40 object-cover rounded-md"
                  />

                  <div className="flex items-center justify-between w-full mt-2 px-2">
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800">{field.name}</p>
                      <p
                        className={`text-sm font-medium ${getFieldStatus(field) === "trống"
                          ? "text-green-600"
                          : getFieldStatus(field) === "đã thuê"
                            ? "text-red-600"
                            : "text-yellow-600"
                          }`}
                      >
                        {getFieldStatus(field)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {getFieldStatus(field) === "trống" &&
                        user &&
                        user.role !== "Admin" &&
                        user.role !== "Manager" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBookingData({
                                field,
                                hours: 1,
                                amount: field.price_per_hour,
                              });
                              setShowBookingModal(true);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                          >
                            Đặt sân
                          </button>
                        )}

                      {user &&
                        (user.role === "Admin" || user.role === "Manager") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckField(field);
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Check thông tin
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </main>

      {/* Modal Chi tiết sân */}
      {selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setSelectedField(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <img
              src={selectedField.image_url || "https://via.placeholder.com/300"}
              alt={selectedField.name}
              className="w-full h-60 object-cover rounded-md mb-4"
            />

            <h3 className="text-xl font-semibold mb-2">{selectedField.name}</h3>

            <p
              onClick={() => openGoogleMaps(selectedField.location)}
              className="text-blue-600 mb-1 flex items-center gap-2 cursor-pointer hover:underline"
            >
              <MapPin className="w-4 h-4" />
              {selectedField.location}
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Giá/giờ:</span>{" "}
              {selectedField.price_per_hour.toLocaleString()} ₫
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Trạng thái:</span>{" "}
              <span
                className={`font-semibold ${getFieldStatus(selectedField) === "trống"
                  ? "text-green-600"
                  : getFieldStatus(selectedField) === "đã thuê"
                    ? "text-red-600"
                    : "text-yellow-600"
                  }`}
              >
                {getFieldStatus(selectedField)}
              </span>
            </p>

            <p className="text-gray-700">
              <span className="font-semibold">Mô tả:</span>{" "}
              {selectedField.description}
            </p>

            <button
              onClick={() => openGoogleMaps(selectedField.location)}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              📍 Xem trên Google Maps
            </button>
          </div>
        </div>
      )}

      {/* Modal Đặt sân */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Đặt sân: {bookingData.field.name}
            </h3>

            <p className="text-gray-700 mb-2">
              Giá/giờ: {bookingData.field.price_per_hour.toLocaleString()} ₫
            </p>

            <div className="mb-2">
              <label className="block text-gray-700 font-medium mb-1">
                Số giờ thuê
              </label>
              <input
                type="number"
                min="1"
                value={bookingData.hours}
                onChange={(e) =>
                  setBookingData({
                    ...bookingData,
                    hours: Number(e.target.value),
                    amount:
                      Number(e.target.value) * bookingData.field.price_per_hour,
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>

            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Tổng tiền:</span>{" "}
              {bookingData.amount.toLocaleString()} ₫
            </p>

            <button
              onClick={handleConfirmBooking}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Xác nhận đặt sân
            </button>
          </div>
        </div>
      )}

      {/* Modal Thanh toán / Checking */}
      {bookingField && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setBookingField(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">
              {bookingField.status === "pending"
                ? `Thanh toán sân: ${bookingField.field.name}`
                : `Sân đã được đặt: ${bookingField.field.name}`}
            </h3>

            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Số giờ:</span> {bookingField.hours}
            </p>

            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Tổng tiền:</span>{" "}
              {bookingField.amount.toLocaleString()} ₫
            </p>

            {bookingField.status === "pending" && (
              <>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Số tài khoản:</span>{" "}
                  {PAYMENT_ACCOUNT} ({PAYMENT_BANK})
                </p>

                <div className="flex justify-center mt-4 mb-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ChuyenKhoan:${bookingField.amount}VND_toi_tai_khoan_${PAYMENT_ACCOUNT}`}
                    alt="QR Code"
                    className="w-32 h-32"
                  />
                </div>

                <button
                  onClick={() => handlePayBooking(bookingField)}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  disabled={loading}
                >
                  {loading ? "Đang xác nhận..." : "Thanh toán và xác nhận"}
                </button>
              </>
            )}

            {bookingField?.status === "paid" && (
              <div className="text-center mt-4 flex flex-col items-center">
                <p className="text-green-600 font-semibold mb-2">
                  ✅ Thanh toán thành công, sân đã được đặt!
                </p>

                <p className="text-gray-700 mb-2">👉 Đây là mã QR check-in của bạn:</p>

                <div className="bg-white p-3 rounded-lg shadow-md">
                  <QRCodeCanvas value={`booking-checkin:${bookingField.id}`} />
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  Vui lòng đưa mã QR này cho Admin khi đến sân.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Check Booking */}
      {checkField && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6 relative">
            <button
              onClick={() => setCheckField(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✖
            </button>

            <h3 className="text-xl font-semibold mb-4">
              Thông tin thuê sân: {checkField.field?.name || checkField.name}
            </h3>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Người thuê:</span>{" "}
              {checkField.user?.name || checkField.user?.email || "Chưa có"}
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Ngày:</span> {checkField.date}
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Thời gian:</span>{" "}
              {checkField.start_time} - {checkField.end_time}
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Tổng giờ:</span>{" "}
              {calcHours(checkField)} giờ
            </p>

            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Tổng tiền:</span>{" "}
              {checkField?.total_price?.toLocaleString() || "-"} ₫
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
