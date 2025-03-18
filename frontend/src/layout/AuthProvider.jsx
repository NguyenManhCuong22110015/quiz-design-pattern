import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem('user'));
          setUser(userData);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
    
    // Add listener for authentication events
    window.addEventListener('auth-change', checkAuth);
    
    return () => {
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  // Login function
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('username', userData.name);
    localStorage.setItem('userId', userData.id);
    setUser(userData);
    
    // Dispatch event for components to detect auth change
    window.dispatchEvent(new Event('auth-change'));
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setUser(null);
    
    // Dispatch event for components to detect auth change
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);