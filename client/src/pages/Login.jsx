import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
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

    try {
      setLoading(true);

      const data = await loginUser(formData);

      localStorage.setItem("token", data.token);

      alert("Login Successful!");

      navigate("/dashboard");

    } catch (error) {
      alert(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center px-6 py-20">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >

        <div className="bg-slate-800/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl p-8">

          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>

          <p className="text-gray-400 mb-8">
            Login to continue your resume journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-cyan-400 transition"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-cyan-400 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Logging In..." : "Login"}
            </button>

          </form>

          <p className="text-gray-400 text-center mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:underline"
            >
              Register
            </Link>
          </p>

        </div>

      </motion.div>

    </section>
  );
}

export default Login;