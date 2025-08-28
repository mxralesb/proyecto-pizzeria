import api from "./client";

export const createOrder = (payload) => api.post("/orders", payload);

export const getMyOrders = () => api.get("/orders/me");
