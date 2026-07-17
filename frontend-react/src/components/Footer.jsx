import { Link } from 'react-router-dom';
import { Mail, Phone, Clock, MapPin, Shield, Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-300 mt-24 relative overflow-hidden">
      {/* Đường vạch sắc màu thể thao chạy ngang trên cùng */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
      
      {/* Đốm sáng mờ ảo làm nền phía sau */}
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* CỘT 1: GIỚI THIỆU */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="font-display text-2xl font-black tracking-wider text-white inline-flex items-center gap-1 group">
              SPORT<span className="text-orange-500 group-hover:translate-x-0.5 transition-transform">SHOP</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Đồng hành cùng bạn trên mọi chặng đường tập luyện. Cung cấp giày, quần áo và dụng cụ thể thao chính hãng cao cấp, đánh thức nhà vô địch trong bạn.
            </p>
            
            {/* Mạng xã hội dùng SVG chuẩn (Sửa lỗi crash) */}
            <div className="flex items-center gap-3 pt-2">
              {/* Facebook */}
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-orange-500 hover:-translate-y-1 flex items-center justify-center transition-all duration-300 shadow-lg">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-orange-500 hover:-translate-y-1 flex items-center justify-center transition-all duration-300 shadow-lg">
                <svg className="w-4 h-4 stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Youtube */}
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-orange-500 hover:-translate-y-1 flex items-center justify-center transition-all duration-300 shadow-lg">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.388.507 9.388.507s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* CỘT 2: MUA SẮM */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Mua sắm
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/san-pham" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Tất cả sản phẩm</Link></li>
              <li><Link to="/san-pham?newArrival=true" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Hàng mới về</Link></li>
              <li><Link to="/san-pham?featured=true" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Sản phẩm nổi bật</Link></li>
            </ul>
          </div>

          {/* CỘT 3: TÀI KHOẢN */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Tài khoản
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/tai-khoan/don-hang" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Đơn hàng của tôi</Link></li>
              <li><Link to="/yeu-thich" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Sản phẩm yêu thích</Link></li>
              <li><Link to="/tai-khoan/dia-chi" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all">Sổ địa chỉ nhận hàng</Link></li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ & ĐĂNG KÝ */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 mb-5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Liên hệ hỗ trợ
            </h4>
            <ul className="space-y-3.5 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-white font-bold">1900 1234</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <a href="mailto:support@sportshop.vn" className="hover:text-white transition-colors">support@sportshop.vn</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <span>8:00 - 21:00 (T2 - CN)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">Quận 1, TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

        </div>

        {/* DÒNG DƯỚI CÙNG: COPYRIGHT & SIGNATURE CỦA QUÂN */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-600" />
            <span>© {currentYear} SportShop. Đồ án tốt nghiệp / Học tập cá nhân.</span>
          </div>
          
          {/* Dấu ấn bản quyền cực xịn của Lê Hoàng Quân */}
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Designed & Developed by <span className="text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text font-bold tracking-wide pl-1">Lê Hoàng Quân</span>
          </div>
        </div>
      </div>
    </footer>
  );
}