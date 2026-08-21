import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/ai` : "http://localhost:5000/api/ai";

export const scoreATS = async (resumeId, jobDescription, customText = null) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/score`,
    { resumeId, jobDescription, customText },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const predictInterview = async (jobId) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/predict-interview`,
    { jobId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const rebuildResume = async (resumeId, jobDescription, autoIntegrate = false, missingSkills = []) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/rebuild-resume`,
    { resumeId, jobDescription, autoIntegrate, missingSkills },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
export const downloadPdf = async (html) => {
  const token = localStorage.getItem("token");
  const response = await axios.post(
    `${API_URL}/download-pdf`,
    { html },
    {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob' // Important for downloading files
    }
  );
  return response.data;
};
