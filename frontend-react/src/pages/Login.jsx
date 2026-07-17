import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50/50 relative overflow-hidden">
      
      {/* 2 Khối cầu màu Neon siêu đẹp tạo hiệu ứng chiều sâu */}
      <div className="absolute top-10 -left-16 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-10 -right-16 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8000ms]" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(8,112,184,0.07)] hover:shadow-[0_20px_50px_rgba(249,115,22,0.1)] transition-all duration-500 relative z-10 animate-slideUp">
        
        {/* LOGO & TIÊU ĐỀ */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-black tracking-tighter text-slate-900 inline-flex items-center gap-1 hover:opacity-90 transition-opacity">
            SPORT
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 rounded-md transform -skew-x-6 shadow-sm">
              SHOP
            </span>
          </Link>
          <h1 className="font-display text-2xl font-extrabold text-slate-800 mt-6 tracking-tight">
            Chào mừng quay trở lại
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Đăng nhập để tiếp tục mua sắm những cực phẩm thể thao
          </p>
        </div>

        {/* THÔNG BÁO LỖI */}
        {error && (
          <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-700 flex items-start gap-3 animate-slideDown shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* FORM ĐĂNG NHẬP */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* INPUT EMAIL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vi-du@email.com"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-11 pr-4 py-3.5 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
              />
            </div>
          </div>

          {/* INPUT MẬT KHẨU */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Mật khẩu</label>
              <Link to="/quen-mat-khau" className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-200">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 rounded-xl border border-slate-200 pl-11 pr-12 py-3.5 text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* NÚT ĐĂNG NHẬP */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng nhập</span>
            )}
          </button>
        </form>

        {/* CHUYỂN HƯỚNG ĐĂNG KÝ */}
        <p className="text-center text-sm text-slate-500 mt-8">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-bold text-blue-600 relative inline-block group ml-0.5">
            Đăng ký ngay
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;