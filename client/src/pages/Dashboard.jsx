import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import ResumeUpload from "../components/ResumeUpload";

function Dashboard() {
  console.log("Updated Dashboard Loaded");

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const data = await getProfile(token);

        setUser(data.user);
      } catch (error) {
        console.error(error);

        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>

      {/* Profile Card */}
      {user ? (
        <>
          <div className="bg-slate-800/70 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6">
              Welcome, {user.name}
            </h2>

            <div className="space-y-4">
              <p>
                <span className="text-cyan-400 font-semibold">
                  Email:
                </span>{" "}
                {user.email}
              </p>

              <p>
                <span className="text-cyan-400 font-semibold">
                  User ID:
                </span>{" "}
                {user._id}
              </p>

              <p>
                <span className="text-cyan-400 font-semibold">
                  Joined:
                </span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Resume Upload */}
          <ResumeUpload />
        </>
      ) : (
        <div className="text-center text-lg text-gray-400">
          Loading profile...
        </div>
      )}
    </div>
  );
}

export default Dashboard;