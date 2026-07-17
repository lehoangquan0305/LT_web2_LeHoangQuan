export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fadeIn" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scaleIn">
        <h3 className="text-base font-bold text-ink font-display">{title}</h3>
        <p className="text-sm text-ink/60 mt-2 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-ink bg-ink/5 hover:bg-ink/10 transition-all duration-200 cursor-pointer active:scale-95">
            Hủy
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-ink bg-volt hover:brightness-95 transition-all duration-200 cursor-pointer active:scale-95">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
