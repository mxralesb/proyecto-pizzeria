import api from "./client";

export const fetchMesas = () => api.get("/mesas");
export const assignMesa = (id, people) => api.put(`/mesas/${id}/assign`, { people });
export const cleanMesa = (id) => api.put(`/mesas/${id}/clean`);
export const freeMesa = (id) => api.put(`/mesas/${id}/free`);
export const setCapacity = (id, capacidad) => api.put(`/mesas/${id}/capacity`, { capacidad });
