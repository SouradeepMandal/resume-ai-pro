import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, requestLoginOTP, verifyOTP } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState("password"); // 'password', 'otp_request', 'otp_verify'
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      addToast("Please enter your email and password", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({
        email: formData.identifier,
        password: formData.password
      });
      login(data.token);
      addToast("Login Successful!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error.response?.data?.message || "Login Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.identifier) {
      addToast("Please enter your email", "error");
      return;
    }
    try {
      setLoading(true);
      await requestLoginOTP(formData.identifier);
      addToast("OTP sent to your email", "success");
      setLoginMethod("otp_verify");
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to send OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      addToast("Please enter a valid 6-digit OTP", "error");
      return;
    }
    try {
      setLoading(true);
      const data = await verifyOTP({ identifier: formData.identifier, otp });
      login(data.token);
      addToast("Login Successful!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error.response?.data?.message || "Verification Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 font-sans text-gray-100 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          
          {/* Header / Logo */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <div className="w-12 h-12 flex items-center justify-center bg-teal-500/10 border border-teal-500/20 rounded-xl shadow-[0_0_15px_rgba(43,181,160,0.3)]">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-teal-400" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Welcome Back</h1>
              <p className="text-sm text-gray-400">Log in to your career intelligence hub</p>
            </div>
          </div>

          {/* Auth Methods */}
          <div className="flex flex-col gap-5">
            
            <AnimatePresence mode="wait">
              {loginMethod === "password" && (
                <motion.form 
                  key="password_form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handlePasswordLogin} 
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
                      <input
                        type="text"
                        name="identifier"
                        placeholder="you@example.com"
                        value={formData.identifier}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-black/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                        autoComplete="username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-black/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-70 flex items-center justify-center mt-2 shadow-[0_0_20px_rgba(43,181,160,0.3)] hover:shadow-[0_0_25px_rgba(43,181,160,0.5)]"
                  >
                    {loading ? "Authenticating..." : "Sign In"}
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod("otp_request")}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      Login with OTP instead
                    </button>
                  </div>
                </motion.form>
              )}

              {loginMethod === "otp_request" && (
                <motion.form 
                  key="otp_request_form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleRequestOTP} 
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Email Address</label>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="you@example.com"
                      value={formData.identifier}
                      onChange={handleChange}
                      className="w-full h-11 px-4 bg-black/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                      autoComplete="username"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-70 flex items-center justify-center mt-2 shadow-[0_0_20px_rgba(43,181,160,0.3)] hover:shadow-[0_0_25px_rgba(43,181,160,0.5)]"
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod("password")}
                      className="text-xs text-gray-500 hover:text-teal-400 font-medium transition-colors"
                    >
                      Back to Password Login
                    </button>
                  </div>
                </motion.form>
              )}

              {loginMethod === "otp_verify" && (
                <motion.form 
                  key="otp_verify_form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP} 
                  className="flex flex-col gap-4"
                >
                  <p className="text-sm text-gray-400 text-center mb-2">
                    We sent a verification code to <br />
                    <strong className="text-teal-400">{formData.identifier}</strong>
                  </p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full h-12 px-4 bg-black/50 border border-gray-800 rounded-xl text-teal-400 font-bold tracking-[0.5em] text-center text-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                  />
                  <div className="text-right mt-1">
                    <button 
                      type="button" 
                      onClick={handleRequestOTP}
                      className="text-xs text-gray-500 hover:text-teal-400 transition-colors"
                    >
                      Resend Code
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-70 flex items-center justify-center mt-2 shadow-[0_0_20px_rgba(43,181,160,0.3)] hover:shadow-[0_0_25px_rgba(43,181,160,0.5)]"
                  >
                    {loading ? "Verifying..." : "Verify & Log In"}
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      type="button" 
                      onClick={() => setLoginMethod("otp_request")}
                      className="text-xs text-gray-500 hover:text-teal-400 font-medium transition-colors"
                    >
                      Change Email
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Create Account
            </Link>
          </p>
        </div>

      </motion.div>
    </section>
  );
}

export default Login;