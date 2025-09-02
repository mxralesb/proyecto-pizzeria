import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  timeout: 15000,
});

api.setToken = (token) => {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export default api;
