import { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const profileData = await getProfile(token);
          setUser(profileData.user);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          // If token is invalid, log out
          if (error.response?.status === 401) {
            logout();
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
