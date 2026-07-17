import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, brandAPI, orderAPI, dashboardAPI } from '../services/api';

const STATUS_LABELS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700' },
  SHIPPING: { label: 'Đang giao', color: 'bg-blue-50 text-blue-700' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700' },
  DELIVERED: { label: 'Đã giao', color: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700' },
};

function formatCurrency(value) {
  if (value === null || value === undefined) return '0đ';
  return Number(value).toLocaleString('vi-VN') + 'đ';
}

function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    orders: 0,
    revenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes, ordersRes, dashboardRes] = await Promise.all([
        productAPI.getAll().catch(err => ({ data: { data: [] } })),
        categoryAPI.getAll().catch(err => ({ data: { data: [] } })),
        brandAPI.getAll().catch(err => ({ data: { data: [] } })),
        orderAPI.getAll().catch(err => ({ data: { data: [] } })),
        dashboardAPI.getSummary().catch(err => ({ data: {} }))
      ]);

      const summary = dashboardRes.data || {};

      setStats({
        products: productsRes.data?.data?.length || summary.totalProducts || 0,
        categories: categoriesRes.data?.data?.length || 0,
        brands: brandsRes.data?.data?.length || 0,
        orders: ordersRes.data?.data?.length || summary.totalOrders || 0,
        revenue: summary.revenue || 0,
        pendingOrders: summary.pendingOrders || 0,
      });

      setRecentOrders(summary.recentOrders || []);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy lời chào theo thời gian thực
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const adminUser = localStorage.getItem('admin_user') 
    ? JSON.parse(localStorage.getItem('admin_user')) 
    : null;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      {/* Top Bar cao cấp */}
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10 shadow-sm/5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{getGreeting()}, Admin 👋</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dưới đây là hoạt động kinh doanh của SportShop hôm nay.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {adminUser?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-700 max-w-[150px] truncate">{adminUser ? adminUser.email : 'Quản trị viên'}</span>
            <span className="text-[10px] font-medium text-indigo-600 uppercase tracking-wider">Hệ thống</span>
          </div>
        </div>
      </header>

      {/* Vùng Content chính */}
      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        {loading ? (
          /* Loading Skeleton tinh tế */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Grid Thẻ Thống Kê */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card Sản phẩm */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{stats.products}</h3>
                  <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ↑ 12% tháng này
                  </span>
                </div>
                <div className="p-4 bg-blue-50/80 text-blue-600 rounded-xl text-2xl transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 shadow-inner">📦</div>
              </div>

              {/* Card Danh mục */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh mục</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{stats.categories}</h3>
                  <span className="inline-flex items-center text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Ổn định
                  </span>
                </div>
                <div className="p-4 bg-emerald-50/80 text-emerald-600 rounded-xl text-2xl transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 shadow-inner">📁</div>
              </div>

              {/* Card Thương hiệu */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thương hiệu</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{stats.brands}</h3>
                  <span className="inline-flex items-center text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    +2 Mới tuần này
                  </span>
                </div>
                <div className="p-4 bg-amber-50/80 text-amber-600 rounded-xl text-2xl transition-all duration-300 group-hover:bg-amber-600 group-hover:text-white group-hover:scale-110 shadow-inner">🏷️</div>
              </div>

              {/* Card Đơn hàng */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn hàng</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{stats.orders}</h3>
                  <span className="inline-flex items-center text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    {stats.pendingOrders} đang chờ xử lý
                  </span>
                </div>
                <div className="p-4 bg-rose-50/80 text-rose-600 rounded-xl text-2xl transition-all duration-300 group-hover:bg-rose-600 group-hover:text-white group-hover:scale-110 shadow-inner">🛒</div>
              </div>

            </div>

            {/* Card doanh thu - full width, nổi bật */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-between text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div>
                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Tổng doanh thu</p>
                <h3 className="text-3xl font-extrabold mt-2">{formatCurrency(stats.revenue)}</h3>
                <p className="text-xs text-indigo-100 mt-1">Tính trên các đơn hàng chưa hủy</p>
              </div>
              <div className="text-5xl opacity-80">💰</div>
            </div>

            {/* Layout Hàng dưới: Biểu đồ ảo và Bảng đơn hàng gần đây */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Bảng tiến độ / Mục tiêu kinh doanh */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Mục tiêu quý này</h4>
                  <p className="text-xs text-slate-400 mt-1">Tiến độ hoàn thành dựa trên lượng đơn hàng.</p>
                </div>
                <div className="my-6 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Chỉ tiêu đơn hàng</span>
                      <span className="font-bold text-indigo-600">75%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[75%] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Cập nhật kho sản phẩm</span>
                      <span className="font-bold text-emerald-600">90%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[90%] rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-500 text-center">
                  Hệ thống tự động đồng bộ sau mỗi 5 phút
                </div>
              </div>

              {/* Danh sách mô phỏng đơn hàng mới cập nhật */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800">Xử lý nhanh đơn hàng</h4>
                  <Link to="/orders" className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer">Xem tất cả</Link>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">Chưa có đơn hàng nào</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentOrders.map((order) => {
                      const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-600' };
                      return (
                        <div key={order.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 transition-colors duration-200 hover:bg-slate-50 rounded-lg px-2 -mx-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700">#{order.orderCode}</span>
                            <span className="text-xs text-slate-500">{order.receiverName}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${statusInfo.color}`}>{statusInfo.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;