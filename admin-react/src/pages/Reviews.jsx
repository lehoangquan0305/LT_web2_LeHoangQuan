import { useEffect, useMemo, useState } from 'react';
import { reviewAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useConfirm } from '../contexts/useConfirm';

function Stars({ rating }) {
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {'★'.repeat(rating || 0)}
      <span className="text-slate-200">{'★'.repeat(5 - (rating || 0))}</span>
    </span>
  );
}

function Reviews() {
  const toast = useToast();
  const { confirm, ConfirmUI } = useConfirm();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [openReplyId, setOpenReplyId] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewAPI.getAll();
      if (res.data.success) setReviews(res.data.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'ALL') return reviews;
    if (filter === 'PENDING') return reviews.filter((r) => !r.approved);
    if (filter === 'APPROVED') return reviews.filter((r) => r.approved);
    return reviews;
  }, [reviews, filter]);

  const handleApprove = async (r) => {
    try {
      const res = await reviewAPI.approve(r.id);
      if (res.data.success) {
        toast.success('Đã duyệt đánh giá');
        loadReviews();
      }
    } catch (err) {
      toast.error('Không thể duyệt đánh giá');
    }
  };

  const handleReject = async (r) => {
    try {
      const res = await reviewAPI.reject(r.id);
      if (res.data.success) {
        toast.success('Đã ẩn đánh giá');
        loadReviews();
      }
    } catch (err) {
      toast.error('Không thể cập nhật đánh giá');
    }
  };

  const handleDelete = async (r) => {
    const ok = await confirm({ title: 'Xóa đánh giá', message: 'Bạn có chắc muốn xóa đánh giá này vĩnh viễn?' });
    if (!ok) return;
    try {
      const res = await reviewAPI.delete(r.id);
      if (res.data.success) {
        toast.success('Đã xóa đánh giá');
        loadReviews();
      }
    } catch (err) {
      toast.error('Lỗi khi xóa đánh giá');
    }
  };

  const handleReply = async (r) => {
    const text = replyDrafts[r.id] ?? r.adminReply ?? '';
    if (!text.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    try {
      const res = await reviewAPI.reply(r.id, text.trim());
      if (res.data.success) {
        toast.success('Đã gửi phản hồi');
        setOpenReplyId(null);
        loadReviews();
      }
    } catch (err) {
      toast.error('Không thể gửi phản hồi');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
      <header className="flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Đánh giá sản phẩm</h1>
          <p className="text-xs text-slate-500 mt-0.5">Duyệt, phản hồi và quản lý đánh giá của khách hàng</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'PENDING', label: 'Chờ duyệt' },
            { key: 'APPROVED', label: 'Đã duyệt' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                filter === f.key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-8 space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400">
            <div className="text-4xl mb-3">⭐</div>
            <p className="text-sm">Không có đánh giá nào ở mục này</p>
          </div>
        ) : (
          filtered.map((r, idx) => (
            <div
              key={r.id}
              className="stagger-item bg-white rounded-2xl border border-slate-100 shadow-sm p-5 transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {r.userName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800 text-sm">{r.userName || 'Ẩn danh'}</p>
                      {r.verifiedPurchase && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">ĐÃ MUA HÀNG</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Sản phẩm: <span className="text-slate-600 font-medium">{r.productName}</span></p>
                    <div className="mt-1.5"><Stars rating={r.rating} /></div>
                  </div>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md ${r.approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {r.approved ? 'ĐÃ DUYỆT' : 'CHỜ DUYỆT'}
                </span>
              </div>

              <p className="text-sm text-slate-600 mt-3 leading-relaxed pl-[52px]">{r.comment}</p>

              {r.adminReply && openReplyId !== r.id && (
                <div className="mt-3 ml-[52px] pl-4 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-xl py-2 px-3">
                  <p className="text-xs font-bold text-indigo-600">Phản hồi từ Shop</p>
                  <p className="text-xs text-slate-600 mt-1">{r.adminReply}</p>
                </div>
              )}

              {openReplyId === r.id && (
                <div className="mt-3 ml-[52px] animate-slideDown">
                  <textarea
                    autoFocus
                    rows={2}
                    value={replyDrafts[r.id] ?? r.adminReply ?? ''}
                    onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    placeholder="Nhập phản hồi cho khách hàng..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleReply(r)} className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all duration-200 cursor-pointer active:scale-95">Gửi phản hồi</button>
                    <button onClick={() => setOpenReplyId(null)} className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">Hủy</button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 pl-[52px]">
                {!r.approved ? (
                  <button onClick={() => handleApprove(r)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all duration-200 cursor-pointer active:scale-95">✓ Duyệt</button>
                ) : (
                  <button onClick={() => handleReject(r)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95">Ẩn đánh giá</button>
                )}
                {openReplyId !== r.id && (
                  <button onClick={() => setOpenReplyId(r.id)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all duration-200 cursor-pointer active:scale-95">
                    {r.adminReply ? 'Sửa phản hồi' : '💬 Phản hồi'}
                  </button>
                )}
                <button onClick={() => handleDelete(r)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold hover:bg-rose-100 transition-all duration-200 cursor-pointer active:scale-95 ml-auto">🗑️ Xóa</button>
              </div>
            </div>
          ))
        )}
      </div>
      <ConfirmUI />
    </div>
  );
}

export default Reviews;
