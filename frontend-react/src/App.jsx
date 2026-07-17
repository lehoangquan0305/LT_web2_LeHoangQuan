import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';

import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Addresses from './pages/Addresses';
import NotFound from './pages/NotFound';
import Chatbox from './components/Chatbox'; // 🌸 Thêm dòng này nè cậu ơi!

import './styles.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/san-pham" element={<ProductList />} />
                <Route path="/san-pham/:slug" element={<ProductDetail />} />
                <Route path="/gio-hang" element={<Cart />} />
                <Route path="/dang-nhap" element={<Login />} />
                <Route path="/dang-ky" element={<Register />} />

                {/* Cần đăng nhập */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/thanh-toan" element={<Checkout />} />
                  <Route path="/yeu-thich" element={<Wishlist />} />
                  <Route path="/tai-khoan/don-hang" element={<OrderHistory />} />
                  <Route path="/tai-khoan/don-hang/:id" element={<OrderDetail />} />
                  <Route path="/tai-khoan/dia-chi" element={<Addresses />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            {/* 🎀 Đặt Chatbox ở đây để nó luôn hiển thị cố định ở góc dưới màn hình */}
            <Chatbox /> 
          </Router>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;