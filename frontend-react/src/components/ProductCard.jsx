import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

export function ProductCard({ product, isWishlisted, onToggleWishlist, index = 0 }) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const percentOff = hasDiscount
    ? Math.round(100 - (product.discountPrice / product.price) * 100)
    : 0;

  return (
    <div
      className="stagger-item group relative bg-white p-3 rounded-2xl border border-slate-100 hover:border-transparent hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link to={`/san-pham/${product.slug}`} className="block">
        {/* KHU VỰC HÌNH ẢNH */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-slate-50">
          <img
            src={product.thumbnailUrl || 'https://placehold.co/400x500?text=SportShop'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://placehold.co/400x500?text=SportShop'; }}
          />

          {/* BADGE GIẢM GIÁ */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
              -{percentOff}%
            </span>
          )}

          {/* BADGE HÀNG MỚI */}
          {product.newArrival && (
            <span className="absolute top-3 right-3 bg-slate-900 text-white text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase">
              NEW
            </span>
          )}

          {/* NÚT YÊU THÍCH (Bắn SVG Đỉnh Cao) */}
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              onToggleWishlist?.(product.id); 
            }}
            className={`absolute bottom-3 right-3 w-9.5 h-9.5 rounded-full flex items-center justify-center backdrop-blur-md shadow-sm transition-all duration-300 cursor-pointer hover:scale-110 active:scale-90 ${
              isWishlisted 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 text-slate-500 hover:text-slate-800 hover:bg-white'
            }`}
          >
            <svg 
              className={`w-5.5 h-5.5 transition-transform duration-300 ${isWishlisted ? 'scale-110' : ''}`} 
              fill={isWishlisted ? "currentColor" : "none"} 
              stroke="currentColor" 
              strokeWidth={isWishlisted ? "0" : "2"} 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
          </button>
        </div>

        {/* THÔNG TIN SẢN PHẨM */}
        <div className="mt-4 space-y-1 px-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {product.brandName || 'SportShop'}
          </p>
          
          <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 min-h-[40px] transition-colors duration-200 group-hover:text-orange-500">
            {product.name}
          </h3>
          
          <div className="flex items-baseline gap-2 pt-1.5">
            <span className="font-extrabold text-base text-slate-900">
              {formatCurrency(hasDiscount ? product.discountPrice : product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}