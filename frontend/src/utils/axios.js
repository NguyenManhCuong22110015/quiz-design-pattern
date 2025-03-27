import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';

// Tạo instance của axios với cấu hình mặc định
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor cho requests - tự động thêm token vào header nếu có
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho responses - xử lý lỗi chung
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi 401 (Unauthorized) - token hết hạn hoặc không hợp lệ
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Tùy chọn: chuyển hướng đến trang đăng nhập
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;