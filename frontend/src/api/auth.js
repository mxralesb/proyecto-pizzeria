import client from "./client";

export const loginWithGoogleIdTokenCliente = (idToken, extra = {}) =>
  client.post("/auth/google/cliente", { idToken, ...extra });
//            ^^^^^^^^^^^^^^^^^^^^^^  ruta correcta
