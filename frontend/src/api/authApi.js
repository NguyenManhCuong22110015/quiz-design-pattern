import axios from '../utils/axios';


export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    
    localStorage.setItem('token', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};


export const register = async (userData) => {
  try {
    const response = await axios.post('/auth/register', userData);
    
    // Lưu token vào localStorage để tự động đăng nhập sau khi đăng ký
    localStorage.setItem('token', response.data.token);
    
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

/**
 * Đăng xuất người dùng hiện tại
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Gọi API đăng xuất (nếu backend có endpoint này)
    await axios.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Xóa token khỏi localStorage dù có lỗi hay không
    localStorage.removeItem('token');
  }
};


export const getCurrentUser = async () => {
  try {
    // Kiểm tra xem có token không
    const token = localStorage.getItem('user');
    if (!token) {
      throw new Error('No token found');
    }
    const user = JSON.parse(token);

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('user');
    throw error;
  }
};

