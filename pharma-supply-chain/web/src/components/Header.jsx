import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Header() {
  const location = useLocation();
  const [account, setAccount] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [revenueData, setRevenueData] = useState({ total: 0, transactions: [] });
  const [loadingStats, setLoadingStats] = useState(false);
  const [chartDataByDay, setChartDataByDay] = useState([]);
  const [chartDataByMonth, setChartDataByMonth] = useState([]);

  // Kết nối ví MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Lỗi khi kết nối ví:", error);
      }
    } else {
      alert("Vui lòng cài đặt MetaMask!");
    }
  };

  // Theo dõi sự thay đổi tài khoản trong MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  // Lấy dữ liệu thống kê doanh số
  const fetchRevenueStats = async () => {
    setLoadingStats(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      // Lấy dữ liệu tháng hiện tại
      const res = await axios.get(
        `http://127.0.0.1:8000/api/revenue?month=${month}&year=${year}`
      );
      const transactions = res.data.transactions || [];
      
      setRevenueData({
        total: res.data.total || 0,
        transactions: transactions,
      });

      // Xử lý dữ liệu cho biểu đồ theo ngày
      const byDay = {};
      transactions.forEach((tx) => {
        const date = tx.date || new Date().toISOString().split("T")[0];
        if (!byDay[date]) {
          byDay[date] = 0;
        }
        byDay[date] += parseFloat(tx.price_eth || 0);
      });
      
      const dayData = Object.entries(byDay)
        .map(([date, revenue]) => ({
          date: date.split("-")[2] + "/" + date.split("-")[1], // DD/MM
          revenue: parseFloat(revenue.toFixed(6)),
        }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split("/").map(Number);
          const [dayB, monthB] = b.date.split("/").map(Number);
          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        });
      setChartDataByDay(dayData);

      // Lấy dữ liệu 12 tháng gần nhất
      const monthData = [];
      for (let i = 11; i >= 0; i--) {
        const targetDate = new Date(year, month - 1 - i, 1);
        const targetMonth = targetDate.getMonth() + 1;
        const targetYear = targetDate.getFullYear();
        
        try {
          const monthRes = await axios.get(
            `http://127.0.0.1:8000/api/revenue?month=${targetMonth}&year=${targetYear}`
          );
          monthData.push({
            month: `${targetMonth}/${targetYear}`,
            revenue: parseFloat((monthRes.data.total || 0).toFixed(6)),
          });
        } catch (e) {
          monthData.push({
            month: `${targetMonth}/${targetYear}`,
            revenue: 0,
          });
        }
      }
      setChartDataByMonth(monthData);
    } catch (error) {
      console.error("Error fetching revenue:", error);
      setRevenueData({ total: 0, transactions: [] });
      setChartDataByDay([]);
      setChartDataByMonth([]);
    } finally {
      setLoadingStats(false);
    }
  };

  // Mở/đóng modal thống kê
  const toggleStats = () => {
    if (!showStats) {
      fetchRevenueStats();
    }
    setShowStats(!showStats);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-lg">
      <h1 className="font-bold text-xl">Pharma SupplyChain DApp</h1>

      <nav className="space-x-4">
        <Link
          to="/"
          className={`hover:underline ${
            location.pathname === "/" ? "text-blue-200 font-semibold" : ""
          }`}
        >
          Trang chủ
        </Link>
        <Link
          to="/product"
              className={`hover:underline ${
            location.pathname === "/product"
              ? "text-blue-200 font-semibold"
              : ""
          }`}
        >
          Sản phẩm
        </Link>
        <Link
          to="/my-drugs"
              className={`hover:underline ${
            location.pathname === "/my-drugs"
              ? "text-blue-200 font-semibold"
              : ""
          }`}
        >
          Thuốc của tôi
        </Link>

        {/* ✅ Thêm mục Doanh thu tại đây */}
        <Link
          to="/revenue"
          className={`hover:underline ${
            location.pathname === "/revenue"
              ? "text-blue-200 font-semibold"
              : ""
          }`}
        >
          Doanh thu
        </Link>
        <Link
          to="/users"
          className={`hover:underline ${
            location.pathname === "/users"
              ? "text-blue-200 font-semibold"
              : ""
          }`}
        >
          Người dùng
        </Link>
      </nav>

      <div className="flex items-center gap-3">
        {/* Button Thống kê */}
        <button
          onClick={toggleStats}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <span>Thống kê</span>
        </button>

        <button
          onClick={connectWallet}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "Kết nối ví"}
        </button>
      </div>

      {/* Modal Thống kê Doanh số */}
      {showStats && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowStats(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Thống kê Doanh số
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingStats ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : (
                <>
                  {/* Tổng doanh thu */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                    <p className="text-gray-600 text-sm mb-2">Tổng doanh thu tháng này</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {parseFloat(revenueData.total).toFixed(6)} ETH
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      {revenueData.transactions.length} giao dịch
                    </p>
                  </div>

                  {/* Biểu đồ doanh thu theo tháng (12 tháng) */}
                  <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Doanh thu theo tháng (12 tháng gần nhất)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartDataByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="month"
                          stroke="#6B7280"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "ETH",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "#6B7280" },
                          }}
                        />
                          <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #3B82F6",
                            borderRadius: "8px",
                            color: "#1F2937",
                          }}
                          formatter={(value) => [`${value} ETH`, "Doanh thu"]}
                        />
                        <Legend />
                        <Bar
                          dataKey="revenue"
                          fill="#3B82F6"
                          name="Doanh thu (ETH)"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Biểu đồ doanh thu theo ngày (tháng hiện tại) */}
                  <div className="bg-white rounded-xl p-6 mb-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Doanh thu theo ngày (tháng này)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartDataByDay}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="date"
                          stroke="#6B7280"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis
                          stroke="#6B7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "ETH",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "#6B7280" },
                          }}
                        />
                          <Tooltip
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #3B82F6",
                            borderRadius: "8px",
                            color: "#1F2937",
                          }}
                          formatter={(value) => [`${value} ETH`, "Doanh thu"]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: "#3B82F6", r: 5 }}
                          activeDot={{ r: 8 }}
                          name="Doanh thu (ETH)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Bảng giao dịch */}
                  <div className="bg-white rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Chi tiết giao dịch
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                              Khách hàng
                            </th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                              Tên thuốc
                            </th>
                            <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                              Ngày
                            </th>
                            <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                              Số tiền (ETH)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {revenueData.transactions.length === 0 ? (
                            <tr>
                              <td
                                colSpan="4"
                                className="text-center py-8 text-gray-500"
                              >
                                Chưa có giao dịch nào trong tháng này
                              </td>
                            </tr>
                          ) : (
                            revenueData.transactions.map((tx, idx) => (
                              <tr
                                key={idx}
                                className="border-b border-gray-200 hover:bg-blue-50 transition"
                              >
                                <td className="py-3 px-4 font-mono text-xs text-gray-700">
                                  {String(tx.customer || "Unknown").slice(0, 10)}
                                  ...
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {tx.medicine || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-gray-600">
                                  {tx.date || "N/A"}
                                </td>
                                <td className="py-3 px-4 text-right font-semibold text-blue-700">
                                  {Number(tx.price_eth || 0).toFixed(6)} ETH
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
