import { Link } from "react-router-dom";
import Button from "./ui/Button";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // window.location.href = "/login"; // React Router or redirect will handle this via ProtectedRoute if needed, but doing it manually is fine or relying on state.
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-teal-500 rounded-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-black" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
            ResumeAI <span className="text-teal-400">Match</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-gray-400 font-medium text-sm">
          <Link className="hover:text-teal-400 transition-colors" to="/">Home</Link>
          
          {isAuthenticated ? (
            <>
              <Link className="hover:text-teal-400 transition-colors" to="/dashboard">Dashboard</Link>
              <Link className="hover:text-teal-400 transition-colors" to="/ats-checker">ATS Match</Link>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors ml-4 border-l border-white/10 pl-4">Logout</button>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-5">
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:bg-white/10 border-0">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu button could go here */}
      </div>
    </nav>
  );
}

export default Navbar;