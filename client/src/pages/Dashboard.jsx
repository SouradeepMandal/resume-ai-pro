import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProfile } from "../services/authService";

import {
  getMyResumes,
  downloadResume,
  deleteResume,
} from "../services/resumeService";

import ResumeUpload from "../components/ResumeUpload";

function Dashboard() {
  console.log("Updated Dashboard Loaded");

  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);

  const [resumeLoading, setResumeLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // ==========================================
  // Fetch Dashboard Data
  // ==========================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Fetch user profile
        const profileData = await getProfile(token);

        setUser(profileData.user);

        // Fetch user's resumes
        const resumeData = await getMyResumes();

        setResumes(resumeData.resumes || []);
      } catch (error) {
        console.error("Dashboard error:", error);

        localStorage.removeItem("token");

        navigate("/login");
      } finally {
        setResumeLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);


  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };


  // ==========================================
  // Download Resume
  // ==========================================

  const handleDownload = async (resume) => {
    try {
      setDownloadingId(resume._id);

      const blob = await downloadResume(resume._id);

      // Create temporary browser URL
      const url = window.URL.createObjectURL(blob);

      // Create temporary download link
      const link = document.createElement("a");

      link.href = url;

      link.download = resume.originalName;

      document.body.appendChild(link);

      link.click();

      // Cleanup
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);

      alert("Failed to download resume.");
    } finally {
      setDownloadingId(null);
    }
  };


  // ==========================================
  // Delete Resume
  // ==========================================

  const handleDelete = async (resume) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resume.originalName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resume._id);

      await deleteResume(resume._id);

      // Remove deleted resume from UI
      setResumes((currentResumes) =>
        currentResumes.filter(
          (item) => item._id !== resume._id
        )
      );
    } catch (error) {
      console.error("Delete error:", error);

      alert("Failed to delete resume.");
    } finally {
      setDeletingId(null);
    }
  };


  // ==========================================
  // Dashboard UI
  // ==========================================

  return (
    <div>

      {/* ===================================== */}
      {/* Header */}
      {/* ===================================== */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Dashboard
        </h1>

        <button
          type="button"
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>

      </div>


      {/* ===================================== */}
      {/* Profile + Dashboard Content */}
      {/* ===================================== */}

      {user ? (
        <>

          {/* Profile Card */}

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
                {new Date(
                  user.createdAt
                ).toLocaleDateString()}
              </p>

            </div>

          </div>


          {/* ===================================== */}
          {/* Resume Upload */}
          {/* ===================================== */}

          <ResumeUpload />


          {/* ===================================== */}
          {/* Resume History */}
          {/* ===================================== */}

          <div className="mt-8">

            <h2 className="text-2xl font-bold mb-4">
              Your Resumes
            </h2>


            {/* Loading */}

            {resumeLoading ? (

              <p className="text-gray-400">
                Loading resumes...
              </p>


            ) : resumes.length === 0 ? (

              /* Empty State */

              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-6 text-gray-400">
                You haven't uploaded any resumes yet.
              </div>


            ) : (

              /* Resume Cards */

              <div className="space-y-4">

                {resumes.map((resume) => (

                  <div
                    key={resume._id}
                    className="bg-slate-800/70 border border-slate-700 rounded-xl p-5"
                  >

                    <div className="flex justify-between items-center gap-4">

                      {/* Resume Information */}

                      <div className="min-w-0">

                        <h3 className="font-semibold text-lg break-words">
                          📄 {resume.originalName}
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                          {resume.fileType}
                        </p>

                        <p className="text-sm text-gray-400">
                          Uploaded:{" "}
                          {new Date(
                            resume.createdAt
                          ).toLocaleDateString()}
                        </p>

                      </div>


                      {/* Action Buttons */}

                      <div className="flex gap-3 flex-shrink-0">

                        {/* Download */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(resume)
                          }
                          disabled={
                            downloadingId === resume._id ||
                            deletingId === resume._id
                          }
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap"
                        >
                          {downloadingId === resume._id
                            ? "Downloading..."
                            : "Download"}
                        </button>


                        {/* Delete */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(resume)
                          }
                          disabled={
                            deletingId === resume._id ||
                            downloadingId === resume._id
                          }
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 px-5 py-2 rounded-lg font-semibold transition whitespace-nowrap"
                        >
                          {deletingId === resume._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </>

      ) : (

        /* Profile Loading */

        <div className="text-center text-lg text-gray-400">
          Loading profile...
        </div>

      )}

    </div>
  );
}

export default Dashboard;