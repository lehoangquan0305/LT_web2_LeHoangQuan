import { useEffect, useMemo, useState } from 'react';
import { productAPI, categoryAPI, brandAPI, colorAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

const emptyProductForm = {
  name: '', slug: '', shortDescription: '', description: '',
  price: '', discountPrice: '', thumbnailUrl: '',
  featured: false, newArrival: true, active: true,
  categoryId: '', brandId: '',
};

const emptySize = () => ({ _key: Math.random(), size: '', stock: 0 });
const emptyImage = () => ({ _key: Math.random(), imageUrl: '' });
const emptyVariant = () => ({
  _key: Math.random(), colorId: '', sku: '', price: '', discountPrice: '', imageUrl: '',
  sizes: [emptySize()], images: [emptyImage()],
});
const emptyAttribute = () => ({ _key: Math.random(), attributeName: '', attributeValue: '' });

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd').replace(/([^a-z0-9\s])/g, '').replace(/(\s+)/g, '-')
    .replace(/-+/g, '-').trim();
}

function formatCurrency(v) {
  if (v === null || v === undefined || v === '') return '—';
  return Number(v).toLocaleString('vi-VN') + 'đ';
}

function Products() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(emptyProductForm);
  const [variants, setVariants] = useState([emptyVariant()]);
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    loadProducts();
    categoryAPI.getAll().then((r) => setCategories(r.data.data || [])).catch(() => {});
    brandAPI.getAll().then((r) => setBrands(r.data.data || [])).catch(() => {});
    colorAPI.getAll().then((r) => setColors(r.data.data || [])).catch(() => {});
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      if (res.data.success) setProducts(res.data.data);
    } catch {
      toast.error('Lỗi khi tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return products;
    return products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));
  }, [products, search]);

  // ===== FORM: sản phẩm =====
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }));
  };

  const resetForm = () => {
    setForm(emptyProductForm);
    setVariants([emptyVariant()]);
    setAttributes([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddNew = () => { resetForm(); setShowForm(true); };

  const handleEdit = async (product) => {
    try {
      setLoadingForm(true);
      setShowForm(true);
      setEditingId(product.id);
      const res = await productAPI.getFull(product.id);
      const p = res.data.data;

      setForm({
        name: p.name || '', slug: p.slug || '',
        shortDescription: p.shortDescription || '', description: p.description || '',
        price: p.price ?? '', discountPrice: p.discountPrice ?? '', thumbnailUrl: p.thumbnailUrl || '',
        featured: !!p.featured, newArrival: !!p.newArrival, active: p.active !== false,
        categoryId: p.categoryId || '', brandId: p.brandId || '',
      });

      setVariants(
        (p.variants && p.variants.length > 0 ? p.variants : [emptyVariant()]).map((v) => ({
          _key: Math.random(), id: v.id,
          colorId: v.colorId || '', sku: v.sku || '', price: v.price ?? '', discountPrice: v.discountPrice ?? '',
          imageUrl: v.imageUrl || '',
          sizes: (v.sizes && v.sizes.length > 0 ? v.sizes : [emptySize()]).map((s) => ({ _key: Math.random(), id: s.id, size: s.size || '', stock: s.stock ?? 0 })),
          images: (v.images && v.images.length > 0 ? v.images : [emptyImage()]).map((i) => ({ _key: Math.random(), id: i.id, imageUrl: i.imageUrl || '' })),
        }))
      );

      setAttributes((p.attributes || []).map((a) => ({ _key: Math.random(), id: a.id, attributeName: a.attributeName || '', attributeValue: a.attributeValue || '' })));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast.error('Không thể tải chi tiết sản phẩm');
      setShowForm(false);
    } finally {
      setLoadingForm(false);
    }
  };

  // ===== VARIANTS =====
  const updateVariant = (key, field, value) => {
    setVariants((prev) => prev.map((v) => (v._key === key ? { ...v, [field]: value } : v)));
  };
  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (key) => setVariants((prev) => (prev.length > 1 ? prev.filter((v) => v._key !== key) : prev));

  const updateSize = (variantKey, sizeKey, field, value) => {
    setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : {
      ...v, sizes: v.sizes.map((s) => (s._key === sizeKey ? { ...s, [field]: value } : s)),
    }));
  };
  const addSize = (variantKey) => setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : { ...v, sizes: [...v.sizes, emptySize()] }));
  const removeSize = (variantKey, sizeKey) => setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : { ...v, sizes: v.sizes.length > 1 ? v.sizes.filter((s) => s._key !== sizeKey) : v.sizes }));

  const updateImage = (variantKey, imgKey, value) => {
    setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : {
      ...v, images: v.images.map((i) => (i._key === imgKey ? { ...i, imageUrl: value } : i)),
    }));
  };
  const addImage = (variantKey) => setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : { ...v, images: [...v.images, emptyImage()] }));
  const removeImage = (variantKey, imgKey) => setVariants((prev) => prev.map((v) => v._key !== variantKey ? v : { ...v, images: v.images.length > 1 ? v.images.filter((i) => i._key !== imgKey) : v.images }));

  // ===== ATTRIBUTES =====
  const updateAttribute = (key, field, value) => setAttributes((prev) => prev.map((a) => (a._key === key ? { ...a, [field]: value } : a)));
  const addAttribute = () => setAttributes((prev) => [...prev, emptyAttribute()]);
  const removeAttribute = (key) => setAttributes((prev) => prev.filter((a) => a._key !== key));

  const buildPayload = () => ({
    name: form.name,
    slug: form.slug,
    shortDescription: form.shortDescription,
    description: form.description,
    price: form.price ? Number(form.price) : 0,
    discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
    thumbnailUrl: form.thumbnailUrl,
    featured: form.featured,
    newArrival: form.newArrival,
    active: form.active,
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    brandId: form.brandId ? Number(form.brandId) : null,
    variants: variants
      .filter((v) => v.colorId || v.sku || v.sizes.some((s) => s.size))
      .map((v) => ({
        id: v.id,
        colorId: v.colorId ? Number(v.colorId) : null,
        sku: v.sku,
        price: v.price ? Number(v.price) : Number(form.price) || 0,
        discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
        imageUrl: v.imageUrl,
        sizes: v.sizes.filter((s) => s.size).map((s) => ({ id: s.id, size: s.size, stock: Number(s.stock) || 0 })),
        images: v.images.filter((i) => i.imageUrl).map((i, idx) => ({ id: i.id, imageUrl: i.imageUrl, displayOrder: idx })),
      })),
    attributes: attributes
      .filter((a) => a.attributeName)
      .map((a) => ({ id: a.id, attributeName: a.attributeName, attributeValue: a.attributeValue })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryId || !form.brandId) {
      toast.error('Vui lòng chọn danh mục và thương hiệu');
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();
      if (editingId) {
        await productAPI.updateFull(editingId, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productAPI.createFull(payload);
        toast.success('Tạo sản phẩm thành công');
      }
      resetForm();
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = await confirm({ title: 'Xóa sản phẩm', message: `Xóa "${product.name}" cùng toàn bộ biến thể, size, ảnh liên quan?` });
    if (!ok) return;
    try {
      await productAPI.delete(product.id);
      toast.success('Đã xóa sản phẩm');
      loadProducts();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sản phẩm</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý sản phẩm, biến thể màu/size, ảnh và thông số kỹ thuật</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer active:scale-95"
        >
          <span>➕</span> Thêm sản phẩm
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 overflow-y-auto">
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 animate-slideDown relative">
            {loadingForm && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-800 mb-5">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* THÔNG TIN CƠ BẢN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Tên sản phẩm</label>
                  <input required value={form.name} onChange={handleNameChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Slug (URL)</label>
                  <input required name="slug" value={form.slug} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 font-mono" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Danh mục</label>
                  <select required name="categoryId" value={form.categoryId} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Thương hiệu</label>
                  <select required name="brandId" value={form.brandId} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white">
                    <option value="">-- Chọn thương hiệu --</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giá gốc (đ)</label>
                  <input required type="number" min="0" name="price" value={form.price} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Giá khuyến mãi (đ, để trống nếu không giảm)</label>
                  <input type="number" min="0" name="discountPrice" value={form.discountPrice} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ảnh đại diện (URL)</label>
                  <input name="thumbnailUrl" value={form.thumbnailUrl} onChange={handleFieldChange} placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả ngắn</label>
                  <input name="shortDescription" value={form.shortDescription} onChange={handleFieldChange}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Mô tả chi tiết</label>
                  <textarea name="description" value={form.description} onChange={handleFieldChange} rows={4}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none" />
                </div>

                <div className="md:col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="featured" checked={form.featured} onChange={handleFieldChange} className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-slate-600">Sản phẩm nổi bật</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="newArrival" checked={form.newArrival} onChange={handleFieldChange} className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-slate-600">Hàng mới về</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="active" checked={form.active} onChange={handleFieldChange} className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-sm text-slate-600">Đang hiển thị</span>
                  </label>
                </div>
              </div>

              {/* BIẾN THỂ */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800">Biến thể (màu sắc, giá riêng, size &amp; tồn kho, ảnh)</h4>
                  <button type="button" onClick={addVariant} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 cursor-pointer">
                    + Thêm biến thể
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((v, vIdx) => (
                    <div key={v._key} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 animate-fadeIn">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-500">Biến thể #{vIdx + 1}</span>
                        {variants.length > 1 && (
                          <button type="button" onClick={() => removeVariant(v._key)} className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer">Xóa biến thể</button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Màu sắc</label>
                          <select value={v.colorId} onChange={(e) => updateVariant(v._key, 'colorId', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400 bg-white">
                            <option value="">-- Chọn màu --</option>
                            {colors.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">SKU</label>
                          <input value={v.sku} onChange={(e) => updateVariant(v._key, 'sku', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400 font-mono" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Giá riêng (đ)</label>
                          <input type="number" min="0" value={v.price} onChange={(e) => updateVariant(v._key, 'price', e.target.value)} placeholder={form.price || '0'}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Giá KM riêng (đ)</label>
                          <input type="number" min="0" value={v.discountPrice} onChange={(e) => updateVariant(v._key, 'discountPrice', e.target.value)}
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400" />
                        </div>
                        <div className="col-span-2 md:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Ảnh đại diện biến thể (URL)</label>
                          <input value={v.imageUrl} onChange={(e) => updateVariant(v._key, 'imageUrl', e.target.value)} placeholder="https://..."
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:border-indigo-400" />
                        </div>
                      </div>

                      {/* SIZES */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-400">Size &amp; tồn kho</label>
                          <button type="button" onClick={() => addSize(v._key)} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">+ Thêm size</button>
                        </div>
                        <div className="space-y-1.5">
                          {v.sizes.map((s) => (
                            <div key={s._key} className="flex items-center gap-2">
                              <input placeholder="Size (VD: M, 42...)" value={s.size} onChange={(e) => updateSize(v._key, s._key, 'size', e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400" />
                              <input type="number" min="0" placeholder="Tồn kho" value={s.stock} onChange={(e) => updateSize(v._key, s._key, 'stock', e.target.value)}
                                className="w-28 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400" />
                              {v.sizes.length > 1 && (
                                <button type="button" onClick={() => removeSize(v._key, s._key)} className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer text-xs px-1">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* IMAGES */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-slate-400">Ảnh chi tiết (gallery)</label>
                          <button type="button" onClick={() => addImage(v._key)} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">+ Thêm ảnh</button>
                        </div>
                        <div className="space-y-1.5">
                          {v.images.map((img) => (
                            <div key={img._key} className="flex items-center gap-2">
                              <input placeholder="URL ảnh" value={img.imageUrl} onChange={(e) => updateImage(v._key, img._key, e.target.value)}
                                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400" />
                              {img.imageUrl && <img src={img.imageUrl} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" onError={(e) => (e.target.style.display = 'none')} />}
                              {v.images.length > 1 && (
                                <button type="button" onClick={() => removeImage(v._key, img._key)} className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer text-xs px-1">✕</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* THÔNG SỐ KỸ THUẬT */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-800">Thông số kỹ thuật</h4>
                  <button type="button" onClick={addAttribute} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 cursor-pointer">
                    + Thêm thông số
                  </button>
                </div>
                {attributes.length === 0 ? (
                  <p className="text-xs text-slate-400">Chưa có thông số nào. VD: Chất liệu - Vải cotton, Xuất xứ - Việt Nam...</p>
                ) : (
                  <div className="space-y-1.5">
                    {attributes.map((a) => (
                      <div key={a._key} className="flex items-center gap-2">
                        <input placeholder="Tên thông số (VD: Chất liệu)" value={a.attributeName} onChange={(e) => updateAttribute(a._key, 'attributeName', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400" />
                        <input placeholder="Giá trị (VD: Vải cotton)" value={a.attributeValue} onChange={(e) => updateAttribute(a._key, 'attributeValue', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400" />
                        <button type="button" onClick={() => removeAttribute(a._key)} className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer text-xs px-1">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-60">
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
                </button>
                <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* LIST */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Tìm sản phẩm theo tên..."
              className="w-full max-w-sm rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl skeleton" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <div className="text-4xl mb-3">👕</div>
              <p className="text-sm">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Danh mục / Thương hiệu</th>
                    <th className="px-6 py-3">Giá</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="table-row-hover stagger-item border-b border-slate-50 last:border-0" style={{ animationDelay: `${idx * 30}ms` }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnailUrl || 'https://placehold.co/48x48'} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" onError={(e) => { e.target.src = 'https://placehold.co/48x48'; }} />
                          <div>
                            <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.featured ? '⭐ Nổi bật · ' : ''}{p.newArrival ? '🆕 Mới' : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        <p>{p.categoryName || '—'}</p>
                        <p className="text-slate-400">{p.brandName || '—'}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="font-semibold text-slate-700">{formatCurrency(p.discountPrice || p.price)}</p>
                        {p.discountPrice && <p className="text-xs text-slate-400 line-through">{formatCurrency(p.price)}</p>}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${p.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {p.active ? 'Đang bán' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 cursor-pointer">✏️</button>
                          <button onClick={() => handleDelete(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 cursor-pointer">🗑️</button>
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

export default Products;
