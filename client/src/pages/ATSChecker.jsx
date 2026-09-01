import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { scoreATS } from "../services/aiService";
import { getMyResumes } from "../services/resumeService";
import { useToast } from "../context/ToastContext";
import { FiUploadCloud, FiCheckCircle, FiAlertCircle, FiFileText } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function ATSChecker() {
  const [jobDescription, setJobDescription] = useState(() => localStorage.getItem("ats_jobDescription") || "");
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState(() => localStorage.getItem("ats_resumeId") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => {
    const saved = localStorage.getItem("ats_result");
    return saved ? JSON.parse(saved) : null;
  });
  
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("ats_jobDescription", jobDescription);
  }, [jobDescription]);

  useEffect(() => {
    localStorage.setItem("ats_resumeId", resumeId);
  }, [resumeId]);

  useEffect(() => {
    if (result) {
      localStorage.setItem("ats_result", JSON.stringify(result));
    } else {
      localStorage.removeItem("ats_result");
    }
  }, [result]);

  const fetchResumes = useCallback(async () => {
    try {
      const data = await getMyResumes();
      if (data.resumes && data.resumes.length > 0) {
        setResumes(data.resumes);
        const cachedId = localStorage.getItem("ats_resumeId");
        const isValidCachedId = data.resumes.some(r => r._id === cachedId);
        
        if (!cachedId || !isValidCachedId) {
          setResumeId(data.resumes[0]._id); // Select first by default if not cached or invalid
        }
      } else {
        setResumes([]);
        setResumeId("");
      }
    } catch (error) {
      console.error("Failed to fetch resumes", error);
      addToast("Failed to fetch your resumes", "error");
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchResumes();
  }, [fetchResumes]);

  const handleScore = async () => {
    if (!jobDescription) {
      addToast("Please enter a job description", "error");
      return;
    }
    if (!resumeId) {
      addToast("Please select a resume to analyze", "error");
      return;
    }
    
    setLoading(true);
    try {
      const data = await scoreATS(resumeId, jobDescription);
      setResult(data);
    } catch (error) {
      console.error("Scoring error:", error);
      const errorMsg = error.response?.data?.message || "Error scoring resume. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 p-8 font-sans pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="glass rounded-2xl p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ATS Match Checker</h1>
            <p className="text-gray-400 mt-2">Paste a job description below to see how well your resume matches.</p>
          </div>
          {result && (
            <button 
              onClick={() => navigate('/rebuild-resume', { state: { result, resumeId, jobDescription } })}
              className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(43,181,160,0.3)]"
            >
              Rebuild Resume ✨
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="glass rounded-2xl p-6">
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Select Resume</label>
              {resumes.length === 0 ? (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
                  <FiAlertCircle /> No resumes found. Please upload one in the Dashboard.
                </div>
              ) : (
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400" />
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 appearance-none cursor-pointer transition-all"
                  >
                    {resumes.map(r => (
                      <option key={r._id} value={r._id}>{r.originalName} ({new Date(r.createdAt).toLocaleDateString()})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
            <textarea
              className="w-full h-48 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
            
            <button
              onClick={handleScore}
              disabled={loading || resumes.length === 0}
              className="w-full mt-4 h-12 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(43,181,160,0.3)] hover:shadow-[0_0_25px_rgba(43,181,160,0.5)]"
            >
              {loading ? (
                <>Scoring with AI...</>
              ) : (
                <>
                  <FiUploadCloud className="w-5 h-5" />
                  Analyze Match
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          <div className="glass rounded-2xl p-6 relative overflow-hidden min-h-[400px]">
            {!result && !loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                <FiCheckCircle className="w-12 h-12 mb-3 opacity-20" />
                <p>Run analysis to see your ATS score</p>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-teal-400 font-medium animate-pulse">Analyzing alignment with Gemini AI...</p>
              </div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Score Circle */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-black border-4 border-teal-500 shadow-[0_0_20px_rgba(43,181,160,0.4)]">
                    <span className="text-3xl font-bold text-teal-400">{result.atsScore}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-white">Match Score</h2>
                    <p className="text-sm text-gray-400 mt-1">{result.matchAnalysis}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-xl border border-green-500/20">
                    <h3 className="text-green-400 font-medium flex items-center gap-2 mb-2 text-sm">
                      <FiCheckCircle /> Matching Skills
                    </h3>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {result.matchingSkills?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  
                  <div className="bg-black/40 p-4 rounded-xl border border-red-500/20">
                    <h3 className="text-red-400 font-medium flex items-center gap-2 mb-2 text-sm">
                      <FiAlertCircle /> Missing Skills
                    </h3>
                    <ul className="text-xs text-gray-300 space-y-1">
                      {result.missingSkills?.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="bg-teal-500/10 p-4 rounded-xl border border-teal-500/20">
                  <h3 className="text-teal-400 font-medium mb-2 text-sm">AI Recommendations</h3>
                  <ul className="text-xs text-gray-300 space-y-2">
                    {result.recommendations?.map((r, i) => <li key={i}>→ {r}</li>)}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default ATSChecker;
