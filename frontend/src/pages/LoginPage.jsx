import { useState, useEffect } from "react";
import "../styles/Login.css";
import { login, signup } from "../api/LoginAPi";
import { showSuccess, showError } from "../components/common/Notification";
import { useNavigate, useLocation } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    document.body.classList.add('auth-page');

    return () => {
      document.body.classList.remove('auth-page');
    };
  }, []);
  useEffect(() => {
    // Get return URL from query parameter or state
    const params = new URLSearchParams(location.search);
    const returnUrl = params.get('returnUrl') || '/';
    
    // Store return URL in localStorage for when we return from OAuth provider
    localStorage.setItem('returnUrl', returnUrl);
    
    // Check if we're returning from a social login
    const token = params.get('token');
    if (token) {
      handleSocialLoginCallback(token, params);
    }
  }, [location]);
  
  const handleSocialLoginCallback = (token, params) => {
    // Store the token
    localStorage.setItem("token", token);
    
    // Store user details if available
    const username = params.get('username');
    const userId = params.get('userId');
    const email = params.get('email');
    const authProvider = params.get('authProvider');
    const profileImage = params.get('profileImage');
    
    // Create a proper user object
    const user = {
      id: userId,
      name: username,
      email: email || '',
      authProvider: authProvider || 'google',
      profileImage: profileImage || ''
    };
    
    // Store individual properties and complete user object
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);
    if (email) localStorage.setItem("email", email);
    localStorage.setItem("user", JSON.stringify(user));
    
    // Navigate back to the return URL
    const navigateBack = localStorage.getItem('returnUrl') || '/';
    
    // Show success notification
    showSuccess("Login successful");
    
    // Remove the token from URL (cleaner history)
    window.history.replaceState({}, document.title, "/login");
    
    // Redirect to the original page
    setTimeout(() => {
      window.location.href = navigateBack;
    }, 1000);
  };

  useEffect(() => {
    const handleAuthMessage = (event) => {
      
      
      const { type, token, user } = event.data;
      
      if (type === "AUTH_SUCCESS" && token) {
       
        localStorage.setItem("token", token);
        localStorage.setItem("username", user.name);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("email", user.email);
        localStorage.setItem("user", JSON.stringify(user));
        showSuccess(`Login successful`);
        
        const returnUrl = localStorage.getItem('returnUrl') || '/';
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 1000);
      }
    };
    
    window.addEventListener('message', handleAuthMessage);
    
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  const showFormLogIn = () => setIsLogin(true);
  const showFormSignUp = () => setIsLogin(false);

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("login_email"),
      password: formData.get("login_password"),
    }
    try {
      const user = await login(data);
      
      if (user.token) {
        localStorage.setItem("token", user.token); 
        localStorage.setItem("username", user.user.name); 
        localStorage.setItem("userId", user.user.id);
        
        // Store the complete user object
        localStorage.setItem("user", JSON.stringify(user.user));
      }
      showSuccess("Login successful");
      
      // Navigate back to return URL
      const returnUrl = localStorage.getItem('returnUrl') || '/';
      setTimeout(() => {
        window.location.href = returnUrl;
      }, 1000);
    } 
    catch (error) {
      showError("Login failed");
      setError("Invalid email or password");
    };
  }

  const handleSubmitSignup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("reg_email"),
      password: formData.get("reg_password"),
    }
  
    try {
      await signup(data);
      showSuccess("Account created successfully");
      
      // Switch to login form after successful registration
      setTimeout(() => {
        showFormLogIn();
      }, 1500);
    } catch (error) {
      showError("Failed to create account");
      setError("Registration failed. This email may already be in use.");
    };
  }
  
  const handleSocialLogin = (provider) => {
    // Get return URL
    const returnUrl = localStorage.getItem('returnUrl') || '/';
    
    // Build the OAuth URL with returnUrl
    // Make sure this points to your backend server, not the frontend
    const authUrl = `${import.meta.env.VITE_BACKEND_API}/auth/${provider.toLowerCase()}?returnUrl=${encodeURIComponent(returnUrl)}`;
    
    // Configure popup dimensions
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open provider's authentication page in a popup
    const authWindow = window.open(
      authUrl,
      `${provider}Auth`,
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );
    
    // No need to poll for window closing as we're using window.postMessage
  };

  return (
    <div className="auth-page-wrapper d-flex justify-content-center align-items-center min-vh-100">
      {isLogin ? 
        <LoginForm 
          showFormSignUp={showFormSignUp} 
          handleSubmitLogin={handleSubmitLogin} 
          error={error}
          handleSocialLogin={handleSocialLogin} 
        /> : 
        <SignUpForm 
          showFormLogIn={showFormLogIn} 
          handleSubmitSignup={handleSubmitSignup} 
          error={error}
          handleSocialLogin={handleSocialLogin} 
        />
      }
    </div>
  );
}

function LoginForm({ showFormSignUp, handleSubmitLogin, error, handleSocialLogin }) {
  return (
    <div className="form-login mb-5">
      <form method="post" onSubmit={handleSubmitLogin}>
        <div className="content">
          <div className="data">
            <div className="d-flex justify-content-center align-item-center">
              <a href="/"><img src="/imgs/logo.jpg" alt="Logo" /></a>
            </div>
            <h4 className="text-center"><b>Sign in to your account</b></h4>
            <h5 className="text-center">Don't have an account? <span className="redr" onClick={showFormSignUp}>Sign up</span></h5>
            <div className="mt-4">
              <label alt="Email address">Email address</label>
              <input type="text" required name="login_email" />
            </div>
            <div className="password-container">
              <label alt="Enter password">Password</label>
              <input type="password" id="password" name="login_password" required />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <a className="redr" href="/reset-password">Forgot password?</a><br/>
            <button type="submit" className="submit mt-3 mb-4">Sign in</button>
            
            <div className="divider d-flex align-items-center mb-4">
              <p className="text-center fw-bold mx-3 mb-0">OR</p>
            </div>
            
            <SocialButtons handleSocialLogin={handleSocialLogin} />
          </div>
        </div>
      </form>
    </div>
  );
}

function SignUpForm({ showFormLogIn, handleSubmitSignup, error, handleSocialLogin }) {
  return (
    <div className="form-signup mb-5">
      <form method="post" onSubmit={handleSubmitSignup}>
        <div className="content">
          <div className="data">
            <div className="d-flex justify-content-center align-item-center">
              <a href="/"><img src="/imgs/logo.jpg" alt="Logo" /></a>
            </div>
            <h4 className="text-center"><b>Create your account</b></h4>
            <h5 className="text-center">Already have an account? <span className="redr" onClick={showFormLogIn}>Sign in</span></h5>
            <div className="mt-4">
              <label alt="Email address">Email address</label>
              <input type="text" name="reg_email" required />
            </div>
            <div className="password-container">
              <label alt="Enter password">Password</label>
              <input type="password" id="password2" name="reg_password" required />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="submit mb-4">Create Account</button>
            
            <div className="divider d-flex align-items-center mb-4">
              <p className="text-center fw-bold mx-3 mb-0">OR</p>
            </div>
            
            <SocialButtons handleSocialLogin={handleSocialLogin} />
          </div>
        </div>
      </form>
    </div>
  );
}

function SocialButtons({ handleSocialLogin }) {
  return (
    <div className="login-buttons">
      <button 
        type="button" 
        className="btn btn-social btn-google" 
        onClick={() => handleSocialLogin('Google')}
      >
        <i className="fab fa-google"></i> Continue with Google
      </button>
      <button 
        type="button" 
        className="btn btn-social btn-facebook" 
        onClick={() => handleSocialLogin('Facebook')}
      >
        <i className="fab fa-facebook-f"></i> Continue with Facebook
      </button>
      
    </div>
  );
}
