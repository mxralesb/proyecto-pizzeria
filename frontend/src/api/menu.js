import api from "./client";
export const listMenu = () => api.get("/menu");
