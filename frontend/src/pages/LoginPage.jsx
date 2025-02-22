import { useState } from "react";
import "../styles/Login.css";
import { login, signup } from "../api/LoginAPi";
import {showAlert,showSuccess,showError} from "../components/common/Notification";
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

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
      console.log(user);
      if (user.token) {
        localStorage.setItem("token", user.token); 
        localStorage.setItem("username", user.user.name); 
        localStorage.setItem("userId", user.user.id); 
      }
      window.location.href = '/';
      showSuccess("Login success");
      
    } 
    catch (error) {
     
      showError("Login failed");
      setError("Login failed");
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
      const user = await signup(data);
      console.log(user);
      showSuccess("Created account success");
      
    } catch (error) {
      showError("Created account failed");
      
  };
}

  return (
    <div className="auth-page-wrapper w-100">
      {isLogin ? <LoginForm showFormSignUp={showFormSignUp}
       handleSubmitLogin={handleSubmitLogin}
       error={error}
      
      
      /> : <SignUpForm showFormLogIn={showFormLogIn}
      handleSubmitSignup={handleSubmitSignup}
      error={error}
      
      />}
    </div>
  );
}

function LoginForm({ showFormSignUp,handleSubmitLogin, error }) {
  return (
    <div className="form-login mb-5">
      
      <form method="post" onSubmit={handleSubmitLogin}>
        <div className="content">
          <div className="data">
            
            <div className="d-flex justify-content-center align-item-center">
             <a href="/"><img src="/imgs/logo.jpg"  ></img></a>
            </div>
            <h4 className="text-center"><b>Sign in to your CNN account</b></h4>
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
            <button type="submit" className="submit mt-3 mb-5" >Sign in</button>
            <SocialButtons />
          </div>
        </div>
      </form>
    </div>
  );
}

function SignUpForm({ showFormLogIn ,handleSubmitSignup, error}) {
  return (
    <div className="form-signup mb-5">
      <form method="post" onSubmit={handleSubmitSignup}>
        <div className="content">
          <div className="data">
          <div className="d-flex justify-content-center align-item-center">
             <a href="/"><img src="/imgs/logo.jpg"  ></img></a>
            </div>
            <h4 className="text-center"><b>Sign up for your CNN account</b></h4>
            <h5 className="text-center">Already have an account? <span className="redr" onClick={showFormLogIn}>Sign in</span></h5>
            <div className="mt-4">
                <label alt="Email address">Email address</label>
              <input type="text" name="reg_email" required />
              <label alt="Email address"></label>
            </div>
            <div className="password-container">
            <label alt="Enter password">Password</label>
              <input type="password" id="password2" name="reg_password" required />
              <label alt="Enter password"></label>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <button type="submit" className="submit mb-5" >Create Account</button>
            <SocialButtons />
          </div>
        </div>
      </form>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="login-buttons">
      <button type="button" className="btn btn-social btn-google" onClick={() => window.location.href='/auth/google'}>
        <i className="fab fa-google"></i> Continue with Google
      </button>
      <button type="button" className="btn btn-social btn-facebook" onClick={() => window.location.href='/auth/facebook'}>
        <i className="fab fa-facebook-f"></i> Continue with Facebook
      </button>
      <button type="button" className="btn btn-social btn-apple" onClick={() => window.location.href='/auth/github'}>
        <i className="fab fa-github"></i> Continue with Github
      </button>
    </div>
  );
}
