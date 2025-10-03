// src/api/opsOrders.js
import api from "./requests";

/**
 * Listado robusto:
 * - Devuelve SIEMPRE un array de órdenes.
 * - Acepta data en data / orders / results.
 */
export const listOpsOrders = async (params) => {
  const res = await api.get("/ops/orders", { params });
  const d = res?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.orders)) return d.orders;
  if (Array.isArray(d?.results)) return d.results;
  // Algunas APIs envuelven en { data: [...] }
  if (Array.isArray(d?.data)) return d.data;
  return [];
};

export const createOpsOrder  = (payload) => api.post("/ops/orders", payload);
export const markReady       = (id) => api.patch(`/ops/orders/${id}/ready`);
export const assignCourier   = (id) => api.patch(`/ops/orders/${id}/assign-courier`);
export const deliverOpsOrder = (id) => api.patch(`/ops/orders/${id}/deliver`);
