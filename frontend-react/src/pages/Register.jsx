import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles } from 'lucide-react';

function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
      toast.success('Đăng ký thành công! Chào mừng bạn đến với SportShop 🎉');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Đốm màu rực rỡ phía sau tăng tính thẩm mỹ */}
      <div className="absolute top-1/4 -left-32 w-80 h-80 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-slideUp z-10">
        
        {/* LOGO & TIÊU ĐỀ */}
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-black tracking-wider text-slate-800 inline-flex items-center gap-1 group">
            SPORT<span className="text-orange-500 group-hover:scale-110 transition-transform">SHOP</span>
          </Link>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Đồng hành cùng đam mê của bạn
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-800 tracking-tight mt-4">Tạo tài khoản mới</h1>
          <p className="text-sm text-slate-500 mt-1">Gia nhập cộng đồng SportShop ngay hôm nay</p>
        </div>

        {/* THÔNG BÁO LỖI */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700 animate-slideDown flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* KHUNG BIỂU MẪU */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* HỌ VÀ TÊN */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Họ và tên</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  name="fullName" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  autoFocus
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  type="email" 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>

            {/* SỐ ĐIỆN THOẠI */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>

            {/* MẬT KHẨU */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Mật khẩu</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={form.password} 
                  onChange={handleChange}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-xl border border-slate-200 pl-11 pr-11 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* XÁC NHẬN MẬT KHẨU */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Xác nhận mật khẩu</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleChange}
                  placeholder="Gõ lại mật khẩu phía trên"
                  className="w-full rounded-xl border border-slate-200 pl-11 pr-11 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 focus:bg-white" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* NÚT ĐĂNG KÝ */}
            <div className="pt-2">
              <button
                type="submit" 
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold py-3.5 rounded-xl hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 disabled:opacity-60 transition-all duration-200 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký ngay'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* LINK QUAY VỀ ĐĂNG NHẬP */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Đã có tài khoản rồi?{' '}
          <Link to="/dang-nhap" className="font-bold text-blue-600 hover:text-blue-700 pb-0.5 border-b-2 border-transparent hover:border-blue-500 transition-all">
            Đăng nhập tại đây
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;