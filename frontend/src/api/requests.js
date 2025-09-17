import axios from "axios";

// Toma la URL de la API del .env o usa el default
const baseURL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:4000/api";

const instance = axios.create({
  baseURL,
  withCredentials: false,
});

// Agrega el token JWT si existe
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const api = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default api;
