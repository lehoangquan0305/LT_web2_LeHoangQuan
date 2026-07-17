import { useEffect, useState } from 'react';
import { categoryAPI } from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Tự động tạo slug mượt mà khi nhập tên danh mục mới
  const handleNameChange = (e) => {
    const nameValue = e.target.value;
    const slugValue = nameValue
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^a-z0-9\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .trim();

    setFormData(prev => ({
      ...prev,
      name: nameValue,
      slug: editingId ? prev.slug : slugValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        const response = await categoryAPI.update(editingId, formData);
        if (response.data.success) {
          setSuccess('Cập nhật danh mục thành công 🎉');
          loadCategories();
        }
      } else {
        const response = await categoryAPI.create(formData);
        if (response.data.success) {
          setSuccess('Tạo danh mục mới thành công 🎉');
          loadCategories();
        }
      }
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    }
  };

  const handleEdit = (category) => {
    setFormData(category);
    setEditingId(category.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này? Hãy đảm bảo không còn sản phẩm nào thuộc danh mục này.')) return;

    try {
      const response = await categoryAPI.delete(id);
      if (response.data.success) {
        setSuccess('Xóa danh mục thành công');
        loadCategories();
      }
    } catch (err) {
      setError('Lỗi khi xóa danh mục');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      
      {/* Top Bar Quản lý */}
      <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm/5">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Quản lý Danh mục</h1>
          <p className="text-xs text-slate-500 mt-0.5">Phân loại cấu trúc nhóm sản phẩm (Giày, Áo, Phụ kiện...) cho hệ thống.</p>
        </div>
        <button 
          onClick={() => { if(showForm) resetForm(); else setShowForm(true); }} 
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all duration-300 cursor-pointer active:scale-95 ${
            showForm 
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
          }`}
        >
          {showForm ? '✖ Đóng Form' : '＋ Thêm danh mục'}
        </button>
      </header>

      {/* Khu vực nội dung chính */}
      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        
        {/* Thông báo trạng thái Alert */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm font-medium text-rose-600 flex items-center gap-2 animate-fade-in">
            <span>⚠️</span> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-medium text-emerald-600 flex items-center gap-2 animate-fade-in">
            <span>✅</span> {success}
          </div>
        )}

        {/* Khối Biểu mẫu Form nhập liệu */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              {editingId ? '📝 Sửa danh mục hệ thống' : '🚀 Thêm danh mục mới'}
            </h3>

            {/* Hàng 1: Tên danh mục & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Tên danh mục *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  placeholder="Ví dụ: Giày Thể Thao, Quần Áo Đua Xe..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Slug (Đường dẫn tĩnh) *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  placeholder="giay-the-thao"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Hàng 2: Link hình ảnh đại diện */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Đường dẫn hình ảnh đại diện (Image URL)</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/category-banner.jpg"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
              />
            </div>

            {/* Hàng 3: Mô tả danh mục */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Mô tả tóm tắt</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Nhập đôi dòng giới thiệu ngắn gọn về nhóm danh mục này..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200"
              />
            </div>

            {/* Hàng 4: Trạng thái kích hoạt */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Kích hoạt danh mục này (Active)
              </label>
            </div>

            {/* Điều hướng thao tác nút Form */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button 
                type="button" 
                onClick={resetForm} 
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-indigo-100 transition-all duration-200 cursor-pointer active:scale-95"
              >
                {editingId ? 'Cập nhật danh mục' : 'Lưu danh mục'}
              </button>
            </div>
          </form>
        )}

        {/* Khối hiển thị dữ liệu Bảng */}
        {loading ? (
          /* Khung tải giả lập mượt mà */
          <div className="space-y-3 animate-pulse">
            <div className="h-10 bg-slate-200 rounded-xl"></div>
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>)}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    <th className="py-4 px-6 w-20">ID</th>
                    <th className="py-4 px-6">Tên phân loại</th>
                    <th className="py-4 px-6">Chuỗi Slug</th>
                    <th className="py-4 px-6 w-36">Trạng thái</th>
                    <th className="py-4 px-6 w-40 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center font-medium text-slate-400 bg-slate-50/10">
                        📂 Hệ thống chưa ghi nhận danh mục sản phẩm nào
                      </td>
                    </tr>
                  ) : (
                    categories.map(category => (
                      <tr key={category.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                        <td className="py-4 px-6 font-semibold text-slate-400 text-xs">#{category.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-base font-bold text-indigo-600 overflow-hidden shrink-0">
                              {category.imageUrl ? (
                                <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                              ) : '📁'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-900 truncate max-w-[220px]">{category.name}</span>
                              {category.description && (
                                <span className="text-[11px] text-slate-400 truncate max-w-[280px]">{category.description}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">
                          {category.slug}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            category.active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${category.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {category.active ? 'Hoạt động' : 'Đang khóa'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Categories;