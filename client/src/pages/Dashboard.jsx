import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
import { getMyResumes, downloadResume, deleteResume } from "../services/resumeService";
import { getJobs } from "../services/jobService";
import ResumeUpload from "../components/ResumeUpload";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../context/ToastContext";
import { FiDownload, FiTrash2, FiFile, FiClock } from "react-icons/fi";

let dashboardCache = null;

function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState(dashboardCache?.resumes || []);
  const [jobs, setJobs] = useState(dashboardCache?.jobs || []);
  const [resumeLoading, setResumeLoading] = useState(!dashboardCache);
  const [downloadingId, setDownloadingId] = useState(null);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        dashboardCache = null;
        navigate("/login");
        return;
      }

      const profileData = await getProfile(token);
      setUser(profileData.user);
      
      if (!dashboardCache) setResumeLoading(true);
      
      const [resumeData, jobData] = await Promise.all([
        getMyResumes(),
        getJobs()
      ]);
      
      dashboardCache = { resumes: resumeData.resumes || [], jobs: jobData || [] };
      setResumes(dashboardCache.resumes);
      setJobs(dashboardCache.jobs);
    } catch (error) {
      console.error("Dashboard error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      addToast("Failed to fetch dashboard data.", "error");
    } finally {
      setResumeLoading(false);
    }
  }, [navigate, addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  // Job Tracker Stats
  const activeJobs = jobs.filter(j => ["Bookmarked", "Applied", "Interview"].includes(j.status)).length;
  const interviews = jobs.filter(j => j.status === "Interview").length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-teal-900/40 to-black border border-white/10 rounded-2xl p-8 shadow-2xl gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
            {user && <p className="text-gray-300 mt-2 text-lg font-light">Welcome back, <span className="text-teal-400 font-bold">{user.name}</span>. Ready to land your dream job?</p>}
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="bg-black/50 border border-teal-500/30 px-6 py-3 rounded-xl text-center shadow-[0_0_15px_rgba(43,181,160,0.15)]">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Uploaded Resumes</p>
              <p className="text-2xl font-bold text-teal-400">{resumes.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Resumes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upload Section */}
            {(resumes.length === 0 || isUploading) && (
              <ResumeUpload onUploadSuccess={() => { setIsUploading(false); fetchDashboardData(); }} />
            )}

            {/* Resumes Section */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Master Resume</h2>
                <div className="flex gap-3">
                  {resumes.length > 0 && !isUploading && (
                    <Button variant="secondary" size="sm" onClick={() => setIsUploading(true)} className="bg-white/5 hover:bg-white/10">
                      Upload New
                    </Button>
                  )}
                  {resumes.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => navigate("/ats-checker")} className="text-teal-400 hover:text-teal-300">
                      Analyze ATS Match →
                    </Button>
                  )}
                </div>
              </div>
              
              {resumeLoading ? (
                <div className="animate-pulse flex space-x-4 bg-black/50 p-6 rounded-xl border border-gray-800">
                  <div className="rounded-full bg-gray-800 h-10 w-10"></div>
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : resumes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl bg-black/30">
                  <FiFile className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-4 text-sm font-semibold text-white">No active resume</h3>
                  <p className="mt-1 text-sm text-gray-500">Upload a resume to unlock AI features.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumes.slice(0,1).map((resume) => (
                    <div 
                      key={resume._id} 
                      className="bg-black/50 border border-teal-500/30 rounded-xl p-5 relative overflow-hidden cursor-pointer hover:border-teal-500 transition-colors"
                      onClick={() => window.open(`http://localhost:5000/${resume.filePath.replace(/\\/g, '/')}`, '_blank')}
                    >
                      <div className="absolute top-0 right-0 bg-teal-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                        ACTIVE
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-teal-500/10 text-teal-400 rounded-xl">
                           <FiFile className="w-8 h-8" />
                        </div>
                        <div className="flex-1 min-w-0 pr-16">
                          <span 
                            className="text-white font-bold text-lg truncate hover:text-teal-400 transition-colors block"
                          >
                            {resume.originalName}
                          </span>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                            <span className="uppercase font-semibold tracking-wider text-teal-500/70">{resume.fileType}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><FiClock /> {new Date(resume.createdAt).toLocaleDateString()}</span>
                          </div>
                          {resume.atsScore && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                              <span className="text-xs text-gray-400">Latest ATS Score:</span>
                              <span className={`text-sm font-bold ${resume.atsScore > 80 ? 'text-green-400' : 'text-yellow-400'}`}>{resume.atsScore}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
                        <Button 
                          variant="secondary" 
                          className="flex-1 gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white"
                          onClick={(e) => { e.stopPropagation(); handleDownload(resume); }}
                          isLoading={downloadingId === resume._id}
                        >
                          <FiDownload /> Download Original
                        </Button>
                        <Button 
                          variant="danger" 
                          className="flex-1 gap-2 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                          onClick={(e) => { e.stopPropagation(); setResumeToDelete(resume); }}
                        >
                          <FiTrash2 /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {resumes.length > 1 && (
                    <div className="text-center pt-4 border-t border-gray-800">
                      <p className="text-sm text-gray-500">Only your most recent resume is actively shown.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column: Quick Links & Tips */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-900/40 to-black border border-teal-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-lg font-bold text-white mb-4 relative z-10">How it Works</h3>
              <ul className="space-y-5 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 text-sm font-bold border border-teal-500/30">1</div>
                  <p className="text-sm text-gray-300 mt-1"><strong>Upload</strong> your master resume in PDF format.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 text-sm font-bold border border-teal-500/30">2</div>
                  <p className="text-sm text-gray-300 mt-1"><strong>Analyze</strong> it against your target job description.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 text-sm font-bold border border-teal-500/30">3</div>
                  <p className="text-sm text-gray-300 mt-1"><strong>Rebuild</strong> instantly with Gemini AI to max out your ATS score.</p>
                </li>
              </ul>
              {resumes.length > 0 && (
                <Button onClick={() => navigate("/ats-checker")} className="w-full mt-8 bg-teal-500 hover:bg-teal-400 text-black font-bold border-0 shadow-[0_0_15px_rgba(43,181,160,0.3)] relative z-10">
                  Analyze ATS Match
                </Button>
              )}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">ATS Pro Tips</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2"><span className="text-teal-400">✅</span> Avoid complex tables or multi-column layouts.</li>
                <li className="flex gap-2"><span className="text-teal-400">✅</span> Keep dates strictly formatted consistently.</li>
                <li className="flex gap-2"><span className="text-teal-400">✅</span> Weave missing skills organically into your experience.</li>
              </ul>
            </div>
          </div>

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