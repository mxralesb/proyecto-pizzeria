// client/src/api/opsOrders.js (ajustado)
export const createOpsOrder  = (payload) => api.post("/ops-orders", payload);
export const listOpsOrders   = (params)  => api.get("/ops-orders", { params });
export const markReady       = (id)      => api.post(`/ops-orders/${id}/ready`);
export const assignCourier   = (id,p={}) => api.post(`/ops-orders/${id}/assign-courier`, p);
export const deliverOpsOrder = (id)      => api.post(`/ops-orders/${id}/deliver`);
