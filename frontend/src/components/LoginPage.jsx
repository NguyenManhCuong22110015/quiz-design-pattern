import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth popup window messaging
  useEffect(() => {
    function handleAuthMessage(event) {
      // Verify the origin for security
      
      
      // Check if this is an auth success message
      if (event.data.type === "AUTH_SUCCESS") {
        const { token, user } = event.data;
        
        // Save auth data to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('username', user.name);
        localStorage.setItem('userId', user.id);
        
        // Redirect to home or intended page
        navigate('/');
      }
    }

    // Add event listener for messages from popup
    window.addEventListener('message', handleAuthMessage);
    
    // Parse URL params (for non-popup flow)
    const params = new URLSearchParams(location.search);
    if (params.has('token')) {
      const token = params.get('token');
      const username = params.get('username');
      const userId = params.get('userId');
      
      // Save auth data to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      localStorage.setItem('userId', userId);
      
      // Create basic user object for consistency
      const user = {
        id: userId,
        name: username
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect to home or return URL
      const returnUrl = params.get('returnUrl') || '/';
      navigate(returnUrl);
    }
    
    // Clean up event listener
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [navigate, location]);

  const handleGoogleLogin = () => {
    // Open Google auth in popup
    const width = 600;
    const height = 600;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    window.open(
      `${process.env.VITE_BACKEND_API || 'http://localhost:5000'}/auth/google`,
      'Google Sign In',
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Login</div>
            <div className="card-body">
              {/* Other login forms if needed */}
              
              <div className="text-center mt-3">
                <button 
                  className="btn btn-danger"
                  onClick={handleGoogleLogin}
                >
                  Login with Google
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;