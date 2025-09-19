import { Router } from "express";
import {
  register,
  login,
  recoverPassword,
  loginWithGoogleCliente,
} from "./auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/recover", recoverPassword);
router.post("/google/cliente", loginWithGoogleCliente);

export default router;
