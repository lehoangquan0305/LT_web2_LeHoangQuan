import { Link, useLocation } from 'react-router-dom';

function Sidebar({ onLogout }) {
  const location = useLocation();

  // Hàm kiểm tra trạng thái active và trả về các class tương ứng
  const getNavLinkClass = (path) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 group";
    const activeClass = "bg-indigo-600 text-white shadow-md shadow-indigo-200";
    const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
    
    return location.pathname === path ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 shadow-sm">
      
      {/* Sidebar Header + Nav (scrollable if content grows) */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
        <div className="h-20 flex items-center px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            {/* Logo Icon cách điệu */}
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <h2 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              SportShop <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-500 ml-1">Admin</span>
            </h2>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1.5 p-4 mt-4">
          <Link to="/dashboard" className={getNavLinkClass('/dashboard')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">📊</span>
            <span>Tổng quan</span>
          </Link>

          <Link to="/products" className={getNavLinkClass('/products')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">📦</span>
            <span>Sản phẩm</span>
          </Link>

          <Link to="/categories" className={getNavLinkClass('/categories')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">📁</span>
            <span>Danh mục</span>
          </Link>

          <Link to="/brands" className={getNavLinkClass('/brands')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🏷️</span>
            <span>Thương hiệu</span>
          </Link>

          <Link to="/colors" className={getNavLinkClass('/colors')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🎨</span>
            <span>Màu sắc</span>
          </Link>

          <Link to="/inventory" className={getNavLinkClass('/inventory')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">📦</span>
            <span>Kho hàng</span>
          </Link>

          <Link to="/orders" className={getNavLinkClass('/orders')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🛒</span>
            <span>Đơn hàng</span>
          </Link>

          <Link to="/customers" className={getNavLinkClass('/customers')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">👥</span>
            <span>Khách hàng</span>
          </Link>

          <Link to="/reviews" className={getNavLinkClass('/reviews')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">⭐</span>
            <span>Đánh giá</span>
          </Link>

          <div className="my-2 border-t border-gray-100" />

          <Link to="/banners" className={getNavLinkClass('/banners')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🖼️</span>
            <span>Banner</span>
          </Link>

          <Link to="/coupons" className={getNavLinkClass('/coupons')}>
            <span className="text-lg transition-transform duration-300 group-hover:scale-110">🎟️</span>
            <span>Mã giảm giá</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-rose-600 hover:bg-rose-50 transition-all duration-300 cursor-pointer active:scale-95"
        >
          <span className="text-lg">🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;