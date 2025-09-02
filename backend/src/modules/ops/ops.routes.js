import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { listOccupiedTables, createPosOrder } from "./ops.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/occupied-tables",
  requireRole("admin", "empleado", "mesero"),
  listOccupiedTables
);

router.post(
  "/orders",
  requireRole("admin", "empleado", "mesero"),
  createPosOrder
);

export default router;
