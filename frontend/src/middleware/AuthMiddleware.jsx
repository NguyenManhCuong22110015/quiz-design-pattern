import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showError } from '../components/common/Notification';

const AuthMiddleware = ({ children, redirectTo = '/login' }) => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser && !isRedirecting) {
      setIsRedirecting(true); // Đánh dấu đang trong quá trình chuyển hướng
      
      // Hiển thị thông báo ngay lập tức
      showError('Bạn cần đăng nhập để truy cập trang này!');
      
      setTimeout(() => {
        navigate(redirectTo, { state: { from: window.location.pathname } });
      }, 2000);
    }
  }, [currentUser, loading, navigate, redirectTo, isRedirecting]);

  // Hiển thị loading trong các trường hợp
  if (loading || (isRedirecting && !currentUser)) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center mt-5 w-100 h-100">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        {isRedirecting && (
          <p className="text-center">Đang chuyển hướng đến trang đăng nhập...</p>
        )}
      </div>
    );
  }

  // Nếu đã đăng nhập, hiển thị nội dung
  return currentUser ? children : null;
};

export default AuthMiddleware;