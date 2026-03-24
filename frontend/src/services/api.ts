import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Detect the current hostname (e.g., 192.168.1.5 or localhost)
const hostname = window.location.hostname;
let API_URL = import.meta.env.VITE_API_URL || `http://${hostname}:8000/api`;

// Always ensure it ends with a slash for relative pathing
if (!API_URL.endsWith('/')) {
    API_URL += '/';
}

const api = axios.create({
  baseURL: API_URL,
});

console.log("Axios Base URL:", API_URL);

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
