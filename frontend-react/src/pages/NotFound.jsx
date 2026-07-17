import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-fadeIn">
      <p className="font-display text-8xl text-ink/10">404</p>
      <h1 className="font-display text-2xl text-ink mt-4">Không tìm thấy trang</h1>
      <p className="text-ink/50 text-sm mt-2 mb-8">Trang bạn tìm không tồn tại hoặc đã bị di chuyển.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-ink text-white font-bold px-7 py-3.5 rounded-full hover:scale-105 transition-transform duration-200">
        Về trang chủ →
      </Link>
    </div>
  );
}

export default NotFound;
