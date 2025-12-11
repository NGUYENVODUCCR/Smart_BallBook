import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllFields } from "../api/FieldService";
import { MapPin, DollarSign, Info, Image, ArrowLeft } from "lucide-react";
//
export default function FieldList() {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchFields = async () => {
    if (!token) return;
    try {
      const data = await getAllFields(token);
      const mappedFields = data.map((f) => ({
        id: f.id,
        name: f.name || "Chưa có tên",
        location: f.location || "Chưa có địa điểm",
        price_per_hour: f.price_per_hour || 0,
        status: f.status,
        description: f.description || "",
        image_url: f.image_url || "",
      }));
      setFields(mappedFields);
    } catch (err) {
      console.error("Fetch fields error:", err);
    }
  };

  useEffect(() => {
    fetchFields();

    const interval = setInterval(() => {
      fetchFields();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const openGoogleMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-green-300 p-6 relative">
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-md hover:bg-white transition z-50"
      >
        <ArrowLeft className="w-5 h-5 text-green-700" />
        <span className="text-sm font-semibold text-green-700">Quay lại</span>
      </button>

      <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
        Danh sách sân bóng
      </h2>
      <div className="space-y-4 mt-10">
        {fields.length === 0 ? (
          <p className="text-center text-gray-600">Chưa có sân bóng nào</p>
        ) : (
          fields.map((field) => (
            <div
              key={field.id}
              onClick={() => setSelectedField(field)}
              className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:bg-green-50 transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Info className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">{field.name}</p>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      openGoogleMaps(field.location);
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 mt-1 hover:underline cursor-pointer"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{field.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="w-4 h-4 mr-1" />
                {field.price_per_hour} đ/giờ
              </div>
            </div>
          ))
        )}
      </div>

      {selectedField && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start z-50 pt-20">
          <div className="bg-white rounded-xl shadow-lg w-96 max-w-[95%] p-6 relative animate-fade-in">
            <button
              onClick={() => {
                setSelectedField(null);
                fetchFields();
              }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-lg"
            >
              ✖
            </button>

            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
              {selectedField.image_url ? (
                <img
                  src={selectedField.image_url}
                  alt={selectedField.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Image className="w-10 h-10 mb-2" />
                  <p>Chưa có hình ảnh</p>
                </div>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-4 text-center">
              {selectedField.name}
            </h3>

            <div className="space-y-3 text-gray-700 text-sm">
              <p
                onClick={() => openGoogleMaps(selectedField.location)}
                className="cursor-pointer text-blue-600 hover:underline flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">Địa điểm:</span>
                <span>{selectedField.location}</span>
              </p>

              <p>
                <span className="font-semibold">Giá/giờ:</span> {selectedField.price_per_hour} đ
              </p>

              <p>
                <span className="font-semibold">Trạng thái:</span> {selectedField.status}
              </p>

              <p>
                <span className="font-semibold">Mô tả:</span> {selectedField.description}
              </p>
            </div>

            <button
              onClick={() => openGoogleMaps(selectedField.location)}
              className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              📍 Mở Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
