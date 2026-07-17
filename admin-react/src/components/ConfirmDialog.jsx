/**
 * Modal xác nhận thay thế window.confirm() mặc định xấu xí.
 * Dùng: const [confirmState, askConfirm] = useConfirm(); ... await askConfirm({title, message})
 */
export function ConfirmDialog({ open, title, message, danger = true, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${danger ? 'bg-rose-50' : 'bg-indigo-50'}`}>
          {danger ? '🗑️' : '❓'}
        </div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all duration-200 cursor-pointer active:scale-95"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer active:scale-95 shadow-sm ${
              danger ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
