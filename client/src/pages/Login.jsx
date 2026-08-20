import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { FiGithub } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const navigate = useNavigate();
  const { addToast } = useToast();

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
      localStorage.setItem("token", data.token);
      addToast("Login Successful!", "success");
      navigate("/dashboard");
    } catch (error) {
      addToast(error.response?.data?.message || "Login Failed", "error");
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
          <h1 className="text-2xl font-semibold tracking-tight">Log in to ResumeAI Pro</h1>
        </div>

        {/* Auth Methods */}
        <div className="flex flex-col gap-4">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-3">
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
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-white hover:bg-gray-200 text-black font-medium text-sm rounded-md transition-colors disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? "Please wait..." : "Continue with Email"}
            </button>
          </form>

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
        </div>

        <div className="text-center mt-2">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
              Sign Up
            </Link>
          </p>
        </div>

      </div>
    </section>
  );
}

export default Login;