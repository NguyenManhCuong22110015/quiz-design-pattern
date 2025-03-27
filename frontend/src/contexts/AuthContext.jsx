import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, logout, getCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const loginUser = async (email, password) => {
    const response = await login(email, password);
    setCurrentUser(response.user);
    return response;
  };

  const registerUser = async (userData) => {
    const response = await register(userData);
    setCurrentUser(response.user);
    return response;
  };

  const logoutUser = async () => {
    await logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;