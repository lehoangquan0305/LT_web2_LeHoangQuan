import { useEffect, useState } from 'react';
import { inventoryAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const TYPE_LABELS = {
  ORDER: { label: 'Bán hàng', color: 'bg-rose-50 text-rose-700' },
  CANCEL: { label: 'Hoàn kho (hủy đơn)', color: 'bg-emerald-50 text-emerald-700' },
  ADJUST: { label: 'Điều chỉnh thủ công', color: 'bg-indigo-50 text-indigo-700' },
};

function Inventory() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdjust, setShowAdjust] = useState(false);
  const [form, setForm] = useState({ productSizeId: '', quantity: '', note: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await inventoryAPI.getHistory();
      if (res.data.success) setHistory(res.data.data);
    } catch {
      toast.error('Lỗi khi tải lịch sử kho');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productSizeId || !form.quantity) {
      toast.error('Vui lòng nhập ID size sản phẩm và số lượng');
      return;
    }
    try {
      setSaving(true);
      await inventoryAPI.adjustStock(Number(form.productSizeId), Number(form.quantity), form.note);
      toast.success('Đã điều chỉnh tồn kho');
      setForm({ productSizeId: '', quantity: '', note: '' });
      setShowAdjust(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể điều chỉnh tồn kho');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kho hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Lịch sử biến động tồn kho theo từng size sản phẩm</p>
        </div>
        <button onClick={() => setShowAdjust((s) => !s)} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95">
          <span>📦</span> Điều chỉnh tồn kho
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showAdjust && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown max-w-xl">
            <h3 className="text-sm font-bold text-slate-800 mb-1">Điều chỉnh tồn kho thủ công</h3>
            <p className="text-xs text-slate-400 mb-4">Lấy "ID size sản phẩm" ở trang Sản phẩm khi chỉnh sửa biến thể, hoặc từ cột "Size ID" bên dưới bảng lịch sử.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">ID size sản phẩm</label>
                <input required type="number" name="productSizeId" value={form.productSizeId} onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số lượng (+/-)</label>
                <input required type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="VD: 50 hoặc -5"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ghi chú</label>
                <input name="note" value={form.note} onChange={handleChange} placeholder="VD: Nhập hàng đợt mới"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div className="md:col-span-3 flex gap-3">
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Xác nhận điều chỉnh'}
                </button>
                <button type="button" onClick={() => setShowAdjust(false)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">Hủy</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-xl skeleton" />)}</div>
          ) : history.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-sm">Chưa có biến động kho nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Size ID</th>
                    <th className="px-6 py-3">Loại</th>
                    <th className="px-6 py-3">Thay đổi</th>
                    <th className="px-6 py-3">Tồn hiện tại</th>
                    <th className="px-6 py-3">Ghi chú</th>
                    <th className="px-6 py-3">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, idx) => {
                    const type = TYPE_LABELS[h.type] || { label: h.type, color: 'bg-slate-100 text-slate-600' };
                    return (
                      <tr key={h.id} className="table-row-hover stagger-item border-b border-slate-50 last:border-0" style={{ animationDelay: `${idx * 20}ms` }}>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-800">{h.productName}</p>
                          <p className="text-xs text-slate-400">{h.colorName} · Size {h.size} · {h.sku}</p>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-xs text-slate-500">#{h.productSizeId}</td>
                        <td className="px-6 py-3.5"><span className={`text-xs font-bold px-2.5 py-1 rounded-md ${type.color}`}>{type.label}</span></td>
                        <td className={`px-6 py-3.5 font-bold ${h.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{h.quantity > 0 ? '+' : ''}{h.quantity}</td>
                        <td className="px-6 py-3.5 font-semibold text-slate-700">{h.currentStock}</td>
                        <td className="px-6 py-3.5 text-xs text-slate-500">{h.note}</td>
                        <td className="px-6 py-3.5 text-xs text-slate-400">{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
