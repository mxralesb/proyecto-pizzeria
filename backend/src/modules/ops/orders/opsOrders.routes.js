import { Router } from "express";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/roles.js";
import {
  listOpsOrders,
  createOpsOrder,          // ⬅️ NUEVO
  markReady,
  assignCourier,
  deliverOpsOrder,
} from "./opsOrders.controller.js";

const router = Router();
router.use(requireAuth);

// LISTAR tablero
router.get("/", requireRole("admin","mesero","cocinero","repartidor"), listOpsOrders);

// CREAR (desde POS/checkout)
router.post("/", requireRole("admin","mesero","cocinero"), createOpsOrder);

// COMPATIBILIDAD (si tu POS usa este path)
router.post("/send-to-kitchen", requireRole("admin","mesero","cocinero"), createOpsOrder);

// ACCIONES (acepta POST o PATCH, por compatibilidad)
["post","patch"].forEach((m) => {
  router[m]("/:id/ready",          requireRole("admin","cocinero"),             markReady);
  router[m]("/:id/assign-courier", requireRole("admin","cocinero","mesero"),    assignCourier);
  router[m]("/:id/deliver",        requireRole("admin","repartidor","mesero"),  deliverOpsOrder);
});

export default router;
