import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
const [token, setToken] = useState(
    localStorage.getItem("shop_token")
);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('shop_user');
    const token = localStorage.getItem('shop_token');
    if (stored && token) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('shop_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const data = res.data;
    if (!data.success) throw new Error(data.message || 'Đăng nhập thất bại');

    localStorage.setItem('shop_token', data.token);
    const u = { id: data.userId, email: data.email, fullName: data.fullName, role: data.role };
    localStorage.setItem('shop_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    const res = await authAPI.register(payload);
    const data = res.data;
    if (!data.success) throw new Error(data.message || 'Đăng ký thất bại');

    localStorage.setItem('shop_token', data.token);
    const u = { id: data.userId, email: data.email, fullName: data.fullName, role: data.role };
    localStorage.setItem('shop_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('shop_token');
    localStorage.removeItem('shop_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
