import { Router } from "express";
import { listMenu, createItem, updateItem, removeItem } from "./menu.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
const router = Router();

router.get("/", listMenu);
router.post("/", requireAuth, requireRole("admin","recepcionista"), createItem);
router.put("/:id", requireAuth, requireRole("admin","recepcionista"), updateItem);
router.delete("/:id", requireAuth, requireRole("admin"), removeItem);

export default router;
