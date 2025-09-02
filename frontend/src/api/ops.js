import api from "./client";

export const opsApi = {
  board: () => api.get("/ops/board"),
  setStatus: (id, status) => api.patch(`/ops/${id}/status`, { status }),
  posCreate: (payload) => api.post("/ops/pos", payload),
  cashClose: (id, cash_received) => api.post(`/ops/${id}/cash`, { cash_received }),
};
