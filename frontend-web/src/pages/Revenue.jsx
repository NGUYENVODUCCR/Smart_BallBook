import { useState } from "react";
import axios from "axios";

export default function Revenue() {
  const [type, setType] = useState("day");
  const [value, setValue] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("01");
  const [quarter, setQuarter] = useState("1");
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      let url = "";

      if (type === "day") {
        url = `/api/revenue/day?value=${value}`;
      }

      if (type === "month") {
        url = `/api/revenue/month?year=${year}&month=${month}`;
      }

      if (type === "quarter") {
        url = `/api/revenue/quarter?year=${year}&quarter=${quarter}`;
      }

      if (type === "year") {
        url = `/api/revenue/year?year=${year}`;
      }

      const res = await axios.get(`https://smart-ballbook.onrender.com${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRevenue(res.data.revenue);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lấy doanh thu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 500 }}>
      <h2>📊 Thống kê doanh thu</h2>

      {/* Chọn loại thống kê */}
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="day">Theo ngày</option>
        <option value="month">Theo tháng</option>
        <option value="quarter">Theo quý</option>
        <option value="year">Theo năm</option>
      </select>

      <div style={{ marginTop: 16 }}>
        {type === "day" && (
          <input
            type="date"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}

        {type === "month" && (
          <>
            <input
              type="number"
              placeholder="Năm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: 120, marginRight: 8 }}
            />
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {Array.from({ length: 12 }).map((_, i) => {
                const m = String(i + 1).padStart(2, "0");
                return (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                );
              })}
            </select>
          </>
        )}

        {type === "quarter" && (
          <>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{ width: 120, marginRight: 8 }}
            />
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              <option value="1">Quý 1</option>
              <option value="2">Quý 2</option>
              <option value="3">Quý 3</option>
              <option value="4">Quý 4</option>
            </select>
          </>
        )}

        {type === "year" && (
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        )}
      </div>

      <button
        onClick={fetchRevenue}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        {loading ? "Đang thống kê..." : "Xem doanh thu"}
      </button>

      {revenue !== null && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#e0f7fa",
            borderRadius: 8,
            fontWeight: "bold",
          }}
        >
          💰 Doanh thu: {Number(revenue).toLocaleString()} VNĐ
        </div>
      )}
    </div>
  );
}
