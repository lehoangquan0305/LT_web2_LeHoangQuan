import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';
import { formatCurrency } from '../utils/formatCurrency';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED'];
const STATUS_LABELS = {
  PENDING: 'Chờ xử lý', 
  CONFIRMED: 'Đã xác nhận', 
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao', 
  COMPLETED: 'Hoàn thành', 
  CANCELLED: 'Đã hủy',
};
const PAYMENT_LABELS = { 
  CASH: 'Thanh toán khi nhận hàng', 
  BANK_TRANSFER: 'Chuyển khoản ngân hàng', 
  QR_CODE: 'Quét mã QR', 
  VNPAY: 'VNPay', 
  MOMO: 'MoMo' 
};

function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const justPlaced = location.state?.justPlaced;

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getById(id);
      if (res.data.success) setOrder(res.data.data);
    } catch {
      toast.error('Không tìm thấy đơn hàng');
      navigate('/tai-khoan/don-hang');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    const ok = await confirm({ title: 'Hủy đơn hàng', message: 'Bạn có chắc muốn hủy đơn hàng này không thương?' });
    if (!ok) return;
    try {
      await orderAPI.cancel(id);
      toast.success('Đã hủy đơn hàng thành công 🎀');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-64 rounded-3xl bg-rose-50/20 border border-rose-100/40 animate-pulse" />
      </div>
    );
  }
  if (!order) return null;

  const currentStepIdx = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 text-slate-700">
      {/* THÔNG BÁO THÀNH CÔNG PASTEL */}
      {justPlaced && (
        <div className="mb-8 bg-rose-50/40 border border-rose-100/60 rounded-2xl p-6 text-center animate-bounceIn shadow-sm shadow-rose-100/10">
          <p className="font-display text-lg font-bold text-rose-500">🎉 Đặt hàng thành công rồi nè!</p>
          <p className="text-sm text-slate-400 mt-1">Cảm ơn bạn đã mua sắm và ủng hộ chúng mình nhé 🌸</p>
        </div>
      )}

      {/* HEADER ĐƠN HÀNG */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/tai-khoan/don-hang" className="text-xs text-slate-400 hover:text-rose-400 transition-colors font-medium">
            ← Quay lại danh sách đơn hàng
          </Link>
          <h1 className="font-display font-bold text-xl text-slate-800 mt-1.5">Mã đơn hàng: <span className="text-rose-400">#{order.orderCode}</span></h1>
        </div>
        {order.status === 'PENDING' && (
          <button 
            onClick={handleCancel} 
            className="text-xs font-bold text-rose-400 hover:text-rose-500 hover:underline cursor-pointer transition-colors bg-rose-50/50 px-3.5 py-2 rounded-xl border border-rose-100/40"
          >
            Hủy đơn hàng
          </button>
        )}
      </div>

      {/* THANH TRẠNG THÁI PASTEL */}
      {!isCancelled ? (
        <div className="flex items-center mb-12 bg-rose-50/10 border border-rose-100/30 p-6 rounded-3xl">
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm ${idx <= currentStepIdx ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white' : 'bg-slate-100 text-slate-300'}`}>
                  {idx < currentStepIdx ? '✓' : idx + 1}
                </div>
                <p className={`text-[10px] mt-2.5 font-bold tracking-wider uppercase ${idx <= currentStepIdx ? 'text-rose-500' : 'text-slate-300'}`}>
                  {STATUS_LABELS[step]}
                </p>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2.5 transition-all duration-500 rounded-full ${idx < currentStepIdx ? 'bg-rose-300' : 'bg-slate-100'}`} />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-12 bg-rose-50/40 border border-rose-100/60 rounded-2xl p-4.5 text-center text-sm font-bold text-rose-500">
          Đơn hàng này đã bị hủy mất rồi 🌸
        </div>
      )}

      {/* CHI TIẾT SẢN PHẨM & THÔNG TIN THANH TOÁN */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
        <div className="md:col-span-2 space-y-4">
          {order.items.map((item, idx) => (
            <div 
              key={item.id} 
              className="flex gap-4 bg-white rounded-2xl border border-rose-100/50 p-4 shadow-sm shadow-rose-50/30 stagger-item" 
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-50/20 shrink-0 border border-rose-50/50">
                <img 
                  src={item.thumbnailUrl || 'https://placehold.co/200x200?text=GiftShop'} 
                  alt={item.productName} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 line-clamp-1">{item.productName}</p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1 bg-rose-50/30 inline-block px-2 py-0.5 rounded-md border border-rose-100/30">
                  {item.color} · Size {item.size} · SL: {item.quantity}
                </p>
                <p className="font-bold text-xs text-slate-400 mt-2">{formatCurrency(item.unitPrice)}</p>
              </div>
              <p className="font-bold text-sm text-rose-500 shrink-0 self-end md:self-auto">{formatCurrency(item.totalPrice)}</p>
            </div>
          ))}
        </div>

        {/* THÔNG TIN KHÁCH HÀNG & HÓA ĐƠN */}
        <div className="space-y-6">
          {/* ĐỊA CHỈ GIAO HÀNG */}
          <div className="bg-white rounded-2xl border border-rose-100/50 p-5 shadow-sm shadow-rose-50/30">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b border-rose-50 pb-2.5">
              <span className="w-1.5 h-3.5 bg-rose-300 rounded-full"></span>
              Thông tin giao nhận
            </h3>
            <p className="text-sm font-bold text-slate-700">{order.receiverName}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">{order.receiverPhone}</p>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{order.shippingAddress}</p>
            {order.note && (
              <p className="text-xs text-rose-400 mt-3.5 italic bg-rose-50/20 p-2.5 rounded-xl border border-rose-100/20">
                Ghi chú: {order.note}
              </p>
            )}
          </div>

          {/* CHI TIẾT TỔNG TIỀN */}
          <div className="bg-white rounded-2xl border border-rose-100/50 p-5 shadow-sm shadow-rose-50/30">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5 border-b border-rose-50 pb-2.5">
              <span className="w-1.5 h-3.5 bg-pink-300 rounded-full"></span>
              Thanh toán
            </h3>
            <p className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1.5 rounded-lg inline-block">
              {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
            
            <div className="space-y-2.5 text-xs mt-5 pt-4 border-t border-rose-50">
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Tạm tính</span>
                <span className="font-bold text-slate-600">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-500 font-medium">
                  <span>Giảm giá 🎀</span>
                  <span className="font-bold">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Phí vận chuyển</span>
                <span className="font-bold text-slate-600">
                  {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-800 pt-3 border-t border-rose-50/80">
                <span className="text-rose-500">Tổng cộng</span>
                <span className="text-rose-500 text-base">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <ConfirmUI />
    </div>
  );
}

export default OrderDetail;