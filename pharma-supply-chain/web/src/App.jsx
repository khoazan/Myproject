import React, { useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation, Link } from "react-router-dom"; // 🧩 thêm useLocation và Link
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Product from "./pages/Product";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import MyDrugs from "./pages/MyDrugs";
import DrugDetail from "./pages/DrugDetail";
import RevenueStats from "./pages/RevenueStats";
import UserManagement from "./pages/UserManagement";
import { useAuth } from "./context/AuthContext";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Pharma SupplyChain DApp
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
              Hệ thống truy xuất nguồn gốc thuốc trên Blockchain
            </p>
            
            <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Đảm bảo tính minh bạch, an toàn và truy xuất nguồn gốc cho từng sản phẩm dược phẩm
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/product"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-semibold text-lg text-white hover:from-blue-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Quản lý Sản phẩm
              </Link>
              <Link
                to="/my-drugs"
                className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105"
              >
                Thuốc của tôi
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Tính năng nổi bật
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 border border-blue-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Blockchain Technology</h3>
            <p className="text-gray-600">
              Sử dụng công nghệ blockchain để đảm bảo tính minh bạch và không thể thay đổi dữ liệu
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 border border-blue-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Theo dõi Doanh số</h3>
            <p className="text-gray-600">
              Thống kê và phân tích doanh thu theo tháng, theo ngày với biểu đồ trực quan
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 border border-blue-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600"></div>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-blue-700">Tìm kiếm Thông minh</h3>
            <p className="text-gray-600">
              Tìm kiếm thuốc theo tên hoặc batch (lô) một cách nhanh chóng và chính xác
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Minh bạch</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Hoạt động</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Bảo mật</div>
              <div className="text-blue-100">Cao cấp</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">Nhanh</div>
              <div className="text-blue-100">Chóng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { isLoggedIn } = useAuth();
  const location = useLocation(); // ✅ thêm dòng này
  const [account, setAccount] = useState(null);
  const onConnectRef = useRef(() => {});

  // ✅ Kiểm tra nếu đang ở /login thì không hiển thị header
  const hideHeaderRoutes = ["/login"];
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <>
      {/* Header chỉ hiển thị nếu không ở /login */}
      {!shouldHideHeader && (
        <Header account={account} onConnect={onConnectRef.current} />
      )}

      <main>
        <Routes>
          <Route path="/login" element={<LoginRegisterPage />} />

          <Route
            path="/"
            element={
              isLoggedIn ? <Home /> : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/product"
            element={
              <div className="max-w-7xl mx-auto">
                <ProtectedRoute>
                  <Product
                    renderProps={{
                      setAccount: setAccount,
                      onConnect: onConnectRef,
                    }}
                  />
                </ProtectedRoute>
              </div>
            }
          />

          <Route
            path="/my-drugs"
            element={
              <div className="max-w-6xl mx-auto p-6">
                {isLoggedIn ? <MyDrugs /> : <Navigate to="/login" replace />}
              </div>
            }
          />

          <Route
            path="/drug/:id"
            element={
              <div className="max-w-6xl mx-auto p-6">
                {isLoggedIn ? <DrugDetail /> : <Navigate to="/login" replace />}
              </div>
            }
          />

          <Route 
            path="/revenue" 
            element={
              <div className="max-w-6xl mx-auto p-6">
                <RevenueStats />
              </div>
            } 
          />

          <Route
            path="/users"
            element={
              <div className="max-w-7xl mx-auto">
                <UserManagement />
              </div>
            }
          />
        </Routes>
      </main>
    </>
  );
}
