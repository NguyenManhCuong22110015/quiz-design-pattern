import { useState } from "react";
import "../styles/Login.css";
const ResetPassword = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const showAlert = (message, type) => {
    setAlertMessage({ message, type });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleGetCode = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showAlert("Please enter a valid email address.", "danger");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/send-email-getCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.message === "Email xác nhận đã được gửi.") {
        showAlert("OTP has been sent to your email.", "success");
        setStep("otp");
      } else {
        showAlert("Failed to send OTP.", "danger");
      }
    } catch {
      showAlert("An error occurred while sending the OTP.", "danger");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      showAlert("Please enter a 6-digit code.", "danger");
      return;
    }
    try {
      const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await response.json();
      if (data.message === "OTP xác nhận thành công.") {
        showAlert("OTP verified successfully.", "success");
        setStep("newPassword");
      } else {
        showAlert("Invalid verification code.", "danger");
      }
    } catch {
      showAlert("An error occurred while verifying the OTP.", "danger");
    }
  };

  const handleSavePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      showAlert("Passwords do not match or are empty.", "danger");
      return;
    }
    try {
      const response = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Password successfully reset!", "success");
      } else {
        showAlert(`Error resetting password: ${data.message}`, "danger");
      }
    } catch {
      showAlert("An error occurred. Please try again.", "danger");
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="form-reset-password">
        <div className="content">
        <div className="d-flex justify-content-center align-item-center">
              <img src="/imgs/logo.jpg"  ></img>
            </div>
      <h4 className="text-center"><b>Reset your password</b></h4>
      <p>
        Can’t remember your password? Enter your email address and we will send you an email to create a new password.
        <a className="redr" href="/login">Sign In</a>
      </p>
      {alertMessage && (
        <div className={`alert alert-${alertMessage.type}`} role="alert">
          {alertMessage.message}
        </div>
      )}
      {step === "email" && (
        <div className="w-100">
          <input type="email" className="form-control " value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button onClick={handleGetCode} className="btn btn-primary mt-3 w-100" disabled={loading}>
            {loading ? "Sending..." : "Get CODE"}
          </button>
        </div>
      )}
      {step === "otp" && (
        <div>
          <p>Enter the code sent to your email:</p>
          <div className="code-inputs d-flex justify-content-center">
            {otp.map((val, index) => (
              <input key={index} type="text" maxLength="1" className="code-input form-control mx-1"
                value={val} onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[index] = e.target.value;
                  setOtp(newOtp);
                }}
              />
            ))}
          </div>
          <button onClick={handleVerifyOTP} className="btn btn-success mt-3">Verify CODE</button>
        </div>
      )}
      {step === "newPassword" && (
        <div>
          <p>Enter your new password:</p>
          <input type="password" className="form-control mb-3" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <input type="password" className="form-control mb-3" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <button onClick={handleSavePassword} className="btn btn-primary mt-3">Save Password</button>
        </div>
      )}
      </div>
    </div>
    </div>
  );
};

export default ResetPassword;
