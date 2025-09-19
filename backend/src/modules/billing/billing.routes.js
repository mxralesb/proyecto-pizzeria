import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  occupiedTables,
  summaryToday,
  createTicketFromOps,
  listTickets,
  payTicket,
  debugLastOps,
} from "./billing.controller.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/occupied-tables",
  requireRole("admin", "empleado", "mesero"),
  occupiedTables
);

router.get(
  "/summary/today",
  requireRole("admin", "empleado", "mesero"),
  summaryToday
);

router.post(
  "/tickets/from-ops",
  requireRole("admin", "empleado", "mesero"),
  createTicketFromOps
);

router.get(
  "/tickets",
  requireRole("admin", "empleado", "mesero"),
  listTickets
);

router.post(
  "/tickets/:id/pay",
  requireRole("admin", "empleado"),
  payTicket
);

router.get(
  "/debug/ops-last",
  requireRole("admin", "empleado", "mesero"),
  debugLastOps
);

export default router;
