import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getJobs, createJob, updateJob } from "../services/jobService";
import { useToast } from "../context/ToastContext";
import { FiPlus, FiBriefcase, FiMoreVertical, FiInbox } from "react-icons/fi";

const COLUMNS = ["Bookmarked", "Applied", "Interview", "Offer", "Rejected"];

function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (error) {
      console.error(error);
      addToast("Error fetching jobs", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
  }, [fetchJobs]);

  const handleAddJob = async () => {
    const title = prompt("Enter Job Title (e.g. Frontend Developer):");
    if (!title) return;
    const company = prompt("Enter Company Name:");
    if (!company) return;

    try {
      const newJob = await createJob({
        jobTitle: title,
        companyName: company,
        status: "Bookmarked"
      });
      setJobs([newJob, ...jobs]);
      addToast("Job added successfully", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to add job", "error");
    }
  };

  const moveJob = async (jobId, newStatus) => {
    try {
      // Optimistic update
      setJobs(jobs.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      await updateJob(jobId, { status: newStatus });
    } catch (error) {
      console.error(error);
      addToast("Failed to move job", "error");
      fetchJobs(); // Revert on failure
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Job Tracker</h1>
            <p className="text-gray-400 mt-1">Manage your job search funnel</p>
          </div>
          <button
            onClick={handleAddJob}
            className="h-10 px-6 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(43,181,160,0.3)] hover:shadow-[0_0_20px_rgba(43,181,160,0.5)]"
          >
            <FiPlus /> Add New Job
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center shadow-2xl max-w-2xl mx-auto mt-12">
            <div className="bg-teal-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiInbox className="w-10 h-10 text-teal-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Job Tracker is Empty</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Keep track of all your applications, interviews, and offers in one organized Kanban board.
            </p>
            <button
              onClick={handleAddJob}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-xl transition-all"
            >
              Add Your First Job
            </button>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
            {COLUMNS.map((col) => (
              <div key={col} className="flex-1 min-w-[300px] snap-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h2 className="font-semibold text-gray-200">{col}</h2>
                  <span className="text-xs font-bold bg-teal-500/20 text-teal-400 px-2.5 py-1 rounded-full">
                    {jobs.filter(j => j.status === col).length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-4 min-h-[500px]">
                  <AnimatePresence>
                    {jobs.filter(j => j.status === col).map((job) => (
                      <motion.div
                        key={job._id}
                        layoutId={job._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-black/50 border border-gray-800 p-5 rounded-xl shadow-lg group hover:border-teal-500/50 transition-colors relative"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-gray-400 mt-1">
                            <FiBriefcase />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-base truncate">{job.jobTitle}</h3>
                            <p className="text-teal-400 text-sm mt-0.5 font-medium truncate">{job.companyName}</p>
                          </div>
                          
                          {/* Status Dropdown */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative inline-block text-left">
                              <select
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                value={col}
                                onChange={(e) => moveJob(job._id, e.target.value)}
                              >
                                {COLUMNS.map(c => <option key={c} value={c}>Move to {c}</option>)}
                              </select>
                              <button className="text-gray-500 hover:text-white p-1">
                                <FiMoreVertical />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobTracker;
