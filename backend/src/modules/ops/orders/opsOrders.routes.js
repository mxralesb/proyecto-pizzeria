import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  listOpsOrders,
  markReady,
  assignCourier,
  deliverOpsOrder,
} from "./opsOrders.controller.js";

const router = Router();

router.use(requireAuth);

// GET lista para tablero
router.get("/", requireRole("admin", "mesero", "cocinero", "repartidor"), listOpsOrders);

// Acciones del tablero
router.post("/:id/ready",          requireRole("admin", "cocinero"),             markReady);
router.post("/:id/assign-courier", requireRole("admin", "cocinero", "mesero"),   assignCourier);
router.post("/:id/deliver",        requireRole("admin", "repartidor", "mesero"), deliverOpsOrder);

export default router;
