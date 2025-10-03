import axios from "axios";

// Toma VITE_API_URL o deduce desde window.location
const fromEnv = import.meta.env.VITE_API_URL;

// Normaliza y garantiza que termine en /api
function normalizeBase(url) {
  let u = (url || window.location.origin).replace(/\/+$/, "");
  if (!/\/api$/.test(u)) u = `${u}/api`;
  return u;
}

const baseURL = normalizeBase(fromEnv);

const instance = axios.create({
  baseURL,
  withCredentials: false,
});

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
