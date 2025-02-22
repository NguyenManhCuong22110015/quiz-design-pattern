import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/loginService';

const AuthMiddleware = ({ children }) => {
  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthMiddleware;