import { Link } from "react-router-dom";
import Button from "./ui/Button";

function Navbar() {
  // TODO: integrate AuthContext later
  const isAuthenticated = false;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ResumeAI <span className="text-indigo-400">Pro</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-gray-300 font-medium">
          <Link className="hover:text-white transition-colors" to="/">Home</Link>
          <Link className="hover:text-white transition-colors" to="/pricing">Pricing</Link>
          
          {isAuthenticated ? (
            <>
              <Link className="hover:text-white transition-colors" to="/dashboard">Dashboard</Link>
              <Button variant="ghost" className="text-white hover:bg-white/10 border-0">Logout</Button>
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