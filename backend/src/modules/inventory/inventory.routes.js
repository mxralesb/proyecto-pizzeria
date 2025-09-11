import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import {
  listInventory,
  listAddable,
  createInventory,
  replenishInventory,
  updateInventory,
  deleteInventory,
} from "./inventory.controller.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", listInventory);
router.get("/addable", listAddable);
router.post("/", createInventory);
router.post("/:id/replenish", replenishInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;
