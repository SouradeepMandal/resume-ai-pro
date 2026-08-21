import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/auth` : "http://localhost:5000/api/auth",
});

// Register User
export const registerUser = async (userData) => {
  const response = await API.post("/register", userData);
  return response.data;
};

// Login User
export const loginUser = async (userData) => {
  const response = await API.post("/login", userData);
  return response.data;
};

// Verify OTP
export const verifyOTP = async (data) => {
  const response = await API.post("/verify-otp", data);
  return response.data;
};

// Get Profile
export const getProfile = async (token) => {
  const response = await API.get("/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};