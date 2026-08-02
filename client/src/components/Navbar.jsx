import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-slate-900/60 border-b border-white/10">

      <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">

        <h1 className="text-3xl font-bold text-white">
          ResumeAI <span className="text-blue-400">Pro</span>
        </h1>

        <div className="flex items-center gap-8 text-white">

          <Link
            className="hover:text-blue-400 transition"
            to="/"
          >
            Home
          </Link>

          <Link
            className="hover:text-blue-400 transition"
            to="/login"
          >
            Login
          </Link>

          <Link
            className="hover:text-blue-400 transition"
            to="/register"
          >
            Register
          </Link>

          <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg transition">
            Get Started
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;