import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";


function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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
    
    if (!formData.name || !formData.identifier || !formData.password) {
      addToast("Please fill in all fields", "error");
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
      
      addToast(data.message || "Registration Successful!", "success");
      navigate("/login");
    } catch (error) {
      addToast(error.response?.data?.message || "Registration Failed", "error");
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
              <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Account</h1>
              <p className="text-sm text-gray-400">Join the AI career intelligence platform</p>
            </div>
          </div>

          {/* Auth Methods */}
          <div className="flex flex-col gap-5">
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-black/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-inner"
                        autoComplete="name"
                      />
                    </div>

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
                        autoComplete="new-password"
                      />
                    </div>
                  </motion.div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-sm rounded-xl transition-all disabled:opacity-70 flex items-center justify-center mt-2 shadow-[0_0_20px_rgba(43,181,160,0.3)] hover:shadow-[0_0_25px_rgba(43,181,160,0.5)]"
              >
                {loading ? "Please wait..." : "Sign Up"}
              </button>
            </form>


          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
              Log In
            </Link>
          </p>
        </div>

      </motion.div>
    </section>
  );
}

export default Register;