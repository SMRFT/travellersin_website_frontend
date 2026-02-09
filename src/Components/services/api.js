import axios from 'axios';

// Pointing to your Django Backend URL
const API_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized (Expired Token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdmin = localStorage.getItem("userType") === 'admin';

      // Clear storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("userType");

      // Redirect based on context
      if (isAdmin) {
        window.location.href = '/admin/login';
      } else {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;