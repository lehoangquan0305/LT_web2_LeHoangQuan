import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setCart({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartAPI.get();
      if (res.data.success) setCart(res.data.data);
    } catch (err) {
      // im lặng - giỏ hàng có thể rỗng hoặc chưa đăng nhập
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productSizeId, quantity = 1) => {
    const res = await cartAPI.addItem(productSizeId, quantity);
    if (res.data.success) setCart(res.data.data);
    return res.data;
  };

  const updateItem = async (itemId, quantity) => {
    const res = await cartAPI.updateItem(itemId, quantity);
    if (res.data.success) setCart(res.data.data);
    return res.data;
  };

  const removeItem = async (itemId) => {
    const res = await cartAPI.removeItem(itemId);
    if (res.data.success) setCart(res.data.data);
    return res.data;
  };

  const clearCart = async () => {
    const res = await cartAPI.clear();
    if (res.data.success) setCart(res.data.data);
  };

  return (
    <CartContext.Provider value={{ cart, loading, refreshCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
