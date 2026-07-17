import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { addressAPI, couponAPI, orderAPI } from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
  { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng', icon: '🏦' },
  { value: 'QR_CODE', label: 'Quét mã QR', icon: '📱' },
];

const FREE_SHIP_THRESHOLD = 500000;
const SHIP_FEE = 30000;

function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState({
    receiverName: user?.fullName || '',
    receiverPhone: '',
    shippingAddress: '',
    note: '',
    paymentMethod: 'CASH',
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (!cart.items || cart.items.length === 0) {
      navigate('/gio-hang');
      return;
    }
    addressAPI.getAll().then((res) => {
      const list = res.data.data || [];
      setAddresses(list);
      const def = list.find((a) => a.isDefault) || list[0];
      if (def) {
        setForm((f) => ({
          ...f,
          receiverName: def.receiverName,
          receiverPhone: def.receiverPhone,
          shippingAddress: [def.addressLine, def.ward, def.district, def.province].filter(Boolean).join(', '),
        }));
      }
    }).catch(() => {});
  }, [cart.items, navigate]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const selectAddress = (a) => {
    setForm((f) => ({
      ...f,
      receiverName: a.receiverName,
      receiverPhone: a.receiverPhone,
      shippingAddress: [a.addressLine, a.ward, a.district, a.province].filter(Boolean).join(', '),
    }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setValidatingCoupon(true);
      const res = await couponAPI.validate(couponCode.trim(), cart.subtotal);
      setCouponResult({ code: couponCode.trim(), discount: res.data.discountAmount });
      toast.success(res.data.message || 'Áp dụng mã giảm giá thành công!');
    } catch (err) {
      setCouponResult(null);
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const shippingFee = cart.subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIP_FEE;
  const discount = couponResult?.discount || 0;
  const total = Math.max(0, cart.subtotal - discount + shippingFee);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!form.receiverName.trim() || !form.receiverPhone.trim() || !form.shippingAddress.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin nhận hàng');
      return;
    }

    try {
      setPlacing(true);
      const res = await orderAPI.checkout({
        receiverName: form.receiverName,
        receiverPhone: form.receiverPhone,
        shippingAddress: form.shippingAddress,
        note: form.note,
        couponCode: couponResult ? couponResult.code : null,
        paymentMethod: form.paymentMethod,
      });

      if (res.data.success) {
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã ủng hộ 💕');
        await refreshCart();
        navigate(`/tai-khoan/don-hang/${res.data.data.id}`, { state: { justPlaced: true } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể đặt hàng, vui lòng thử lại');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.items || cart.items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 text-slate-800">
      {/* Tiêu đề thơ mộng */}
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-rose-500/90 mb-8 tracking-tight">Thanh toán đơn hàng</h1>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SỔ ĐỊA CHỈ */}
          {addresses.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-100/60 p-6 shadow-sm shadow-rose-100/20">
              <h2 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-1.5">
                <span className="text-base">📍</span> Chọn từ sổ địa chỉ
              </h2>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {addresses.map((a) => (
                  <button
                    type="button" key={a.id} onClick={() => selectAddress(a)}
                    className="text-left p-4 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/20 transition-all duration-300 cursor-pointer text-xs"
                  >
                    <p className="font-bold text-slate-700">{a.receiverName} · {a.receiverPhone}</p>
                    <p className="text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {[a.addressLine, a.ward, a.district, a.province].filter(Boolean).join(', ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* THÔNG TIN NHẬN HÀNG */}
          <div className="bg-white rounded-2xl border border-rose-100/60 p-6 shadow-sm shadow-rose-100/20">
            <h2 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-1.5">
              <span className="text-base">🌸</span> Thông tin nhận hàng
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Họ tên người nhận</label>
                <input required name="receiverName" value={form.receiverName} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Số điện thoại</label>
                <input required name="receiverPhone" value={form.receiverPhone} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white transition-all" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Địa chỉ giao hàng</label>
                <input required name="shippingAddress" value={form.shippingAddress} onChange={handleChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white transition-all placeholder:text-slate-300" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1.5">Ghi chú (tùy chọn)</label>
                <textarea name="note" value={form.note} onChange={handleChange} rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:bg-white transition-all resize-none placeholder:text-slate-300" />
              </div>
            </div>
          </div>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <div className="bg-white rounded-2xl border border-rose-100/60 p-6 shadow-sm shadow-rose-100/20">
            <h2 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-1.5">
              <span className="text-base">💳</span> Phương thức thanh toán
            </h2>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = form.paymentMethod === m.value;
                return (
                  <label 
                    key={m.value} 
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-rose-300 bg-rose-50/30' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/10'
                    }`}
                  >
                    <input 
                      type="radio" name="paymentMethod" value={m.value} 
                      checked={isSelected} onChange={handleChange} 
                      className="accent-rose-400 w-4 h-4" 
                    />
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{m.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* TỔNG QUAN ĐƠN HÀNG (STICKY SUMMARY) */}
        <div className="lg:col-span-1">
          {/* Biến đổi từ hộp đen sang hộp kem hồng siêu ngọt ngào */}
          <div className="bg-rose-50/80 backdrop-blur-sm border border-rose-100 text-slate-700 rounded-3xl p-6 sticky top-28 shadow-lg shadow-pink-100/20">
            <h2 className="font-display text-lg font-bold text-slate-800 mb-5 flex items-baseline gap-1.5">
              Đơn hàng <span className="text-xs text-slate-400 font-sans font-normal">({cart.totalItems} sản phẩm)</span>
            </h2>

            {/* Danh sách sản phẩm */}
            <div className="max-h-56 overflow-y-auto space-y-3.5 mb-5 pr-1.5 scrollbar-thin scrollbar-thumb-rose-200">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3.5 text-xs items-center">
                  <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white" />
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1 font-semibold text-slate-700">{item.productName}</p>
                    <p className="text-slate-400 mt-0.5">{item.colorName} / {item.size} · SL: {item.quantity}</p>
                  </div>
                  <span className="font-mono text-slate-600 font-medium shrink-0">{formatCurrency(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            {/* Áp dụng Coupon */}
            <div className="flex gap-2 mb-6">
              <input
                value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Nhập mã giảm giá..."
                className="flex-1 rounded-xl bg-white border border-rose-100 px-3.5 py-2.5 text-sm outline-none focus:border-rose-300 transition-colors placeholder:text-slate-300 text-slate-700 shadow-inner"
              />
              <button 
                type="button" onClick={applyCoupon} disabled={validatingCoupon} 
                className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200/70 text-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {validatingCoupon ? '...' : 'Áp dụng'}
              </button>
            </div>

            {/* Chi tiết hóa đơn */}
            <div className="space-y-3 text-sm border-t border-rose-100/80 pt-5">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính</span>
                <span className="font-mono text-slate-700 font-medium">{formatCurrency(cart.subtotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span className="flex items-center gap-1">🏷️ Giảm ({couponResult.code})</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển</span>
                <span className="font-mono text-slate-700 font-medium">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-medium">Miễn phí</span> : formatCurrency(shippingFee)}
                </span>
              </div>
            </div>

            {/* Tổng cộng */}
            <div className="border-t border-rose-100/80 mt-5 pt-5 flex justify-between items-baseline">
              <span className="font-bold text-slate-800">Tổng thanh toán</span>
              <span className="font-mono font-bold text-2xl text-rose-500">{formatCurrency(total)}</span>
            </div>

            {/* Nút đặt hàng lấp lánh ngọt ngào */}
            <button
              type="submit" disabled={placing}
              className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-2xl mt-6 shadow-md shadow-rose-200 hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {placing ? 'Đang xử lý...' : 'Xác nhận đặt hàng 💕'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;