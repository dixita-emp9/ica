import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp } from "./services/apiService";
import "./Auth.css"; // Using the same styles as normal login

const LoginWithOtp = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await sendOtp(phoneNumber);
      setOtpSent(true);
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await verifyOtp(phoneNumber, otp);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem('showWelcomePopup', 'true');
      // alert("OTP verified successfully!");
      navigate("/portfolios"); // Redirect after login
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <div className="logo-box mb-4">
        <img src="/ICA_logo_Red.png" alt="ICA Logo" className="logo" />
      </div>

      <div className="form-content">
        <div className="form-group mt-4">
          <input
            type="tel"
            pattern="[0-9]{10}"
            className="form-control p-3"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter Phone Number"
            disabled={otpSent} // Disable phone input after sending OTP
          />
        </div>

        {otpSent && (
          <div className="form-group mt-4">
            <input
              type="text"
              className="form-control p-3"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
          </div>
        )}

        {!otpSent ? (
          <button className="submit_btn btn bg_danger p-3 mt-4" onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button className="submit_btn btn bg_danger p-3 mt-4" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        )}

        {error && <p className="text-red-600 mt-2 text-center">{error}</p>}

        <div className="login-link mt-4">
          <p>
            Go back to <a href="/login">Email Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginWithOtp;
