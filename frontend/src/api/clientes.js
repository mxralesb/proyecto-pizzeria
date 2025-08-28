import client from "./client";

export const getMe = () => client.get("/clientes/me");

export const registerClient = (payload) => client.post("/clientes/register", payload);

export const listDirecciones = () => client.get("/clientes/me/direcciones");
export const createDireccion = (payload) => client.post("/clientes/me/direcciones", payload);
export const updateDireccion = (id, payload) => client.put(`/clientes/me/direcciones/${id}`, payload);
export const deleteDireccion = (id) => client.delete(`/clientes/me/direcciones/${id}`);

export const listTelefonos = () => client.get("/clientes/me/telefonos");
export const createTelefono = (payload) => client.post("/clientes/me/telefonos", payload);
export const updateTelefono = (id, payload) => client.put(`/clientes/me/telefonos/${id}`, payload);
export const deleteTelefono = (id) => client.delete(`/clientes/me/telefonos/${id}`);
