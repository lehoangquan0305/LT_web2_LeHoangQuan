import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useConfirm } from '../contexts/useConfirm';

function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const { confirm, ConfirmUI } = useConfirm();

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateItem(itemId, quantity);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemove = async (item) => {
    const ok = await confirm({ title: 'Xóa sản phẩm', message: `Xóa "${item.productName}" khỏi giỏ hàng?` });
    if (!ok) return;
    try {
      await removeItem(item.id);
      toast.success('Đã xóa khỏi giỏ hàng');
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  // Hàm xử lý link ảnh thông minh (Nhận diện link online tự động)
  const getCleanImageUrl = (url) => {
    if (!url) return 'https://placehold.co/200x200';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url; // Nếu là link online bạn copy từ mạng, giữ nguyên để render trực tiếp
    }
    return `http://localhost:8080${url}`; // Nếu là link tương đối từ backend local
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center animate-fadeIn">
        <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center bg-gradient-to-tr from-violet-100 to-indigo-50 rounded-full shadow-inner animate-bounce duration-[3000ms]">
          <span className="text-7xl">🛒</span>
          <span className="absolute top-4 right-4 text-3xl animate-ping duration-1000">✨</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Giỏ hàng đang trống!
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Hàng ngàn sản phẩm thể thao cực chất đang chờ bạn khám phá. Hãy lấp đầy giỏ hàng ngay nào!
        </p>
        <Link 
          to="/san-pham" 
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-8 py-4 rounded-2xl hover:opacity-95 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          <span>Khám phá ngay</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-slate-100 pb-6">
        <div className="p-3 bg-violet-50 rounded-2xl text-violet-600">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Giỏ hàng của bạn</h1>
          <p className="text-slate-500 text-sm mt-1">Bạn có <span className="text-violet-600 font-bold">{cart.totalItems}</span> sản phẩm trong giỏ</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* LIST ITEMS */}
        <div className="lg:col-span-2 space-y-5">
          {cart.items.map((item, idx) => (
            <div 
              key={item.id} 
              className="group relative flex gap-4 md:gap-6 bg-white rounded-2xl border border-slate-100 hover:border-violet-100 p-5 shadow-sm hover:shadow-md hover:shadow-slate-100/50 transition-all duration-300 transform" 
            >
              {/* Product Image */}
              <Link 
                to={`/san-pham/${item.productSlug}`} 
                className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100 relative group-hover:scale-[1.02] transition-transform duration-300"
              >
                <img 
                  src={getCleanImageUrl(item.imageUrl)} 
                  alt={item.productName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Link 
                      to={`/san-pham/${item.productSlug}`} 
                      className="font-bold text-base text-slate-800 hover:text-violet-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {item.productName}
                    </Link>
                    <button 
                      onClick={() => handleRemove(item)} 
                      className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Xóa sản phẩm"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Attributes Badges */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.colorName && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600">
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: item.colorCode || '#ddd' }}></span>
                        Màu: {item.colorName}
                      </span>
                    )}
                    {item.size && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600">
                        Size: {item.size}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Quantity Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-50">
                  <div className="flex items-center bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl transition-colors p-1">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all cursor-pointer text-base font-bold disabled:opacity-40"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-slate-800 select-none">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all cursor-pointer text-base font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-slate-400 font-medium">Đơn giá:</span>
                      <span className="text-sm font-bold text-slate-600">
                        {formatCurrency(item.discountPrice || item.price)}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-violet-600 tracking-tight mt-0.5">
                      {formatCurrency(item.lineTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ORDER SUMMARY */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 sticky top-28 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-36 h-36 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"></div>
            
            <h2 className="text-lg font-bold tracking-tight border-b border-white/10 pb-4 mb-5 flex items-center gap-2 relative z-10">
              <span>Tóm tắt đơn hàng</span>
            </h2>

            <div className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between text-slate-400">
                <span>Tạm tính ({cart.totalItems} sản phẩm)</span>
                <span className="font-semibold text-white">{formatCurrency(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Phí vận chuyển</span>
                <span className="text-emerald-400 font-medium">Miễn phí</span>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-xs text-slate-300">
                💡 Đã áp dụng ưu đãi miễn phí vận chuyển toàn quốc.
              </div>
            </div>

            <div className="border-t border-white/10 mt-6 pt-5 flex justify-between items-baseline relative z-10">
              <span className="font-bold text-slate-200">Tổng thanh toán</span>
              <span className="font-extrabold text-2xl text-emerald-400 tracking-tight">
                {formatCurrency(cart.subtotal)}
              </span>
            </div>

            <button
              onClick={() => navigate('/thanh-toan')}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold py-4 rounded-2xl mt-6 hover:opacity-95 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 relative z-10 shadow-lg shadow-emerald-400/10"
            >
              <span>Tiến hành thanh toán</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <Link 
              to="/san-pham" 
              className="block text-center text-xs text-slate-400 hover:text-white transition-colors mt-5 font-semibold relative z-10"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
      <ConfirmUI />
    </div>
  );
}

export default Cart;