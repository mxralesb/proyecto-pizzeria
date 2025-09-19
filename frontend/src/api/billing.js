import api from "./client";

const BillingAPI = {
  list() {
    return api.get("/billing/tickets");
  },
  createFromMesa(mesa_id) {
    return api.post("/billing/tickets/from-ops", { mesa_id });
  },
  pay(idBill, payload) {
    return api.post(`/billing/tickets/${idBill}/pay`, payload);
  },
};

export default BillingAPI;
