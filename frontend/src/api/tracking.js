import api from "./client";

export const trackOrder = (orderNumber) =>
  api.get(`/orders/track/${encodeURIComponent(orderNumber)}`);
