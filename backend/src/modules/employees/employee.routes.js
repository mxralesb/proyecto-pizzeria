import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  listEmployees,
  listRoles,
  createEmployee,
  updateEmployee,
  setEmployeeStatus,
} from "./employee.controller.js";

const router = Router();

// Todas requieren login
router.use(requireAuth);

// Solo admin
const guard = [requireRole("admin")];

router.get("/roles", guard, listRoles);
router.get("/", guard, listEmployees);
router.post("/", guard, createEmployee);

// 👇 nuevas
router.patch("/:id", guard, updateEmployee);        // actualizar datos
router.patch("/:id/status", guard, setEmployeeStatus); // activar / inactivar

export default router;
