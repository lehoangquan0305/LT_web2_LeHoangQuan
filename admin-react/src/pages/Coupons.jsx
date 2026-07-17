import { useEffect, useState } from 'react';
import { couponAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: '',
  minimumOrderAmount: '',
  maximumDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: 0,
  active: true,
};

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '—';
  return Number(value).toLocaleString('vi-VN') + 'đ';
}

function Coupons() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponAPI.getAll();
      if (res.data.success) setCoupons(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const buildPayload = () => ({
    ...formData,
    code: formData.code.toUpperCase().trim(),
    discountValue: formData.discountValue ? Number(formData.discountValue) : 0,
    minimumOrderAmount: formData.minimumOrderAmount ? Number(formData.minimumOrderAmount) : null,
    maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : null,
    usageLimit: formData.usageLimit ? Number(formData.usageLimit) : 0,
    startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
    endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editingId) {
        const res = await couponAPI.update(editingId, payload);
        if (res.data.success) {
          toast.success('Cập nhật mã giảm giá thành công');
          loadCoupons();
        }
      } else {
        const res = await couponAPI.create(payload);
        if (res.data.success) {
          toast.success('Tạo mã giảm giá thành công');
          loadCoupons();
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu mã giảm giá');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENT',
      discountValue: coupon.discountValue ?? '',
      minimumOrderAmount: coupon.minimumOrderAmount ?? '',
      maximumDiscount: coupon.maximumDiscount ?? '',
      startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '',
      endDate: coupon.endDate ? coupon.endDate.slice(0, 10) : '',
      usageLimit: coupon.usageLimit ?? 0,
      active: !!coupon.active,
    });
    setEditingId(coupon.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (coupon) => {
    try {
      const res = await couponAPI.toggle(coupon.id);
      if (res.data.success) {
        toast.success(coupon.active ? 'Đã tắt mã giảm giá' : 'Đã kích hoạt mã giảm giá');
        loadCoupons();
      }
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (coupon) => {
    const ok = await confirm({ title: 'Xóa mã giảm giá', message: `Xóa mã "${coupon.code}"?` });
    if (!ok) return;
    try {
      const res = await couponAPI.delete(coupon.id);
      if (res.data.success) {
        toast.success('Đã xóa mã giảm giá');
        loadCoupons();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa mã giảm giá');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mã giảm giá</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý các chương trình khuyến mãi</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <span>➕</span> Tạo mã mới
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{editingId ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mã code</label>
                <input required name="code" value={formData.code} onChange={handleInputChange} placeholder="SALE50"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none uppercase transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Loại giảm giá</label>
                <select name="discountType" value={formData.discountType} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100">
                  <option value="PERCENT">Phần trăm (%)</option>
                  <option value="FIXED">Số tiền cố định (đ)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Giá trị giảm {formData.discountType === 'PERCENT' ? '(%)' : '(đ)'}
                </label>
                <input required type="number" min="0" name="discountValue" value={formData.discountValue} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả</label>
                <input name="description" value={formData.description} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Đơn tối thiểu (đ)</label>
                <input type="number" min="0" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giảm tối đa (đ)</label>
                <input type="number" min="0" name="maximumDiscount" value={formData.maximumDiscount} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số lượt sử dụng (0 = không giới hạn)</label>
                <input type="number" min="0" name="usageLimit" value={formData.usageLimit} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày bắt đầu</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ngày kết thúc</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer md:col-span-3">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm text-slate-600">Kích hoạt mã giảm giá</span>
              </label>

              <div className="md:col-span-3 flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mã'}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl skeleton" />)}
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="text-4xl mb-3">🎟️</div>
              <p className="text-sm">Chưa có mã giảm giá nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Mã</th>
                    <th className="px-6 py-3">Giảm giá</th>
                    <th className="px-6 py-3">Điều kiện</th>
                    <th className="px-6 py-3">Sử dụng</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c, idx) => (
                    <tr key={c.id} className="table-row-hover stagger-item border-b border-slate-50 last:border-0" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md text-xs">{c.code}</span>
                        <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-700">
                        {c.discountType === 'PERCENT' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        <p>Tối thiểu: {formatCurrency(c.minimumOrderAmount)}</p>
                        <p>Tối đa: {formatCurrency(c.maximumDiscount)}</p>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        {c.usedCount || 0} / {c.usageLimit ? c.usageLimit : '∞'}
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                            c.active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {c.active ? '● Đang bật' : '● Đã tắt'}
                        </button>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 cursor-pointer">✏️</button>
                          <button onClick={() => handleDelete(c)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmUI />
    </div>
  );
}

export default Coupons;
