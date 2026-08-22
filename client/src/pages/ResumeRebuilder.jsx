import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { rebuildResume, scoreATS, downloadPdf } from "../services/aiService";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";
import { FiDownload, FiArrowLeft, FiEdit3, FiImage } from "react-icons/fi";

function ResumeRebuilder() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const { resumeId, jobDescription } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [atsResult, setAtsResult] = useState(location.state?.result || null);
  const [rescoring, setRescoring] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  const [fontFamily, setFontFamily] = useState("font-sans");
  const componentRef = useRef();
  
  const [profilePic, setProfilePic] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!componentRef.current) return;
    setDownloading(true);
    try {
      // Add Tailwind CSS CDN to the HTML payload so Puppeteer can render it correctly
      const tailwindScript = '<script src="https://cdn.tailwindcss.com"></script>';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            ${tailwindScript}
            <style>
              body { background-color: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .printable-resume { box-shadow: none !important; margin: 0 auto; width: 210mm; min-height: 297mm; padding: 40px; }
            </style>
          </head>
          <body>
            ${componentRef.current.outerHTML}
          </body>
        </html>
      `;

      const blob = await downloadPdf(htmlContent);
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Rebuilt_Resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      addToast("Resume downloaded successfully!", "success");
    } catch (error) {
      console.error(error);
      addToast("Failed to download PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleRescore = async () => {
    if (!resumeData) return;
    setRescoring(true);
    try {
      const data = await scoreATS(resumeId, jobDescription, JSON.stringify(resumeData));
      setAtsResult(data);
      addToast("ATS Score updated!", "success");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to rescore resume.";
      addToast(errorMsg, "error");
    } finally {
      setRescoring(false);
    }
  };

  const handleRebuild = async () => {
    setLoading(true);
    try {
      const data = await rebuildResume(resumeId, jobDescription, selectedSkills.length > 0, selectedSkills);
      setResumeData(data);
      addToast("Resume successfully rebuilt!", "success");
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || "Failed to rebuild resume. Try again.";
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-sans pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm">
              <FiArrowLeft /> Back to ATS Checker
            </button>
            <h1 className="text-3xl font-bold text-white tracking-tight">AI Resume Rebuilder</h1>
            <p className="text-gray-400 mt-1">Generate a highly optimized resume tailored to your target job.</p>
          </div>
          
          <div className="flex gap-4">
            {!resumeData ? (
              <button 
                onClick={handleRebuild}
                disabled={loading}
                className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(43,181,160,0.3)] disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Rebuilding with Gemini..." : <><FiEdit3 /> Rebuild Now</>}
              </button>
            ) : (
              <>
                <button 
                  onClick={handleRescore}
                  disabled={rescoring}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all border border-white/20"
                >
                  {rescoring ? "Rescoring..." : "Rescore with AI"}
                </button>
                <button 
                  onClick={handleRebuild}
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(43,181,160,0.3)] disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? "Rebuilding..." : <><FiEdit3 /> Rebuild Again</>}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={downloading}
                  className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(43,181,160,0.3)] flex items-center gap-2 disabled:opacity-50"
                >
                  <FiDownload /> {downloading ? "PDF..." : "Download"}
                </button>
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {atsResult && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                <h2 className="text-xl font-bold text-white mb-4">ATS Analysis</h2>
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-black border-4 border-teal-500 shadow-[0_0_20px_rgba(43,181,160,0.4)]">
                    <span className="text-3xl font-bold text-teal-400">{atsResult.atsScore}</span>
                  </div>
                  <p className="text-center text-sm text-gray-300">{atsResult.matchAnalysis}</p>
                </div>

                {resumeData && (
                  <div className="bg-teal-900/30 border border-teal-500/30 rounded-lg p-3 mb-6">
                    <p className="text-teal-300 text-xs flex gap-2 items-start">
                      <span className="text-base mt-[-2px]">💡</span>
                      <span>
                        <strong>Pro Tip:</strong> Always click <strong>Rescore with AI</strong> after generating! If skills are still missing, tick them and hit <strong>Rebuild Again</strong>.
                      </span>
                    </p>
                  </div>
                )}

                {atsResult.missingSkills && atsResult.missingSkills.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-red-400 font-medium text-sm mb-2">Select Skills to Auto-Integrate</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {atsResult.missingSkills.map((s, i) => (
                        <label key={i} className="flex items-center text-xs text-gray-300 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="mr-2 rounded border-gray-600 bg-black/50 text-teal-500 focus:ring-teal-500"
                            checked={selectedSkills.includes(s)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSkills([...selectedSkills, s]);
                              } else {
                                setSelectedSkills(selectedSkills.filter(skill => skill !== s));
                              }
                            }}
                          />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {atsResult.matchingSkills && atsResult.matchingSkills.length > 0 && (
                  <div>
                    <h3 className="text-green-400 font-medium text-sm mb-2">Matching Skills</h3>
                    <ul className="text-xs text-gray-400 space-y-1 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {atsResult.matchingSkills.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[400px]">
                 <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                 <p className="mt-6 text-teal-400 font-medium animate-pulse text-lg">Gemini AI is crafting your perfect resume...</p>
                 <p className="mt-2 text-gray-500 text-sm max-w-md text-center">We're optimizing your experience, adding strong action verbs, and matching keywords from the job description.</p>
              </div>
            )}

            {!loading && !resumeData && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-gray-400 min-h-[400px] flex flex-col justify-center items-center">
                <FiEdit3 className="w-12 h-12 mb-4 opacity-20" />
                <p>Click "Rebuild Now" to generate an ATS-optimized resume.</p>
              </div>
            )}

            {resumeData && !loading && (
              <div className="flex flex-col items-center gap-6">
                
                {/* Customization Toolbar */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 w-full">
                  <label className="text-sm text-gray-300 font-medium">Resume Font Style:</label>
                  <select 
                    value={fontFamily} 
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="bg-black/50 border border-gray-800 rounded-lg py-2 px-4 text-sm text-gray-200 focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
                  >
                    <option value="font-sans">Modern (Sans-Serif)</option>
                    <option value="font-serif">Classic (Serif)</option>
                    <option value="font-mono">Technical (Monospace)</option>
                  </select>
                  
                  <div className="ml-auto">
                    <label className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 transition-all border border-white/20 text-sm">
                      <FiImage /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center w-full overflow-x-auto">
                
                {/* The actual HTML resume template that will be printed */}
                <div className={`bg-white text-black p-10 shadow-2xl rounded-sm w-full max-w-[210mm] min-h-[297mm] printable-resume ${fontFamily}`} ref={componentRef}>
                  
                  {/* Header */}
                  <div className="border-b-2 border-gray-300 pb-6 mb-6 flex flex-col items-center">
                    {profilePic && (
                      <img src={profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 mb-4 shadow-sm" />
                    )}
                    <h1 className="text-4xl font-serif text-gray-900 mb-2 uppercase tracking-wide text-center">{resumeData.personalInfo?.name || "Your Name"}</h1>
                    <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {resumeData.personalInfo?.email && <span>{resumeData.personalInfo.email}</span>}
                      {resumeData.personalInfo?.phone && <span>• {resumeData.personalInfo.phone}</span>}
                      {resumeData.personalInfo?.location && <span>• {resumeData.personalInfo.location}</span>}
                      {resumeData.personalInfo?.linkedin && <span>• {resumeData.personalInfo.linkedin}</span>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Professional Summary</h2>
                      <p className="text-sm text-gray-700 leading-relaxed text-justify">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience && resumeData.experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">Work Experience</h2>
                      <div className="space-y-5">
                        {resumeData.experience.map((exp, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-gray-900">{exp.title}</h3>
                              <span className="text-sm font-semibold text-gray-600">{exp.date}</span>
                            </div>
                            <div className="text-sm italic text-gray-700 mb-2">{exp.company}</div>
                            <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed">
                              {exp.description?.map((bullet, i) => (
                                <li key={i}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education && resumeData.education.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Education</h2>
                      <div className="space-y-3">
                        {resumeData.education.map((edu, idx) => (
                          <div key={idx} className="flex justify-between items-baseline">
                            <div>
                              <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                              <div className="text-sm text-gray-700">{edu.school}</div>
                            </div>
                            <span className="text-sm font-semibold text-gray-600">{edu.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects && resumeData.projects.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">Projects</h2>
                      <div className="space-y-5">
                        {resumeData.projects.map((proj, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-gray-900">{proj.title}</h3>
                              {proj.date && <span className="text-sm font-semibold text-gray-600">{proj.date}</span>}
                            </div>
                            {proj.description && proj.description.length > 0 && (
                              <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed mt-2">
                                {proj.description.map((bullet, i) => (
                                  <li key={i}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resumeData.certifications && resumeData.certifications.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Certifications</h2>
                      <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed">
                        {resumeData.certifications.map((cert, idx) => (
                          <li key={idx}>{cert}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Achievements */}
                  {resumeData.achievements && resumeData.achievements.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Achievements & Awards</h2>
                      <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed">
                        {resumeData.achievements.map((achieve, idx) => (
                          <li key={idx}>{achieve}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Publications */}
                  {resumeData.publications && resumeData.publications.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Publications & Research</h2>
                      <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed">
                        {resumeData.publications.map((pub, idx) => (
                          <li key={idx}>{pub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills && resumeData.skills.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Skills</h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {resumeData.skills.join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* Languages */}
                  {resumeData.languages && resumeData.languages.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Languages</h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {resumeData.languages.join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* Hobbies */}
                  {resumeData.hobbies && resumeData.hobbies.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">Hobbies & Interests</h2>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {resumeData.hobbies.join(" • ")}
                      </p>
                    </div>
                  )}

                  {/* References */}
                  {resumeData.references && resumeData.references.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">References</h2>
                      <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1.5 leading-relaxed">
                        {resumeData.references.map((ref, idx) => (
                          <li key={idx}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .printable-resume {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
          }
          @page {
            margin: 15mm;
          }
        }
      `}} />
    </div>
  );
}

export default ResumeRebuilder;
