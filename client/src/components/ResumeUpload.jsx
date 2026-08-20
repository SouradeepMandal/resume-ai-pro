import { useState, useRef } from "react";
import { uploadResume } from "../services/resumeService";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiFileText, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { useToast } from "../context/ToastContext";
import Button from "./ui/Button";

const ResumeUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    
    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      addToast("File size must be less than 5MB", "error");
      return;
    }

    setFile(selectedFile);
  };

  const onFileSelect = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addToast("Please select a resume first.", "error");
      return;
    }

    try {
      setLoading(true);
      const data = await uploadResume(file);
      addToast(data.message, "success");
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Resume upload failed:", error);
      addToast(
        error.response?.data?.message || "Resume upload failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-gray-200/20 glass-dark p-8 shadow-2xl relative overflow-hidden">
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 glass-dark flex flex-col items-center justify-center rounded-2xl"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
              />
              <p className="text-indigo-400 font-medium animate-pulse">Processing Resume...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Upload Resume
            </h2>
            <p className="text-gray-400 mt-1">
              Supported formats: PDF or DOCX (Max 5MB)
            </p>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-200 ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={onFileSelect}
            className="hidden"
            ref={fileInputRef}
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                  <FiUploadCloud className="w-8 h-8" />
                </div>
                <p className="text-gray-300 font-medium text-lg mb-1">
                  Drag and drop your file here
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  or click to browse from your computer
                </p>
                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Browse Files
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-md bg-gray-800/80 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-12 h-12 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-6 h-6" />
                  </div>
                  <div className="truncate">
                    <p className="text-white font-medium truncate">{file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {file && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-end"
          >
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleUpload} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Upload & Analyze
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;