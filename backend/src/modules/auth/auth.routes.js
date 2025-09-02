import { Router } from "express";
import {
  register,
  login,
  recoverPassword,
  loginWithGoogleCliente, // <- usamos este
} from "./auth.controller.js";

const router = Router();

// Admin / empleados (tabla users)
router.post("/register", register);
router.post("/login", login);
router.post("/recover", recoverPassword);

// Google SOLO para clientes (tabla clientes)
router.post("/google/cliente", loginWithGoogleCliente); // <- ruta correcta

export default router;
