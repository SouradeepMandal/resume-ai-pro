import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getMyResumes, downloadResume, deleteResume } from "../services/resumeService";
import ResumeUpload from "../components/ResumeUpload";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../context/ToastContext";
import { FiDownload, FiTrash2, FiFile, FiClock } from "react-icons/fi";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchResumes = useCallback(async () => {
    try {
      setResumeLoading(true);
      const resumeData = await getMyResumes();
      setResumes(resumeData.resumes || []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      addToast("Failed to fetch resumes.", "error");
    } finally {
      setResumeLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const profileData = await getProfile(token);
        setUser(profileData.user);
        
        await fetchResumes();
      } catch (error) {
        console.error("Dashboard error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchDashboardData();
  }, [navigate, fetchResumes]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDownload = async (resume) => {
    try {
      setDownloadingId(resume._id);
      const blob = await downloadResume(resume._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resume.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      addToast("Failed to download resume.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!resumeToDelete) return;
    try {
      setDeleting(true);
      await deleteResume(resumeToDelete._id);
      setResumes((current) => current.filter((item) => item._id !== resumeToDelete._id));
      addToast("Resume deleted successfully.", "success");
    } catch (error) {
      console.error("Delete error:", error);
      addToast("Failed to delete resume.", "error");
    } finally {
      setDeleting(false);
      setResumeToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            {user && <p className="text-gray-400 mt-1">Welcome back, {user.name}</p>}
          </div>
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </div>

        {/* Upload Section */}
        <ResumeUpload onUploadSuccess={fetchResumes} />

        {/* Resumes Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Your Resumes</h2>
          
          {resumeLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4 bg-gray-700/50 p-6 rounded-xl">
                  <div className="rounded-full bg-gray-600 h-10 w-10"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-xl">
              <FiFile className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-sm font-semibold text-white">No resumes</h3>
              <p className="mt-1 text-sm text-gray-400">Get started by uploading a resume above.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resumes.map((resume) => (
                <div key={resume._id} className="bg-gray-700/30 border border-gray-600 rounded-xl p-5 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <FiFile className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{resume.originalName}</h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span className="uppercase font-semibold tracking-wider">{resume.fileType}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FiClock /> {new Date(resume.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-5">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleDownload(resume)}
                      isLoading={downloadingId === resume._id}
                    >
                      <FiDownload /> {downloadingId === resume._id ? "..." : "Download"}
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => setResumeToDelete(resume)}
                    >
                      <FiTrash2 /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!resumeToDelete}
        title="Delete Resume"
        message={`Are you sure you want to delete "${resumeToDelete?.originalName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setResumeToDelete(null)}
        isLoading={deleting}
      />
    </div>
  );
}

export default Dashboard;