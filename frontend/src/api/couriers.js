
import api from "./client";
export function getAvailability() {
  return api.get("/couriers/state");
}

export function setAvailability(available) {
  return api.patch("/couriers/state", { available });
}

export function myAssignments() {
  return api.get("/couriers/my-assignments");
}

export function setCourierStatus(orderId, status) {
  return api.patch(`/ops/orders/${orderId}/courier-status`, { status });
}
    