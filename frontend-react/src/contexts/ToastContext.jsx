import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

// Bộ màu pastel lãng mạn và icon nét vẽ mảnh nhẹ nhàng
const STYLES = {
  success: { 
    bg: 'bg-emerald-50/90 border-emerald-100 text-emerald-800 shadow-emerald-100/30', 
    progressBar: 'bg-emerald-300',
    icon: (
      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  error: { 
    bg: 'bg-rose-50/90 border-rose-100 text-rose-800 shadow-rose-100/30', 
    progressBar: 'bg-rose-300',
    icon: (
      <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    )
  },
  info: { 
    bg: 'bg-sky-50/90 border-sky-100 text-sky-800 shadow-sky-100/30', 
    progressBar: 'bg-sky-300',
    icon: (
      <svg className="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    )
  },
};

function Toast({ id, type, message, onClose }) {
  const style = STYLES[type] || STYLES.info;
  return (
    <div 
      className={`relative overflow-hidden flex items-center gap-3.5 min-w-[300px] max-w-sm rounded-2xl border backdrop-blur-md px-4.5 py-3.5 transition-all duration-300 shadow-lg animate-toastIn ${style.bg}`}
    >
      {/* Icon xinh xắn */}
      <div className="shrink-0 flex items-center justify-center">
        {style.icon}
      </div>

      {/* Tin nhắn mềm mại */}
      <p className="text-sm font-medium leading-relaxed flex-1 tracking-tight pr-2">{message}</p>

      {/* Nút đóng mảnh dẻ */}
      <button 
        onClick={() => onClose(id)} 
        className="opacity-40 hover:opacity-90 transition-opacity cursor-pointer text-slate-500 hover:text-slate-800 p-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Thanh chạy thời gian siêu mảnh ở đáy */}
      <div 
        className={`absolute bottom-0 left-0 h-[3px] rounded-full animate-[shrink_3s_linear_forwards] ${style.progressBar}`} 
        style={{ width: '100%' }} 
      />
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const close = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const show = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => close(id), 3000);
  }, [close]);

  const toast = {
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
    info: (msg) => show(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Container chứa danh sách các toast hiển thị góc trên bên phải */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3.5 max-w-sm pointer-events-auto">
        {toasts.map((t) => <Toast key={t.id} {...t} onClose={close} />)}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}