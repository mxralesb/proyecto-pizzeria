import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  getMe,
  listDirecciones,
  createDireccion,
  updateDireccion,
  deleteDireccion,
  listTelefonos,
  createTelefono,
  updateTelefono,
  deleteTelefono,
  registerClient,
} from "./cliente.controller.js";

const router = Router();
const guard = [requireAuth, requireRole("cliente")];

router.post("/register", registerClient);

router.get("/me", guard, getMe);

router.get("/me/direcciones", guard, listDirecciones);
router.post("/me/direcciones", guard, createDireccion);
router.put("/me/direcciones/:id", guard, updateDireccion);
router.delete("/me/direcciones/:id", guard, deleteDireccion);

router.get("/me/telefonos", guard, listTelefonos);
router.post("/me/telefonos", guard, createTelefono);
router.put("/me/telefonos/:id", guard, updateTelefono);
router.delete("/me/telefonos/:id", guard, deleteTelefono);

export default router;