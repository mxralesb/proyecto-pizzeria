import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { listEmployees, listRoles, createEmployee } from "./employee.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/roles", requireRole("admin"), listRoles);
router.get("/", requireRole("admin"), listEmployees);
router.post("/", requireRole("admin"), createEmployee);

export default router;
