import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/san-pham?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const navLinks = [
    { to: '/san-pham', label: 'Tất cả sản phẩm' },
    { to: '/san-pham?newArrival=true', label: 'Hàng mới' },
    { to: '/san-pham?featured=true', label: 'Nổi bật' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      
      {/* ⚡ BANNER MARQUEE CHẠY CHỮ THỂ THAO ⚡ */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-600 to-amber-500 text-white overflow-hidden h-9 flex items-center shadow-inner">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="text-[10px] font-black tracking-widest px-8 flex items-center gap-2 uppercase">
              🚀 MIỄN PHÍ VẬN CHUYỂN CHO ĐƠN TỪ 500.000Đ <span className="text-amber-300">✦</span> 
              🔥 HÀNG CHÍNH HÃNG 100% <span className="text-amber-300">✦</span> 
              🔄 ĐỔI TRẢ TRONG 7 NGÀY KHÔNG CẦN LÝ DO <span className="text-amber-300">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* LOGO & MOBILE HAMBURGER BUTTON */}
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" 
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              // Icon Đóng (X)
              <svg className="w-5.5 h-5.5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Icon Menu (Hamburger)
              <svg className="w-5.5 h-5.5 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          
          <Link to="/" className="font-display text-2xl font-black tracking-wider text-slate-800 flex items-center gap-0.5 group">
            SPORT<span className="text-orange-500 group-hover:scale-105 transition-transform">SHOP</span>
          </Link>
        </div>

        {/* 🧭 NAV LINKS (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link 
              key={l.label} 
              to={l.to} 
              className="text-sm font-bold text-slate-600 hover:text-orange-500 transition-colors duration-200 relative py-1.5 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-orange-500 hover:after:w-full after:transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* 🛠️ CÁC NÚT ĐIỀU HƯỚNG & TÌM KIẾM */}
        <div className="flex items-center gap-1.5 md:gap-3">
          
          {/* Ô TÌM KIẾM (DESKTOP) */}
          <form 
            onSubmit={handleSearch} 
            className="hidden lg:flex items-center bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 focus-within:bg-white rounded-full px-4 py-2 w-64 transition-all duration-200"
          >
            <input
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm giày, áo, dụng cụ..."
              className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <button type="submit" className="text-slate-400 hover:text-orange-500 transition-colors cursor-pointer ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* NÚT YÊU THÍCH */}
          <Link 
            to="/yeu-thich" 
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl text-slate-600 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200"
          >
            <svg className="w-5.5 h-5.5 fill-none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>

          {/* NÚT GIỎ HÀNG */}
          <Link 
            to="/gio-hang" 
            className="relative w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200"
          >
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center animate-bounce shadow-md">
                {cart.totalItems}
              </span>
            )}
          </Link>

          {/* DROPDOWN TÀI KHOẢN */}
          <div className="relative">
            <button
              onClick={() => setAccountOpen((o) => !o)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {accountOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-slate-100 p-2 z-20 animate-slideDown">
                  {isLoggedIn ? (
                    <>
                      <div className="px-3.5 py-3 border-b border-slate-100 mb-1.5 bg-slate-50/50 rounded-xl">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Xin chào,</p>
                        <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{user.fullName || user.email}</p>
                      </div>
                      
                      <Link 
                        to="/tai-khoan/don-hang" 
                        onClick={() => setAccountOpen(false)} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Đơn hàng của tôi
                      </Link>
                      
                      <Link 
                        to="/tai-khoan/dia-chi" 
                        onClick={() => setAccountOpen(false)} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Sổ địa chỉ
                      </Link>
                      
                      <Link 
                        to="/yeu-thich" 
                        onClick={() => setAccountOpen(false)} 
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all sm:hidden"
                      >
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Yêu thích
                      </Link>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={() => { logout(); setAccountOpen(false); navigate('/'); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <div className="p-1 space-y-1">
                      <Link 
                        to="/dang-nhap" 
                        onClick={() => setAccountOpen(false)} 
                        className="block w-full py-2.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 text-center hover:shadow-lg hover:shadow-orange-500/15 transition-all duration-200"
                      >
                        Đăng nhập
                      </Link>
                      <Link 
                        to="/dang-ky" 
                        onClick={() => setAccountOpen(false)} 
                        className="block w-full py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 text-center transition-all duration-200"
                      >
                        Tạo tài khoản mới
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 📱 MENU MOBILE PANEL (SLIDE DOWN) */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 px-4 py-5 space-y-4 animate-slideDown bg-white shadow-xl">
          <form onSubmit={handleSearch} className="flex items-center bg-slate-50 rounded-xl border border-slate-200 px-4 py-2.5">
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Tìm kiếm sản phẩm..." 
              className="flex-1 text-sm outline-none bg-transparent text-slate-800" 
            />
            <button type="submit" className="text-slate-400 hover:text-orange-500 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          <div className="space-y-1">
            {navLinks.map((l) => (
              <Link 
                key={l.label} 
                to={l.to} 
                onClick={() => setMenuOpen(false)} 
                className="block text-sm font-extrabold text-slate-700 hover:text-orange-500 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}