import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
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
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
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
            </form>

            <div className="flex items-center my-1">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="px-3 text-xs text-gray-500">OR</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                onClick={() => addToast("Google login coming soon", "info")}
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>
            </div>
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