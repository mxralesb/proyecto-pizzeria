import api from "./requests";

export const createOpsOrder  = (payload) => api.post("/ops/orders", payload);
export const listOpsOrders   = (params) => api.get("/ops/orders", { params });
export const markReady       = (id) => api.patch(`/ops/orders/${id}/ready`);
export const assignCourier   = (id) => api.patch(`/ops/orders/${id}/assign-courier`);
export const deliverOpsOrder = (id) => api.patch(`/ops/orders/${id}/deliver`);
