import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productAPI, reviewAPI, wishlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { RatingStars } from '../components/RatingStars';
import { formatCurrency } from '../utils/formatCurrency';

function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getBySlug(slug);
      if (!res.data.success) {
        toast.error('Không tìm thấy sản phẩm');
        navigate('/san-pham');
        return;
      }
      const p = res.data.data;
      setProduct(p);

      const firstVariant = p.variants?.[0] || null;
      setSelectedVariant(firstVariant);
      setSelectedImage(firstVariant?.images?.[0]?.imageUrl || firstVariant?.imageUrl || p.thumbnailUrl);
      setSelectedSize(null);

      loadReviews(p.id);

      if (isLoggedIn) {
        try {
          const wl = await wishlistAPI.get();
          setIsWishlisted((wl.data.data || []).some((w) => w.productId === p.id));
        } catch { /* ignore */ }
      }
    } catch (err) {
      toast.error('Có lỗi khi tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (productId) => {
    try {
      const res = await reviewAPI.getByProduct(productId);
      setReviews(res.data.data || []);
    } catch { /* ignore */ }
  };

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant.images?.[0]?.imageUrl || variant.imageUrl || product.thumbnailUrl);
    setSelectedSize(null);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/dang-nhap', { state: { from: { pathname: `/san-pham/${slug}` } } });
      return;
    }
    if (!selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }
    try {
      setAdding(true);
      await addItem(selectedSize.id, quantity);
      toast.success('Đã thêm vào giỏ hàng thành công! 🌸');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAdding(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistAPI.remove(product.id);
        setIsWishlisted(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await wishlistAPI.add(product.id);
        setIsWishlisted(true);
        toast.success('Đã thêm vào yêu thích 💖');
      }
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.info('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmittingReview(true);
      await reviewAPI.submit(product.id, reviewForm.rating, reviewForm.comment.trim());
      toast.success('Cảm ơn bạn! Đánh giá sẽ hiển thị sau khi được duyệt 🎀');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 grid md:grid-cols-2 gap-10">
        <div className="aspect-square rounded-2xl bg-rose-50/20 border border-rose-100/40 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded bg-rose-50/20 animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-rose-50/20 animate-pulse" />
          <div className="h-6 w-1/4 rounded bg-rose-50/20 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const price = selectedVariant?.price ?? product.price;
  const discountPrice = selectedVariant?.discountPrice ?? product.discountPrice;
  const hasDiscount = discountPrice && discountPrice < price;
  const percentOff = hasDiscount ? Math.round(100 - (discountPrice / price) * 100) : 0;
  const allImages = selectedVariant?.images?.length ? selectedVariant.images.map((i) => i.imageUrl) : [product.thumbnailUrl];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 text-slate-700">
      {/* BREADCRUMB MỀM MẠI */}
      <div className="text-xs text-slate-400 mb-8 flex items-center gap-2 font-medium">
        <Link to="/" className="hover:text-rose-400 transition-colors">Trang chủ</Link> 
        <span className="text-slate-300">/</span>
        <Link to="/san-pham" className="hover:text-rose-400 transition-colors">Sản phẩm</Link> 
        <span className="text-slate-300">/</span>
        <span className="text-slate-500 truncate max-w-[200px] md:max-w-none">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-14">
        {/* KHU VỰC HÌNH ẢNH */}
        <div className="animate-fadeIn">
          <div className="aspect-square rounded-3xl overflow-hidden bg-rose-50/10 mb-4 border border-rose-100/60 shadow-sm shadow-rose-100/10">
            <img
              src={selectedImage || 'https://placehold.co/600x600?text=GiftShop'}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
              onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=GiftShop'; }}
            />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-200 cursor-pointer ${selectedImage === img ? 'border-rose-400 scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KHU VỰC THÔNG TIN SẢN PHẨM */}
        <div className="animate-slideUp flex flex-col justify-center">
          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">{product.brandName || 'Sản phẩm thủ công'}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-3">{product.name}</h1>

          {/* ĐÁNH GIÁ & ĐÃ BÁN */}
          <div className="flex items-center gap-3 mb-6">
            <RatingStars rating={product.averageRating} />
            <span className="text-sm text-slate-400 font-medium">
              {product.averageRating > 0 ? product.averageRating : 'Chưa có'} ({product.reviewCount || 0} đánh giá)
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-sm text-slate-400 font-medium">Đã bán {product.soldCount || 0}</span>
          </div>

          {/* KHUNG GIÁ CẢ PASTEL */}
          <div className="flex items-center gap-3 mb-6 bg-rose-50/20 p-4 rounded-2xl border border-rose-100/40">
            <span className="font-bold text-3xl text-rose-500">{formatCurrency(hasDiscount ? discountPrice : price)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-slate-400 line-through font-medium">{formatCurrency(price)}</span>
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-lg">
                  -{percentOff}%
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-slate-400 text-sm leading-relaxed mb-6 border-l-2 border-rose-200 pl-4">{product.shortDescription}</p>
          )}

          {/* CHỌN MÀU SẮC (VARIANTS) */}
          {product.variants?.length > 1 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Màu sắc: <span className="text-slate-700">{selectedVariant?.colorName}</span></h3>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVariant(v)}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110 ${selectedVariant?.id === v.id ? 'border-rose-400 scale-110 shadow-md ring-4 ring-rose-50/60' : 'border-slate-100'}`}
                    style={{ backgroundColor: v.colorCode || '#ccc' }}
                    title={v.colorName}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CHỌN KÍCH THƯỚC */}
          {selectedVariant?.sizes?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Kích thước</h3>
              <div className="flex flex-wrap gap-2">
                {selectedVariant.sizes.map((s) => {
                  const outOfStock = !s.stock || s.stock <= 0;
                  return (
                    <button
                      key={s.id}
                      disabled={outOfStock}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[54px] px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                        outOfStock ? 'border-slate-100 text-slate-300 line-through cursor-not-allowed bg-slate-50/50' :
                        selectedSize?.id === s.id ? 'border-rose-400 bg-rose-400 text-white shadow-md shadow-rose-200' : 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/20'
                      }`}
                    >
                      {s.size}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <p className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center gap-1.5 animate-fadeIn">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Còn lại {selectedSize.stock} sản phẩm
                </p>
              )}
            </div>
          )}

          {/* SỐ LƯỢNG VÀ NÚT MUA HÀNG PASTEL */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50/50 h-13">
              <button 
                onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                className="w-11 h-full flex items-center justify-center text-slate-400 font-bold hover:bg-slate-100 transition-colors cursor-pointer rounded-l-xl"
              >
                −
              </button>
              <span className="w-10 text-center font-bold text-sm text-slate-700">{quantity}</span>
              <button 
                onClick={() => setQuantity((q) => q + 1)} 
                className="w-11 h-full flex items-center justify-center text-slate-400 font-bold hover:bg-slate-100 transition-colors cursor-pointer rounded-r-xl"
              >
                +
              </button>
            </div>

            {/* NÚT THÊM GIỎ HÀNG GRADIENT HỒNG DÂU */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 h-13 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-bold rounded-xl shadow-md shadow-rose-100 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.119-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {adding ? 'ĐANG XỬ LÝ...' : 'THÊM VÀO GIỎ HÀNG'}
            </button>

            {/* NÚT YÊU THÍCH TRÁI TIM */}
            <button
              onClick={handleToggleWishlist}
              className={`w-13 h-13 rounded-xl border flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
                isWishlisted 
                  ? 'bg-rose-400 border-rose-400 text-white shadow-md shadow-rose-200' 
                  : 'border-slate-200 text-slate-300 hover:text-rose-400 hover:border-rose-200'
              }`}
            >
              <svg 
                className={`w-6 h-6 transition-transform duration-300 ${isWishlisted ? 'scale-110' : ''}`} 
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
        </div>
      </div>

      {/* MÔ TẢ & THÔNG SỐ */}
      <div className="grid md:grid-cols-3 gap-10 mt-20 border-t border-rose-100/50 pt-16">
        <div className="md:col-span-2">
          <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Mô tả chi tiết</h2>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{product.description || 'Đang cập nhật mô tả chi tiết.'}</p>
        </div>
        {product.attributes?.length > 0 && (
          <div className="bg-rose-50/10 p-6 rounded-2xl border border-rose-100/40">
            <h2 className="font-display text-base font-bold text-slate-800 mb-4">Thông số chi tiết</h2>
            <dl className="space-y-3">
              {product.attributes.map((a) => (
                <div key={a.id} className="flex justify-between text-xs py-2.5 border-b border-rose-50 last:border-0">
                  <dt className="text-slate-400 font-semibold">{a.attributeName}</dt>
                  <dd className="font-bold text-slate-600">{a.attributeValue}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* ĐÁNH GIÁ (REVIEWS) */}
      <div className="mt-20 max-w-3xl border-t border-rose-100/50 pt-16">
        <h2 className="font-display text-xl font-bold text-slate-800 mb-6">Đánh giá từ khách hàng ({reviews.length})</h2>

        {isLoggedIn && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-rose-100/60 p-6 mb-10 shadow-sm shadow-rose-100/10">
            <p className="text-sm font-bold text-slate-700 mb-2">Đánh giá của bạn</p>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button 
                  key={n} 
                  type="button" 
                  onClick={() => setReviewForm((f) => ({ ...f, rating: n }))} 
                  className="text-2xl cursor-pointer transition-transform hover:scale-120 text-slate-200 focus:outline-none animate-fadeIn"
                >
                  <svg 
                    className={`w-7 h-7 ${n <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Chia sẻ cảm nhận chân thực của bạn về sản phẩm..."
              rows={3}
              className="w-full rounded-xl border border-rose-100/60 px-4 py-3 text-sm outline-none focus:border-rose-300 transition-colors resize-none text-slate-600 placeholder:text-slate-300"
            />
            <button 
              type="submit" 
              disabled={submittingReview} 
              className="mt-3 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-sm shadow-rose-100 transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {submittingReview ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="bg-rose-50/10 p-8 rounded-2xl border border-rose-100/30 text-center">
            <p className="text-slate-400 text-sm">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ trải nghiệm nhé! 🌸</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-rose-50/60 pb-6 last:border-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-9 h-9 rounded-full bg-rose-50/30 text-rose-400 border border-rose-100/40 flex items-center justify-center text-xs font-bold">
                    {r.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-700">{r.userName || 'Ẩn danh'}</p>
                      {r.verifiedPurchase && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
                          ĐÃ MUA HÀNG
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">
                      <RatingStars rating={r.rating} />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mt-2 pl-12">{r.comment}</p>
                {r.adminReply && (
                  <div className="mt-3 ml-12 bg-rose-50/10 border-l-4 border-rose-300 rounded-r-2xl p-4">
                    <p className="text-xs font-bold text-slate-700">Phản hồi từ cửa hàng 🌸</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;