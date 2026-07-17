import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/admin';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Nếu token hết hạn / không hợp lệ -> đưa về trang đăng nhập
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/login', { email, password })
};

// Product APIs
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  // Sản phẩm đầy đủ: kèm biến thể màu/giá riêng + size/tồn kho + ảnh + thông số
  getFull: (id) => api.get(`/products/${id}/full`),
  createFull: (data) => api.post('/products/full', data),
  updateFull: (id, data) => api.put(`/products/${id}/full`, data)
};

// Color APIs (dữ liệu gốc dùng khi tạo biến thể sản phẩm)
export const colorAPI = {
  getAll: () => api.get('/colors'),
  create: (data) => api.post('/colors', data),
  update: (id, data) => api.put(`/colors/${id}`, data),
  delete: (id) => api.delete(`/colors/${id}`)
};

// Inventory APIs (lịch sử kho + điều chỉnh tồn kho thủ công)
export const inventoryAPI = {
  getHistory: () => api.get('/inventory'),
  adjustStock: (productSizeId, quantity, note) => api.post('/inventory/adjust', { productSizeId, quantity, note })
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Brand APIs
export const brandAPI = {
  getAll: () => api.get('/brands'),
  getById: (id) => api.get(`/brands/${id}`),
  create: (data) => api.post('/brands', data),
  update: (id, data) => api.put(`/brands/${id}`, data),
  delete: (id) => api.delete(`/brands/${id}`)
};

// Order APIs
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`)
};

// Banner APIs
export const bannerAPI = {
  getAll: () => api.get('/banners'),
  getById: (id) => api.get(`/banners/${id}`),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  toggle: (id) => api.put(`/banners/${id}/toggle`),
  delete: (id) => api.delete(`/banners/${id}`)
};

// Coupon APIs
export const couponAPI = {
  getAll: () => api.get('/coupons'),
  getById: (id) => api.get(`/coupons/${id}`),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  toggle: (id) => api.put(`/coupons/${id}/toggle`),
  delete: (id) => api.delete(`/coupons/${id}`)
};

// Customer (User) APIs
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  toggle: (id) => api.put(`/customers/${id}/toggle`),
  delete: (id) => api.delete(`/customers/${id}`)
};

// Review APIs
export const reviewAPI = {
  getAll: () => api.get('/reviews'),
  getById: (id) => api.get(`/reviews/${id}`),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  reject: (id) => api.put(`/reviews/${id}/reject`),
  reply: (id, adminReply) => api.put(`/reviews/${id}/reply`, { adminReply }),
  delete: (id) => api.delete(`/reviews/${id}`)
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard')
};

export default api;
