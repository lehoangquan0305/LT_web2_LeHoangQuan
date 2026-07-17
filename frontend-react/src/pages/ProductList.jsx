import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI, brandAPI, wishlistAPI } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const SORT_OPTIONS = [
  { value: '', label: 'Mặc định' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'best_selling', label: 'Bán chạy nhất' },
];

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const keyword = searchParams.get('keyword') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';
  const newArrival = searchParams.get('newArrival') || '';
  const sort = searchParams.get('sort') || '';

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data.data || [])).catch(() => {});
    brandAPI.getAll().then((res) => setBrands(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
  }, [categoryId, brandId, keyword, minPrice, maxPrice, featured, newArrival, sort]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      if (brandId) params.brandId = brandId;
      if (keyword) params.keyword = keyword;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (featured) params.featured = featured;
      if (newArrival) params.newArrival = newArrival;
      if (sort) params.sort = sort;

      const res = await productAPI.search(params);
      setProducts(res.data.data || []);

      if (isLoggedIn) {
        try {
          const wl = await wishlistAPI.get();
          setWishlistIds(new Set((wl.data.data || []).map((w) => w.productId)));
        } catch { /* ignore */ }
      }
    } catch (err) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      return;
    }
    try {
      if (wishlistIds.has(productId)) {
        await wishlistAPI.remove(productId);
        setWishlistIds((prev) => { const s = new Set(prev); s.delete(productId); return s; });
      } else {
        await wishlistAPI.add(productId);
        setWishlistIds((prev) => new Set(prev).add(productId));
      }
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const activeFilterCount = useMemo(() => {
    return [categoryId, brandId, minPrice, maxPrice, featured, newArrival].filter(Boolean).length;
  }, [categoryId, brandId, minPrice, maxPrice, featured, newArrival]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fadeIn">
      {/* Title Section */}
      <div className="mb-10 border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1.5">
            {keyword ? `Kết quả tìm kiếm cho "${keyword}"` : 'SPORT SHOP'}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Tất cả sản phẩm</h1>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Hiển thị <span className="text-slate-900 font-bold">{loading ? '...' : products.length}</span> sản phẩm chất lượng cao
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* FILTER SIDEBAR CARD */}
        <aside className="w-full lg:w-64 shrink-0 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm text-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
            </span>
            <span className="text-xs transition-transform duration-200" style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>

          {/* Filters Body */}
          <div className={`${filtersOpen ? 'block mt-4' : 'hidden'} lg:block space-y-8`}>
            
            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                📁 Danh mục
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => updateParam('categoryId', '')} 
                  className={`flex items-center justify-between w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${!categoryId ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/10' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium'}`}
                >
                  <span>Tất cả danh mục</span>
                </button>
                {categories.map((c) => (
                  <button 
                    key={c.id} 
                    onClick={() => updateParam('categoryId', String(c.id))} 
                    className={`flex items-center justify-between w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${categoryId === String(c.id) ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/10' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium'}`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                👟 Thương hiệu
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => updateParam('brandId', '')} 
                  className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${!brandId ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/10' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium'}`}
                >
                  Tất cả thương hiệu
                </button>
                {brands.map((b) => (
                  <button 
                    key={b.id} 
                    onClick={() => updateParam('brandId', String(b.id))} 
                    className={`w-full text-left text-sm px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${brandId === String(b.id) ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/10' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-medium'}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                💰 Khoảng giá (VND)
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="number" 
                  placeholder="Từ" 
                  defaultValue={minPrice}
                  onBlur={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all text-slate-800 font-semibold"
                />
                <span className="text-slate-300 font-bold">—</span>
                <input
                  type="number" 
                  placeholder="Đến" 
                  defaultValue={maxPrice}
                  onBlur={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Custom Attributes Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={featured === 'true'} 
                  onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')} 
                  className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 cursor-pointer accent-violet-600" 
                />
                <span className="group-hover:text-violet-600 transition-colors">🔥 Sản phẩm nổi bật</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group text-sm font-semibold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={newArrival === 'true'} 
                  onChange={(e) => updateParam('newArrival', e.target.checked ? 'true' : '')} 
                  className="w-5 h-5 rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 cursor-pointer accent-violet-600" 
                />
                <span className="group-hover:text-violet-600 transition-colors">✨ Hàng mới về</span>
              </label>
            </div>

            {/* Reset Filters */}
            {(activeFilterCount > 0 || keyword) && (
              <button 
                onClick={clearFilters} 
                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-rose-100 hover:bg-rose-50 text-sm font-bold text-rose-600 transition-colors cursor-pointer"
              >
                ✕ Xóa bộ lọc ({activeFilterCount})
              </button>
            )}
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div className="flex-1 w-full">
          {/* Sorting Bar */}
          <div className="flex items-center justify-between mb-8 bg-white border border-slate-100 p-4 rounded-3xl shadow-sm">
            <span className="text-sm text-slate-500 font-medium">Sắp xếp theo:</span>
            <select
              value={sort} 
              onChange={(e) => updateParam('sort', e.target.value)}
              className="text-sm font-bold border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-violet-500 transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-700"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Loading Skeleton state */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className="aspect-[4/5] rounded-2xl bg-slate-100 animate-pulse" />
                  <div className="h-3 w-2/3 rounded-full bg-slate-100 animate-pulse" />
                  <div className="h-4 w-1/2 rounded-full bg-slate-100/80 animate-pulse" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="text-6xl mb-4 animate-bounce duration-[3000ms]">🏀</div>
              <p className="text-slate-800 font-extrabold text-lg mb-1">Không tìm thấy sản phẩm nào</p>
              <p className="text-slate-400 text-sm">Bạn hãy thử thay đổi tiêu chí bộ lọc hoặc tìm kiếm nhé!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {products.map((p, idx) => (
                <div key={p.id} className="transition-all duration-300 hover:-translate-y-1">
                  <ProductCard 
                    product={p} 
                    index={idx % 12} 
                    isWishlisted={wishlistIds.has(p.id)} 
                    onToggleWishlist={toggleWishlist} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;