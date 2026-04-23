import axios from 'axios';
import { getAccessToken, refreshAccessToken, logout } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_RESOURCE_SERVER_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      await refreshAccessToken();
      const token = getAccessToken();
      if (!token) { logout(); return Promise.reject(error); }
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

export default api;
