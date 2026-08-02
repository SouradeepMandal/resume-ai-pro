import { motion } from "framer-motion";

function Login() {
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

          <form className="space-y-5">

            <input
              type="email"
              placeholder="Email"
              className="w-full p-4 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-cyan-400 transition"
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 rounded-lg bg-slate-700 text-white border border-slate-600 outline-none focus:border-cyan-400 transition"
            />

            <button
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-4 rounded-lg transition"
            >
              Login
            </button>

          </form>

          <p className="text-gray-400 text-center mt-6">
            Don't have an account?{" "}
            <span className="text-cyan-400 cursor-pointer hover:underline">
              Register
            </span>
          </p>

        </div>
      </motion.div>

    </section>
  );
}

export default Login;