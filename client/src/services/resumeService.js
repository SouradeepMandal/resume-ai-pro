import axios from "axios";

const API_URL = "http://localhost:5000/api/resumes";

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