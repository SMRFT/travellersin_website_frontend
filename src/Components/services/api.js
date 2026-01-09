import axios from 'axios';

// Pointing to your Django Backend URL
const API_URL = process.env.REACT_APP_BACKEND_BASE_URL; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token if you implement JWT later
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;