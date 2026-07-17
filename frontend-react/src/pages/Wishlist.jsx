import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';

function Wishlist() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await wishlistAPI.get();
      setItems(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      toast.success('Đã xóa khỏi yêu thích');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-[60vh]">
      {/* TIÊU ĐỀ TRANG */}
      <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-5">
        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
          <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Sản Phẩm Yêu Thích</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Nơi lưu giữ những sản phẩm bạn đang quan tâm</p>
        </div>
      </div>

      {/* TRẠNG THÁI LOADING (SKELETON CAO CẤP) */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 space-y-4">
              <div className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 bg-slate-100 rounded-md w-1/3 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded-md w-3/4 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded-md w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* TRẠNG THÁI TRỐNG (EMPTY STATE) */
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Danh sách yêu thích của bạn đang trống</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Hãy duyệt qua các danh mục thể thao mới nhất để thêm các sản phẩm yêu thích của riêng bạn.</p>
          <Link 
            to="/san-pham" 
            className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-black px-6 py-3.5 rounded-xl hover:bg-orange-500 shadow-lg hover:shadow-orange-500/15 transition-all duration-300"
          >
            KHÁM PHÁ NGAY
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        /* DANH SÁCH SẢN PHẨM YÊU THÍCH */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {items.map((item, idx) => {
            const hasDiscount = item.discountPrice && item.discountPrice < item.price;
            return (
              <div 
                key={item.id} 
                className="stagger-item group relative bg-white p-3 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <Link to={`/san-pham/${item.productSlug}`} className="block">
                  {/* HÌNH ẢNH */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-50">
                    <img 
                      src={item.thumbnailUrl || 'https://placehold.co/400x500?text=SportShop'} 
                      alt={item.productName}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" 
                      onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=SportShop'; }}
                    />
                  </div>
                  
                  {/* THÔNG TIN */}
                  <div className="mt-4 px-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SportShop</p>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 min-h-[40px] transition-colors duration-200 group-hover:text-orange-500">
                      {item.productName}
                    </h3>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="font-extrabold text-base text-slate-900">
                        {formatCurrency(hasDiscount ? item.discountPrice : item.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* NÚT XÓA SẢN PHẨM (SVG hiện đại) */}
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="absolute top-5 right-5 w-8.5 h-8.5 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 hover:border-rose-100 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Wishlist;