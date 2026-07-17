import { useEffect, useMemo, useState } from 'react';
import { customerAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

function Customers() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    enabled: true,
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerAPI.getAll();
      if (res.data.success) setCustomers(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search ||
        c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && c.enabled) ||
        (statusFilter === 'DISABLED' && !c.enabled);
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData({ fullName: '', email: '', phone: '', password: '', enabled: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await customerAPI.update(editingId, formData);
        if (res.data.success) {
          toast.success('Cập nhật khách hàng thành công');
          loadCustomers();
        }
      } else {
        const res = await customerAPI.create(formData);
        if (res.data.success) {
          toast.success('Thêm khách hàng mới thành công');
          loadCustomers();
        }
      }
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      password: '',
      enabled: customer.enabled,
    });
    setEditingId(customer.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (customer) => {
    try {
      const res = await customerAPI.toggle(customer.id);
      if (res.data.success) {
        toast.success(customer.enabled ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản');
        loadCustomers();
      }
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleDelete = async (customer) => {
    const ok = await confirm({
      title: 'Xóa khách hàng',
      message: `Bạn có chắc muốn xóa "${customer.fullName}"? Hành động này không thể hoàn tác.`,
    });
    if (!ok) return;

    try {
      const res = await customerAPI.delete(customer.id);
      if (res.data.success) {
        toast.success('Đã xóa khách hàng');
        loadCustomers();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa khách hàng');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Khách hàng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý tài khoản khách hàng của SportShop</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <span>➕</span> Thêm khách hàng
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              {editingId ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Họ và tên</label>
                <input
                  required name="fullName" value={formData.fullName} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
                <input
                  required type="email" disabled={!!editingId} name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Số điện thoại</label>
                <input
                  required name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mật khẩu (mặc định 123456)</label>
                  <input
                    type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="123456"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
                <input type="checkbox" name="enabled" checked={formData.enabled} onChange={handleInputChange} className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm text-slate-600">Kích hoạt tài khoản</span>
              </label>

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

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100">
            <div className="relative flex-1 min-w-[220px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, email hoặc SĐT..."
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'ACTIVE', 'DISABLED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    statusFilter === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'ALL' ? 'Tất cả' : s === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded-xl skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm">Không tìm thấy khách hàng nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Khách hàng</th>
                    <th className="px-6 py-3">Liên hệ</th>
                    <th className="px-6 py-3">Vai trò</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, idx) => (
                    <tr key={c.id} className="table-row-hover stagger-item border-b border-slate-50 last:border-0" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {c.fullName?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{c.fullName}</p>
                            <p className="text-xs text-slate-400">ID #{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-slate-700">{c.email}</p>
                        <p className="text-xs text-slate-400">{c.phone}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
                          {c.roleName || 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                            c.enabled ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {c.enabled ? '● Hoạt động' : '● Đã khóa'}
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

export default Customers;
