import api from "./client";

export const getInventory = () => api.get("/inventory");

export const getAddable = () => api.get("/inventory/addable");

export const createInventory = (payload) => api.post("/inventory", payload);

export const replenishInventory = (id, amount) =>
  api.post(`/inventory/${id}/replenish`, { amount });

export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);

export const removeInventory = (id) => api.delete(`/inventory/${id}`);
