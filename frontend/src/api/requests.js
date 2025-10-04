// src/api/requests.js
import axios from "axios";

/**
 * IMPORTANTE:
 * En Render, tu frontend y backend están en dominios distintos.
 * Debes DEFINIR VITE_API_URL en el frontend apuntando al backend:
 *   VITE_API_URL=https://proyecto-pizzeria.onrender.com/api
 *
 * Si NO está definida, el fallback usa window.location.origin + '/api',
 * que solo sirve si el backend está en el MISMO dominio que el front.
 */
const fromEnv = import.meta.env.VITE_API_URL;

/** Normaliza la URL base:
 * - Elimina barras finales extra
 * - Si ya termina en /api, no añade nada
 * - Si NO, añade /api
 */
function normalizeBase(url) {
  if (!url) return null;
  let u = String(url).trim().replace(/\/+$/, "");
  if (!/\/api$/.test(u)) u = `${u}/api`;
  return u;
}

// 1) Si hay VITE_API_URL, úsala SIEMPRE (RECOMENDADO en Render)
let baseURL = normalizeBase(fromEnv);

// 2) Fallback solo si no hay VITE_API_URL (sirve para dev local monolítico)
if (!baseURL) {
  const local = normalizeBase(window.location.origin);
  baseURL = local;
  if (import.meta.env.DEV) {
    console.warn(
      "[API] VITE_API_URL no definida. Usando fallback:",
      baseURL,
      "\nDefine VITE_API_URL si tu API vive en otro dominio."
    );
  }
}

const instance = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Adjunta token si existe
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log y propagación de errores del backend (verás el motivo real)
instance.interceptors.response.use(
  (res) => res,
  (error) => {
    const cfg = error.config || {};
    const resp = error.response;

    console.error(
      `[API ERROR] ${cfg.method?.toUpperCase?.() || "?"} ${cfg.url || "?"}`,
      {
        baseURL: cfg.baseURL,
        status: resp?.status,
        data: resp?.data,
        message: error.message,
      }
    );

    const richer = new Error(
      resp?.data?.error ||
        resp?.data?.message ||
        error.message ||
        "Error de red"
    );
    richer.status = resp?.status;
    richer.data = resp?.data;
    throw richer;
  }
);

const api = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default api;
