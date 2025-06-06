import axios from 'axios';
const baseURL = import.meta.env.VITE_BACKEND_API || 'http://localhost:5173/api';

// Tạo instance của axios với cấu hình mặc định
const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
 
    }
    return Promise.reject(error);
  }
);

export default instance;