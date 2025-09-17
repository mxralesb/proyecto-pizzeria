// frontend/src/api/couriers.js
import api from "./client";

/** Lee si el repartidor está disponible */
export function getAvailability() {
  return api.get("/couriers/state");
}

/** Cambia disponibilidad del repartidor */
export function setAvailability(available) {
  // puedes enviar { available } o { is_available }, el backend acepta ambos
  return api.patch("/couriers/state", { available });
}

/** Pedidos asignados al repartidor logueado */
export function myAssignments() {
  return api.get("/couriers/my-assignments");
}

/** Cambia el estado del repartidor en una orden OPS */
export function setCourierStatus(orderId, status) {
  // backend: PATCH /api/ops/orders/:id/courier-status { status: "ON_ROUTE"|"ARRIVED"|"DELIVERED" }
  return api.patch(`/ops/orders/${orderId}/courier-status`, { status });
}
    