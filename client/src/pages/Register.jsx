import { useState } from "react";
import { motion } from "framer-motion";
import { registerUser } from "../services/authService";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
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

      const data = await registerUser(formData);

      alert(data.message || "Registration Successful!");

      console.log(data);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

    } catch (error) {
      alert(
        error.response?.data?.message || "Registration Failed"
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
            Create Account
          </h2>

          <p className="text-gray-400 mb-8">
            Start building ATS-friendly resumes today.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-cyan-400 transition"
            />

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
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-gray-400 text-center mt-6">
            Already have an account?{" "}
            <span className="text-cyan-400 cursor-pointer hover:underline">
              Login
            </span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default Register;