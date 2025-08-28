import { Router } from "express";
import { listEmployeeRoles, listEmployees, createEmployee } from "./employee.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";

const router = Router();

router.get("/roles", requireAuth, requireRole("admin"), listEmployeeRoles);
router.get("/",     requireAuth, requireRole("admin"), listEmployees);
router.post("/",    requireAuth, requireRole("admin"), createEmployee);

export default router;
