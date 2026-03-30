import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Detect the current hostname for local testing (e.g., 192.168.1.5 or localhost)
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const rawApiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8000/api`;

// IMPORTANT: baseURL must NOT end with a trailing slash, and all request paths
// must NOT start with a leading slash. Otherwise Axios resolves from the origin
// root and the /api prefix is dropped, causing 404 errors on all auth routes.
const API_URL = rawApiUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth state and redirect to login
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
