import React, { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";
const AUTH_TOKEN_KEY = "authToken";

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function UserManagementInner() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!token) {
          throw new Error("Vui lòng đăng nhập để xem thống kê người dùng.");
        }
        const res = await fetch(`${BACKEND_BASE_URL}/api/user-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const detail = await res.json().catch(() => ({}));
          throw new Error(detail.detail || "Không thể lấy dữ liệu người dùng");
        }
        const data = await res.json();
        setStats(data.data || []);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra");
        setStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const filteredStats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stats;
    return stats.filter((item) =>
      String(item.customer || "")
        .toLowerCase()
        .includes(q)
    );
  }, [stats, search]);

  const totalSpent = filteredStats.reduce(
    (sum, item) => sum + (item.totalSpent || 0),
    0
  );
  const totalOrders = filteredStats.reduce(
    (sum, item) => sum + (item.orderCount || 0),
    0
  );
  const totalItems = filteredStats.reduce(
    (sum, item) => sum + (item.itemCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 text-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Theo dõi ví người dùng, số đơn đã mua và tổng số tiền chi tiêu.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
            <p className="text-sm text-gray-500">Tổng người dùng</p>
            <p className="text-3xl font-bold text-blue-700">
              {filteredStats.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
            <p className="text-sm text-gray-500">Tổng số đơn</p>
            <p className="text-3xl font-bold text-blue-700">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
            <p className="text-sm text-gray-500">Tổng chi tiêu (ETH)</p>
            <p className="text-3xl font-bold text-blue-700">
              {totalSpent.toFixed(6)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <input
              type="text"
              placeholder="Tìm theo địa chỉ ví hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
            />
            <div className="text-sm text-gray-500">
              Tổng số thuốc đã bán:{" "}
              <span className="font-semibold text-blue-600">{totalItems}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow border border-blue-100">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : filteredStats.length === 0 ? (
            <div className="py-16 text-center text-gray-600">
              Không tìm thấy người dùng.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 text-gray-700 text-left">
                    <th className="py-3 px-4 font-semibold">Người dùng</th>
                    <th className="py-3 px-4 font-semibold">Số đơn</th>
                    <th className="py-3 px-4 font-semibold">Số lượng thuốc</th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Tổng tiền (ETH)
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Trung bình/đơn
                    </th>
                    <th className="py-3 px-4 font-semibold text-right">
                      Lần mua gần nhất
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStats.map((user) => (
                    <tr
                      key={user.customer}
                      className="border-b border-gray-100 hover:bg-blue-50/50 transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-gray-800">
                        {user.customer || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{user.orderCount}</td>
                      <td className="py-3 px-4 text-gray-700">{user.itemCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-700">
                        {Number(user.totalSpent || 0).toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {Number(user.avgOrderValue || 0).toFixed(6)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {formatDate(user.lastPurchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  return (
    <ProtectedRoute>
      <UserManagementInner />
    </ProtectedRoute>
  );
}



