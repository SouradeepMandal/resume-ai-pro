import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, verifyOTP } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { motion, AnimatePresence } from "framer-motion";

function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  
  // Verification state
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.identifier || !formData.password) {
      addToast("Please fill in all fields", "error");
      return;
    }

    if (needsVerification) {
      if (otp.length !== 6) {
        addToast("Please enter a valid 6-digit OTP", "error");
        return;
      }
      
      try {
        setLoading(true);
        const data = await verifyOTP({ identifier: formData.identifier, otp });
        addToast(data.message || "Account verified successfully!", "success");
        navigate("/login");
      } catch (error) {
        addToast(error.response?.data?.message || "Verification Failed", "error");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      
      const registerPayload = {
        name: formData.name,
        email: formData.identifier,
        password: formData.password
      };

      const data = await registerUser(registerPayload);
      
      if (data.needsVerification) {
        setNeedsVerification(true);
        addToast(data.message, "success");
      } else {
        addToast(data.message || "Registration Successful!", "success");
        navigate("/login");
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Registration Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-black flex flex-col items-center justify-center px-4 font-sans text-gray-100">
      
      <div className="w-full max-w-[320px] flex flex-col gap-6">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full">
            {/* Vercel-like triangle or app logo */}
            <svg viewBox="0 0 75 65" height="18" fill="black">
              <path d="M37.59.25l36.95 64H.64l36.95-64z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        </div>

        {/* Auth Methods */}
        <div className="flex flex-col gap-4">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <AnimatePresence mode="wait">
              {needsVerification ? (
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-sm text-gray-400 text-center mb-2">
                    We sent a verification code to <br />
                    <strong className="text-white">{formData.identifier}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full h-12 px-3 bg-black border border-gray-800 rounded-md text-white text-center tracking-[0.5em] text-lg focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                  />
                  <div className="text-right">
                    <button type="button" className="text-xs text-gray-400 hover:text-white transition-colors">Resend Code</button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-3"
                >
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-black border border-gray-800 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                    autoComplete="name"
                  />

                  <input
                    type="text"
                    name="identifier"
                    placeholder="Email Address"
                    value={formData.identifier}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-black border border-gray-800 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                    autoComplete="username"
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-black border border-gray-800 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
                    autoComplete="new-password"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-white hover:bg-gray-200 text-black font-medium text-sm rounded-md transition-colors disabled:opacity-70 flex items-center justify-center mt-2"
            >
              {loading ? "Please wait..." : (needsVerification ? "Verify Account" : "Continue with Email")}
            </button>
          </form>

          {!needsVerification && (
            <>
              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-gray-800"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full h-10 bg-black hover:bg-gray-900 border border-gray-800 text-white font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                  onClick={() => addToast("Google login coming soon", "info")}
                >
                  <FcGoogle className="w-5 h-5" />
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="w-full h-10 bg-black hover:bg-gray-900 border border-gray-800 text-white font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                  onClick={() => addToast("GitHub login coming soon", "info")}
                >
                  <FiGithub className="w-5 h-5" />
                  Continue with GitHub
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              Log In
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}

export default Register;