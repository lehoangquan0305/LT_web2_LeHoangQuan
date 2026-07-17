import { useEffect, useState } from 'react';
import { colorAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

const emptyForm = { name: '', code: '#000000', active: true };

function Colors() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await colorAPI.getAll();
      if (res.data.success) setColors(res.data.data);
    } catch {
      toast.error('Lỗi khi tải danh sách màu sắc');
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
        await colorAPI.update(editingId, form);
        toast.success('Đã cập nhật màu sắc');
      } else {
        await colorAPI.create(form);
        toast.success('Đã thêm màu sắc mới');
      }
      resetForm();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, code: c.code, active: c.active });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (c) => {
    const ok = await confirm({ title: 'Xóa màu sắc', message: `Xóa màu "${c.name}"? Các biến thể đang dùng màu này có thể bị ảnh hưởng.` });
    if (!ok) return;
    try {
      await colorAPI.delete(c.id);
      toast.success('Đã xóa màu sắc');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa màu sắc');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Màu sắc</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dữ liệu gốc dùng khi tạo biến thể sản phẩm</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95">
          <span>➕</span> Thêm màu
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown max-w-lg">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{editingId ? 'Cập nhật màu sắc' : 'Thêm màu sắc mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên màu</label>
                <input required name="name" value={form.name} onChange={handleChange} placeholder="VD: Đen, Trắng, Đỏ đô..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mã màu</label>
                <div className="flex items-center gap-3">
                  <input type="color" name="code" value={form.code} onChange={handleChange} className="w-12 h-11 rounded-lg border border-slate-200 cursor-pointer" />
                  <input name="code" value={form.code} onChange={handleChange} placeholder="#000000"
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none font-mono transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm text-slate-600">Đang sử dụng</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">Hủy</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">{[1,2,3,4,5,6].map((i) => <div key={i} className="h-24 rounded-2xl skeleton" />)}</div>
        ) : colors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm">Chưa có màu sắc nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {colors.map((c, idx) => (
              <div key={c.id} className="stagger-item bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1" style={{ animationDelay: `${idx * 40}ms` }}>
                <div className="w-10 h-10 rounded-full mx-auto border border-slate-200 mb-2" style={{ backgroundColor: c.code }} />
                <p className="text-xs font-bold text-slate-700 truncate">{c.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{c.code}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button onClick={() => handleEdit(c)} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">Sửa</button>
                  <button onClick={() => handleDelete(c)} className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer">Xóa</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ConfirmUI />
    </div>
  );
}

export default Colors;
