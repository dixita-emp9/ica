import { useState } from "react";
import { sendOtp, verifyOtp } from "./services/apiService";

const LoginWithOtp = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      await sendOtp(phoneNumber);
      setStep(2);
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
      localStorage.setItem("authToken", response.data.token);
      window.location.href = "/dashboard"; // Redirect after login
    } catch (err) {
      setError("Invalid OTP. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login with OTP</h2>
        {step === 1 ? (
          <>

            <input
              type="tel"
              pattern="[0-9]{10}"
              placeholder="Enter Phone Number"
              className="w-full p-2 border rounded mb-4"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button
              className="w-full p-2 bg-blue-600 text-white rounded"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-2 border rounded mb-4"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="w-full p-2 bg-green-600 text-white rounded"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default LoginWithOtp;
