export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      return false;
    }
  
    try {
      return Boolean(token);
    } catch (error) {
      // If JSON parse fails, clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
  };
  
  export const getAuthUser = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  };