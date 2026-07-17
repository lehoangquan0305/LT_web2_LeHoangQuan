import { useEffect, useState } from 'react';
import { addressAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';
import { MapPin, Phone, User, Plus, Trash2, Edit3, Check, Loader2, Home, Briefcase } from 'lucide-react';

const emptyForm = { receiverName: '', receiverPhone: '', addressLine: '', ward: '', district: '', province: '', isDefault: false };

function Addresses() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await addressAPI.getAll();
      setAddresses(res.data.data || []);
    } catch {
      toast.error('Không thể tải sổ địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await addressAPI.update(editingId, form);
        toast.success('Đã cập nhật địa chỉ');
      } else {
        await addressAPI.create(form);
        toast.success('Đã thêm địa chỉ mới');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (a) => {
    setForm({
      receiverName: a.receiverName || '', receiverPhone: a.receiverPhone || '',
      addressLine: a.addressLine || '', ward: a.ward || '', district: a.district || '',
      province: a.province || '', isDefault: !!a.isDefault,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (a) => {
    const ok = await confirm({ title: 'Xóa địa chỉ', message: `Bạn chắc chắn muốn xóa địa chỉ của "${a.receiverName}"?` });
    if (!ok) return;
    try {
      await addressAPI.delete(a.id);
      toast.success('Đã xóa địa chỉ');
      load();
    } catch { toast.error('Không thể xóa địa chỉ'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 min-h-[80vh]">
      {/* TIÊU ĐỀ & NÚT THÊM */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <MapPin className="w-8 h-8 text-orange-500 animate-bounce" />
            Sổ địa chỉ nhận hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý các địa chỉ nhận hàng để thanh toán nhanh hơn</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }} 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer duration-200"
          >
            <Plus className="w-4 h-4" /> Thêm địa chỉ mới
          </button>
        )}
      </div>

      {/* BIỂU MẪU NHẬP/SỬA ĐỊA CHỈ */}
      {showForm && (
        <form 
          onSubmit={handleSubmit} 
          className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 mb-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] grid sm:grid-cols-2 gap-5 animate-slideDown"
        >
          <div className="sm:col-span-2 pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-base">
              {editingId ? '⚡ Cập nhật thông tin nhận hàng' : '✨ Thêm địa chỉ nhận hàng mới'}
            </h3>
          </div>

          {/* HỌ TÊN */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Họ tên người nhận</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required 
                name="receiverName" 
                value={form.receiverName} 
                onChange={handleChange} 
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
              />
            </div>
          </div>

          {/* SỐ ĐIỆN THOẠI */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required 
                name="receiverPhone" 
                value={form.receiverPhone} 
                onChange={handleChange} 
                placeholder="Ví dụ: 0912345678"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
              />
            </div>
          </div>

          {/* ĐỊA CHỈ CHI TIẾT */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ cụ thể</label>
            <input 
              required 
              name="addressLine" 
              value={form.addressLine} 
              onChange={handleChange} 
              placeholder="Số nhà, ngõ/ngách, tên đường..." 
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
            />
          </div>

          {/* PHƯỜNG / XÃ */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Phường/Xã</label>
            <input 
              name="ward" 
              value={form.ward} 
              onChange={handleChange} 
              placeholder="Phường Bến Nghé"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
            />
          </div>

          {/* QUẬN / HUYỆN */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Quận/Huyện</label>
            <input 
              name="district" 
              value={form.district} 
              onChange={handleChange} 
              placeholder="Quận 1"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
            />
          </div>

          {/* TỈNH / THÀNH PHỐ */}
          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Tỉnh/Thành phố</label>
            <input 
              name="province" 
              value={form.province} 
              onChange={handleChange} 
              placeholder="TP. Hồ Chí Minh"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
            />
          </div>

          {/* CHECKBOX MẶC ĐỊNH */}
          <div className="sm:col-span-2 py-2">
            <label className="inline-flex items-center gap-3 cursor-pointer select-none group">
              <input 
                type="checkbox" 
                name="isDefault" 
                checked={form.isDefault} 
                onChange={handleChange} 
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer" 
              />
              <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Đặt làm địa chỉ mặc định khi đặt hàng</span>
            </label>
          </div>

          {/* NHÓM PHÍM ĐIỀU HƯỚNG FORM */}
          <div className="sm:col-span-2 flex gap-3 pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={saving} 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button 
              type="button" 
              onClick={resetForm} 
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95"
            >
              Hủy bỏ
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH ĐỊA CHỈ */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Bạn chưa có địa chỉ nhận hàng nào được lưu</p>
          <button 
            onClick={() => setShowForm(true)} 
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Tạo địa chỉ đầu tiên của bạn <Plus className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {addresses.map((a, idx) => (
            <div 
              key={a.id} 
              className={`stagger-item bg-white rounded-2xl border p-5 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300 relative ${
                a.isDefault ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-slate-100 shadow-sm'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${a.isDefault ? 'bg-orange-500/10 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {a.isDefault ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                  </div>
                  <p className="font-extrabold text-slate-800 text-base">{a.receiverName}</p>
                </div>
                {a.isDefault && (
                  <span className="text-[10px] font-black px-2 py-1 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white flex items-center gap-0.5 shadow-sm">
                    <Check className="w-3 h-3" /> MẶC ĐỊNH
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" /> {a.receiverPhone}
                </p>
                <p className="flex items-start gap-2 leading-relaxed">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                  <span>{[a.addressLine, a.ward, a.district, a.province].filter(Boolean).join(', ')}</span>
                </p>
              </div>

              {/* NÚT THAO TÁC CỦA TỪNG ĐỊA CHỈ */}
              <div className="flex gap-4 mt-5 pt-4 border-t border-slate-100 justify-end">
                <button 
                  onClick={() => handleEdit(a)} 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Sửa
                </button>
                <button 
                  onClick={() => handleDelete(a)} 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmUI />
    </div>
  );
}

export default Addresses;