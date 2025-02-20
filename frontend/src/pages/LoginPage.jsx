import { useState } from "react";
import "../styles/Login.css";
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const showFormLogIn = () => setIsLogin(true);
  const showFormSignUp = () => setIsLogin(false);

  return (
    <div className="auth-page-wrapper">
      {isLogin ? <LoginForm showFormSignUp={showFormSignUp} /> : <SignUpForm showFormLogIn={showFormLogIn} />}
    </div>
  );
}

function LoginForm({ showFormSignUp }) {
  return (
    <div className="form-login">
      <form method="post">
        <div className="content">
          <div className="data">
            <h4 className="text-center">Logo</h4>
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
            <a className="redr" href="/reset-password">Forgot password?</a><br/>
            <button type="submit" className="submit mt-3 mb-5">Sign in</button>
            <SocialButtons />
          </div>
        </div>
      </form>
    </div>
  );
}

function SignUpForm({ showFormLogIn }) {
  return (
    <div className="form-signup">
      <form method="post">
        <div className="content">
          <div className="data">
            <h4 className="text-center">Logo</h4>
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
            <button type="submit" className="submit mb-5">Create Account</button>
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
