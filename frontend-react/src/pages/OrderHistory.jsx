import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/formatCurrency';

const STATUS_LABELS = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-600 border border-amber-100' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-600 border border-blue-100' },
  SHIPPING: { label: 'Đang giao', color: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
  DELIVERED: { label: 'Đã giao', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-500 border border-rose-100' },
};

function OrderHistory() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getMyOrders();
      setOrders(res.data.data || []);
    } catch {
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 text-slate-800">
      {/* Tiêu đề mềm mại */}
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-rose-500/90 mb-8 tracking-tight">
        Đơn hàng của tôi
      </h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-rose-50/20 border border-rose-100/40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Giao diện trống trải ngọt ngào */
        <div className="py-20 text-center animate-fadeIn">
          <div className="text-6xl mb-5 filter drop-shadow-sm">💝</div>
          <p className="text-slate-400 text-sm mb-6">Bạn chưa có đơn hàng nào ở đây cả</p>
          <Link 
            to="/san-pham" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-7 py-3 rounded-full shadow-md shadow-rose-200 hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            Mua sắm ngay 🌸
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o, idx) => {
            const status = STATUS_LABELS[o.status] || { label: o.status, color: 'bg-slate-50 text-slate-500 border border-slate-100' };
            return (
              <Link
                key={o.id} to={`/tai-khoan/don-hang/${o.id}`}
                className="stagger-item block bg-white rounded-2xl border border-rose-100/60 p-5 hover:border-rose-300 hover:shadow-md hover:shadow-pink-100/10 transition-all duration-300"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Header của thẻ đơn hàng */}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono font-bold text-sm text-slate-700">#{o.orderCode}</p>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                {/* Ngày đặt mua */}
                <p className="text-[11px] text-slate-400 mb-4">
                  {new Date(o.createdAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                
                {/* Người nhận & Tổng tiền */}
                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{o.receiverName}</span> · {o.receiverPhone}
                  </p>
                  <p className="font-mono font-bold text-rose-500 text-base">
                    {formatCurrency(o.totalAmount)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;