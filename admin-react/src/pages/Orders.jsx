import { useEffect, useMemo, useState } from 'react';
import { orderAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  { value: 'PACKING', label: 'Đang đóng gói', color: 'bg-violet-50 text-violet-700 border-violet-200/60' },
  { value: 'SHIPPING', label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/60' },
  { value: 'DELIVERED', label: 'Đã giao thành công', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  { value: 'COMPLETED', label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
  { value: 'CANCELLED', label: 'Đã hủy đơn', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  { value: 'RETURNED', label: 'Trả hàng', color: 'bg-rose-50 text-rose-700 border-rose-200/60' },
];

const PAYMENT_LABELS = { CASH: 'Thanh toán khi nhận hàng', BANK_TRANSFER: 'Chuyển khoản', QR_CODE: 'Quét mã QR', VNPAY: 'VNPay', MOMO: 'MoMo' };

function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function getStatusConfig(statusValue) {
  return ORDER_STATUSES.find((s) => s.value === statusValue) || { label: statusValue, color: 'bg-slate-100 text-slate-700 border-slate-200' };
}

function Orders() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [detailOrder, setDetailOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      if (response.data.success) setOrders(response.data.data);
    } catch {
      toast.error('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const handleStatusChange = async (id, status) => {
    if (!status) return;
    try {
      const response = await orderAPI.updateStatus(id, status);
      if (response.data.success) {
        toast.success('Cập nhật trạng thái đơn hàng thành công');
        loadOrders();
        setEditingId(null);
        setEditingStatus('');
        if (detailOrder?.id === id) openDetail(id);
      }
    } catch {
      toast.error('Lỗi khi cập nhật trạng thái đơn hàng');
    }
  };

  const handleDelete = async (order) => {
    const ok = await confirm({ title: 'Xóa đơn hàng', message: `Xóa vĩnh viễn đơn hàng #${order.orderCode}? Hành động này không thể hoàn tác.` });
    if (!ok) return;
    try {
      const response = await orderAPI.delete(order.id);
      if (response.data.success) {
        toast.success('Đã xóa đơn hàng');
        loadOrders();
        if (detailOrder?.id === order.id) setDetailOrder(null);
      }
    } catch {
      toast.error('Lỗi khi xóa đơn hàng');
    }
  };

  const openDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const res = await orderAPI.getById(id);
      if (res.data.success) setDetailOrder(res.data.data);
    } catch {
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi lịch sử mua sắm, cập nhật tiến độ giao vận và xử lý đơn hàng của khách hàng.</p>
        </div>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStatusFilter('ALL')} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            Tất cả ({orders.length})
          </button>
          {ORDER_STATUSES.map((s) => {
            const count = orders.filter((o) => o.status === s.value).length;
            if (count === 0) return null;
            return (
              <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${statusFilter === s.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {s.label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-xl"></div>
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-4 px-6">Mã đơn hàng</th>
                    <th className="py-4 px-6">Khách hàng</th>
                    <th className="py-4 px-6">Tổng giá trị</th>
                    <th className="py-4 px-6 w-56">Trạng thái xử lý</th>
                    <th className="py-4 px-6 w-44">Ngày tạo đơn</th>
                    <th className="py-4 px-6 w-52 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center font-medium text-slate-400 bg-slate-50/10">
                        📦 Không có đơn hàng nào ở mục này
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                          <td className="py-4 px-6">
                            <button onClick={() => openDetail(order.id)} className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer">
                              {order.orderCode}
                            </button>
                          </td>

                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-900">{order.receiverName}</span>
                              <span className="text-xs text-slate-400 mt-0.5 font-mono">{order.receiverPhone}</span>
                              {order.customerEmail && <span className="text-[11px] text-slate-400">{order.customerEmail}</span>}
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                          </td>

                          <td className="py-4 px-6">
                            {editingId === order.id ? (
                              <select
                                value={editingStatus}
                                onChange={(e) => setEditingStatus(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
                              >
                                <option value="" disabled>-- Chọn trạng thái --</option>
                                {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {statusConfig.label}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-6 text-slate-500 text-xs font-medium">{formatDate(order.createdAt)}</td>

                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              {editingId === order.id ? (
                                <>
                                  <button onClick={() => handleStatusChange(order.id, editingStatus)} className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm shadow-indigo-100">Lưu</button>
                                  <button onClick={() => setEditingId(null)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer">Hủy</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => openDetail(order.id)} className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer">Xem</button>
                                  <button onClick={() => { setEditingId(order.id); setEditingStatus(order.status); }} className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer">Cập nhật</button>
                                  <button onClick={() => handleDelete(order)} className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer">Xóa</button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailOrder && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scaleIn">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Đơn hàng #{detailOrder.orderCode}</h3>
                <p className="text-xs text-slate-400">{formatDate(detailOrder.createdAt)}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">✕</button>
            </div>

            {loadingDetail ? (
              <div className="p-10 text-center text-slate-400 text-sm">Đang tải...</div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Khách hàng</p>
                    <p className="font-semibold text-slate-800">{detailOrder.customerName || detailOrder.receiverName}</p>
                    <p className="text-xs text-slate-500">{detailOrder.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Người nhận</p>
                    <p className="font-semibold text-slate-800">{detailOrder.receiverName}</p>
                    <p className="text-xs text-slate-500">{detailOrder.receiverPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Địa chỉ giao hàng</p>
                    <p className="text-slate-700">{detailOrder.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Thanh toán</p>
                    <p className="text-slate-700">{PAYMENT_LABELS[detailOrder.paymentMethod] || detailOrder.paymentMethod || '—'}</p>
                    <p className="text-xs text-slate-500">Trạng thái: {detailOrder.paymentStatus || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Trạng thái đơn</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusConfig(detailOrder.status).color}`}>
                      {getStatusConfig(detailOrder.status).label}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Sản phẩm</p>
                  <div className="space-y-2">
                    {(detailOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                        <img src={item.thumbnailUrl || 'https://placehold.co/48x48'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-slate-400">{item.color} · {item.size} · SL {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between text-slate-500"><span>Tạm tính</span><span>{formatCurrency(detailOrder.subtotal)}</span></div>
                  {detailOrder.discountAmount > 0 && <div className="flex justify-between text-emerald-600"><span>Giảm giá</span><span>-{formatCurrency(detailOrder.discountAmount)}</span></div>}
                  <div className="flex justify-between text-slate-500"><span>Vận chuyển</span><span>{formatCurrency(detailOrder.shippingFee)}</span></div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-100"><span>Tổng cộng</span><span>{formatCurrency(detailOrder.totalAmount)}</span></div>
                </div>

                {detailOrder.statusHistory?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Lịch sử trạng thái</p>
                    <div className="space-y-2">
                      {detailOrder.statusHistory.map((h) => (
                        <div key={h.id} className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-3 py-2">
                          <span className="font-semibold text-slate-700">{getStatusConfig(h.status).label} <span className="text-slate-400 font-normal">· {h.changedBy}</span></span>
                          <span className="text-slate-400">{formatDate(h.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmUI />
    </div>
  );
}

export default Orders;
