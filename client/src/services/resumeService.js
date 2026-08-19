import axios from "axios";

const API_URL = "http://localhost:5000/api/resumes";

// ==========================================
// Upload Resume
// ==========================================

export const uploadResume = async (file) => {
  const token = localStorage.getItem("token");

  const formData = new FormData();

  formData.append("resume", file);

  const response = await axios.post(
    `${API_URL}/upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// ==========================================
// Get Logged-in User's Resumes
// ==========================================

export const getMyResumes = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// ==========================================
// Download Resume
// ==========================================

export const downloadResume = async (resumeId) => {
  const token = localStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/${resumeId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: "blob",
    }
  );

  return response.data;
};


// ==========================================
// Delete Resume
// ==========================================

export const deleteResume = async (resumeId) => {
  const token = localStorage.getItem("token");

  const response = await axios.delete(
    `${API_URL}/${resumeId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};