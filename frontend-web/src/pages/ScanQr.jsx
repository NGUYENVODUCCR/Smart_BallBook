import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import axios from "axios";

export default function ScanQr() {
  const [scanResult, setScanResult] = useState("");
  const [checkField, setCheckField] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      async (decodedText) => {
        setScanResult(decodedText);

        if (decodedText.startsWith("booking-checkin:")) {
          const bookingId = decodedText.replace("booking-checkin:", "");

          axios
            .get(`http://localhost:5000/api/bookings/field/${bookingId}`, {
              headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
              },
            })
            .then((res) => {
              setCheckField(res.data);
            })
            .catch((err) => {
              console.error(err);
              alert("Không tìm thấy booking!");
            });
        }
      },
      (err) => console.warn(err)
    );

    return () => {
      try {
        const html5qrcode = scanner._html5Qrcode;

        if (html5qrcode && html5qrcode._isScanning) {
          html5qrcode.stop().then(() => {
            html5qrcode.clear();
          });
        } else {
          scanner.clear().catch(() => {});
        }
      } catch (e) {
        console.warn("Cleanup skipped:", e);
      }
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Quét mã QR Check-in</h2>

      <div id="qr-reader" style={{ width: "300px" }}></div>

      <p className="mt-4 font-semibold">Kết quả:</p>
      <p className="text-blue-600">{scanResult}</p>

      {/* Modal hiển thị đúng UI checkField */}
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

            <p><b>Người thuê:</b> {checkField.user?.name}</p>
            <p><b>Ngày:</b> {checkField.date}</p>
            <p><b>Thời gian:</b> {checkField.start_time} - {checkField.end_time}</p>
            <p><b>Tổng tiền:</b> {checkField.total_price?.toLocaleString()} ₫</p>
          </div>
        </div>
      )}
    </div>
  );
}
