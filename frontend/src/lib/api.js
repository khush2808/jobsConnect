import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important: Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    if (error.response?.status === 401) {
      // Only redirect if not already on login page to prevent loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // Add better error messages
    if (error.response?.status === 500) {
      error.message = "Server error. Please try again later.";
    } else if (error.response?.status === 404) {
      error.message = "Resource not found.";
    } else if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default api;
