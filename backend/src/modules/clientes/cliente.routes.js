// backend/src/modules/clientes/cliente.routes.js
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";

import {
  // EXISTENTES
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

  // NUEVOS (asegúrate de implementarlos en cliente.controller.js)
  listClientes,
  getClienteById,
} from "./cliente.controller.js";

const router = Router();

// Guard para clientes finales
const guard = [requireAuth, requireRole("cliente")];

// Guard para staff/admin (ajusta el rol a tu sistema: "admin", "direccion", "empleado", etc.)
const adminGuard = [requireAuth, requireRole("admin")];

/** ---------- PÚBLICO / AUTH BÁSICO ---------- **/
router.post("/register", registerClient);

/** ---------- PERFIL DEL CLIENTE (autenticado como cliente) ---------- **/
router.get("/me", guard, getMe);

router.get("/me/direcciones", guard, listDirecciones);
router.post("/me/direcciones", guard, createDireccion);
router.put("/me/direcciones/:id", guard, updateDireccion);
router.delete("/me/direcciones/:id", guard, deleteDireccion);

router.get("/me/telefonos", guard, listTelefonos);
router.post("/me/telefonos", guard, createTelefono);
router.put("/me/telefonos/:id", guard, updateTelefono);
router.delete("/me/telefonos/:id", guard, deleteTelefono);

/** ---------- ADMIN / STAFF ---------- **/
/** GET /api/clientes  => listado paginado/básico */
router.get("/", adminGuard, listClientes);

/** GET /api/clientes/:id  => detalle */
router.get("/:id", adminGuard, getClienteById);

export default router;
