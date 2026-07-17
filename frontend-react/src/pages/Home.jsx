import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, bannerAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { wishlistAPI } from '../services/api';
import { ArrowRight, Sparkles, Flame, ShieldCheck, Truck, RefreshCw, ShoppingBag } from 'lucide-react';

function SectionHeader({ eyebrow, title, to }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3" />
          {eyebrow}
        </div>
        <h2 className="font-display text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight">{title}</h2>
      </div>
      {to && (
        <Link to={to} className="group inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 pb-1 border-b-2 border-transparent hover:border-blue-500 hidden sm:flex">
          Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3 animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
          <div className="h-5 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bannerRes, categoryRes, featuredRes, newRes] = await Promise.all([
        bannerAPI.getAll().catch(() => ({ data: { data: [] } })),
        categoryAPI.getAll().catch(() => ({ data: { data: [] } })),
        productAPI.search({ featured: true }).catch(() => ({ data: { data: [] } })),
        productAPI.search({ newArrival: true, sort: 'newest' }).catch(() => ({ data: { data: [] } })),
      ]);
      setBanners(bannerRes.data.data || []);
      setCategories(categoryRes.data.data || []);
      setFeatured((featuredRes.data.data || []).slice(0, 8));
      setNewArrivals((newRes.data.data || []).slice(0, 4));

      if (isLoggedIn) {
        try {
          const wl = await wishlistAPI.get();
          setWishlistIds(new Set((wl.data.data || []).map((w) => w.productId)));
        } catch { /* ignore */ }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      return;
    }
    try {
      if (wishlistIds.has(productId)) {
        await wishlistAPI.remove(productId);
        setWishlistIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistAPI.add(productId);
        setWishlistIds((prev) => new Set(prev).add(productId));
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* HERO SECTION - CHUYỂN SANG NỀN TỐI GRADIENT ĐẬM CHẤT THỂ THAO */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden py-16 md:py-24">
        
        {/* Đốm màu rực rỡ nền sau */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* CỘT TRÁI: TEXT & HIỆU ỨNG CHỮ NỔI BẬT */}
          <div className="animate-slideUp space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/30">
              <Flame className="w-4 h-4 animate-bounce" />
              BỘ SƯU TẬP MỚI NHẤT
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-sm">
              VƯỢT GIỚI HẠN<br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">CỦA CHÍNH MÌNH</span>
            </h1>
            
            <p className="text-slate-300 text-base md:text-lg max-w-md leading-relaxed">
              Trang bị đầy đủ giày, quần áo và dụng cụ thể thao chính hãng cho mọi cuộc bứt phá ngoạn mục trên hành trình của bạn.
            </p>
            
            <div className="pt-2">
              <Link
                to="/san-pham"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold px-8 py-4 rounded-full shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                Mua sắm ngay 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI: BANNER SLIDER MƯỢT MÀ */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/5 animate-slideUp" style={{ animationDelay: '150ms' }}>
            {banners.length > 0 ? (
              banners.map((b, idx) => (
                <div
                  key={b.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-1000 transform ${idx === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Phủ bóng đen mờ cho banner sắc nét */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider">{b.subtitle || 'HOT EVENT'}</p>
                    <h3 className="text-white text-lg md:text-2xl font-black mt-1">{b.title}</h3>
                  </div>
                </div>
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-display text-4xl font-black tracking-widest bg-slate-900">
                SPORT<span className="text-orange-500">SHOP</span>
              </div>
            )}
          </div>
        </div>

        {/* Viền trang trí gạch thể thao (Speed stripe) */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400" />
      </section>

      {/* CHÍNH SÁCH MUA HÀNG - THÊM KHỐI MÀU NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Freeship từ 500K</h4>
              <p className="text-xs text-slate-400 mt-0.5">Giao hàng cực nhanh toàn quốc</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Hàng chính hãng</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cam kết chất lượng 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 animate-spin duration-10000" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Đổi trả 7 ngày</h4>
              <p className="text-xs text-slate-400 mt-0.5">Thủ tục nhanh chóng, dễ dàng</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Tích điểm thành viên</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hưởng muôn vàn ưu đãi</p>
            </div>
          </div>
        </div>
      </section>

      {/* DANH MỤC SẢN PHẨM - CARD CAO CẤP */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <SectionHeader eyebrow="Khám phá" title="Danh mục sản phẩm" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.slice(0, 8).map((c, idx) => (
              <Link
                key={c.id}
                to={`/san-pham?categoryId=${c.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <img
                  src={c.imageUrl || 'https://placehold.co/300x300?text=' + encodeURIComponent(c.name)}
                  alt={c.name}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                  onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=' + encodeURIComponent(c.name); }}
                />
                {/* Lớp phủ chuyển màu cho text nổi bật */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <p className="text-white font-display text-base md:text-lg font-black tracking-wide group-hover:text-orange-400 transition-colors uppercase">
                    {c.name}
                  </p>
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1 flex items-center gap-1">
                    Xem sản phẩm <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SẢN PHẨM NỔI BẬT */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <SectionHeader eyebrow="Được yêu thích" title="Sản phẩm nổi bật" to="/san-pham?featured=true" />
        {loading ? (
          <ProductGridSkeleton />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-sm">Chưa có sản phẩm nổi bật</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {featured.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} isWishlisted={wishlistIds.has(p.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </section>

      {/* PROMO STRIP (CHỮ CHẠY MARQUEE) - NỀN GRADIENT RỰC RỠ */}
      <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-5 shadow-inner overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="flex whitespace-nowrap animate-marquee">
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="font-display text-xl md:text-2xl font-black text-slate-950 px-8 tracking-wider flex items-center gap-4">
              <span>FREESHIP TỪ 500K ✦</span>
              <span>HÀNG CHÍNH HÃNG ✦</span>
              <span>ĐỔI TRẢ 7 NGÀY ✦</span>
              <span>THANH TOÁN KHI NHẬN HÀNG ✦</span>
            </span>
          ))}
        </div>
      </section>

      {/* HÀNG MỚI VỀ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <SectionHeader eyebrow="Vừa ra mắt" title="Hàng mới về" to="/san-pham?newArrival=true" />
        {loading ? (
          <ProductGridSkeleton />
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-sm">Chưa có sản phẩm mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {newArrivals.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} isWishlisted={wishlistIds.has(p.id)} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;