import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
  // timeout: 20000,
  // withCredentials: true,
});

api.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) request.headers["token"] = token;
  return request;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.log("token cleared");
      localStorage.removeItem("token");
      console.log("Token expired or invalid");
    }
    return Promise.reject(error);
  }
);
