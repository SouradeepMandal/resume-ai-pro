import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full"></div></div>;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
