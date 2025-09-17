import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { listOccupiedTables } from "./ops.controller.js";

const router = Router();

router.use(requireAuth);

// Mesas ocupadas (POS)
router.get(
  "/occupied-tables",
  requireRole("admin", "empleado", "mesero"),
  listOccupiedTables
);

export default router;
