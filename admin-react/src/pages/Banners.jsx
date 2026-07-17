import { useEffect, useState } from 'react';
import { bannerAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

const emptyForm = {
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  displayOrder: 0,
  active: true,
};

function Banners() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerAPI.getAll();
      if (res.data.success) setBanners(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await bannerAPI.update(editingId, formData);
        if (res.data.success) {
          toast.success('Cập nhật banner thành công');
          loadBanners();
        }
      } else {
        const res = await bannerAPI.create(formData);
        if (res.data.success) {
          toast.success('Tạo banner mới thành công');
          loadBanners();
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu banner');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      displayOrder: banner.displayOrder ?? 0,
      active: !!banner.active,
    });
    setEditingId(banner.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (banner) => {
    try {
      const res = await bannerAPI.toggle(banner.id);
      if (res.data.success) {
        toast.success(banner.active ? 'Đã ẩn banner' : 'Đã hiển thị banner');
        loadBanners();
      }
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái banner');
    }
  };

  const handleDelete = async (banner) => {
    const ok = await confirm({ title: 'Xóa banner', message: `Xóa banner "${banner.title}"?` });
    if (!ok) return;
    try {
      const res = await bannerAPI.delete(banner.id);
      if (res.data.success) {
        toast.success('Đã xóa banner');
        loadBanners();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa banner');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Banner quảng cáo</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý banner hiển thị trên trang chủ</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <span>➕</span> Thêm banner
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown">
            <h3 className="text-sm font-bold text-slate-800 mb-4">{editingId ? 'Cập nhật banner' : 'Thêm banner mới'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tiêu đề</label>
                <input required name="title" value={formData.title} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ảnh (URL)</label>
                <input required name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Liên kết khi bấm vào</label>
                <input name="linkUrl" value={formData.linkUrl} onChange={handleInputChange} placeholder="/san-pham/..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Thứ tự hiển thị</label>
                <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm text-slate-600">Hiển thị banner</span>
              </label>

              {formData.imageUrl && (
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Xem trước</p>
                  <img src={formData.imageUrl} alt="preview" className="w-full max-h-48 object-cover rounded-xl border border-slate-200" onError={(e) => (e.target.style.display = 'none')} />
                </div>
              )}

              <div className="md:col-span-2 flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-2xl skeleton" />)}
          </div>
        ) : banners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
            <div className="text-4xl mb-3">🖼️</div>
            <p className="text-sm">Chưa có banner nào, hãy thêm mới</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="stagger-item group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://placehold.co/400x160?text=No+Image'; }}
                  />
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-md ${b.active ? 'bg-emerald-500/90 text-white' : 'bg-slate-500/90 text-white'}`}>
                    {b.active ? 'ĐANG HIỂN THỊ' : 'ĐÃ ẨN'}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-bold text-slate-800 text-sm truncate">{b.title}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 h-8">{b.description || 'Không có mô tả'}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-400">Thứ tự: <b className="text-slate-600">{b.displayOrder}</b></span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleToggle(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all duration-200 cursor-pointer" title="Bật/tắt hiển thị">
                        {b.active ? '👁️' : '🙈'}
                      </button>
                      <button onClick={() => handleEdit(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 cursor-pointer">✏️</button>
                      <button onClick={() => handleDelete(b)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer">🗑️</button>
                    </div>
                  </div>
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

export default Banners;
