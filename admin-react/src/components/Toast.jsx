import { useEffect } from 'react';

const STYLES = {
  success: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    icon: '✅',
    bar: 'bg-emerald-500',
  },
  error: {
    bg: 'bg-rose-50 border-rose-200 text-rose-700',
    icon: '⚠️',
    bar: 'bg-rose-500',
  },
  info: {
    bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    icon: 'ℹ️',
    bar: 'bg-indigo-500',
  },
};

/**
 * Toast đơn - dùng cùng với hook useToast bên dưới.
 */
export function Toast({ id, type = 'info', message, onClose }) {
  const style = STYLES[type] || STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3200);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 min-w-[280px] max-w-sm rounded-xl border shadow-lg px-4 py-3 animate-toastIn ${style.bg}`}
      role="alert"
    >
      <span className="text-lg leading-none mt-0.5">{style.icon}</span>
      <p className="text-sm font-medium leading-snug flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer text-sm"
      >
        ✕
      </button>
      <div className={`absolute bottom-0 left-0 h-0.5 ${style.bar} animate-[shrink_3.2s_linear_forwards]`} style={{ width: '100%' }} />
    </div>
  );
}

/**
 * Container cố định góc phải màn hình, render danh sách toast.
 */
export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={onClose} />
      ))}
    </div>
  );
}
