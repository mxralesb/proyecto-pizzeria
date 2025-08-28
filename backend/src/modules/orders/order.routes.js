import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { listMyOrders, createOrder } from "./order.controller.js";

const router = Router();
const guard = [requireAuth, requireRole("cliente")];

router.get("/me", guard, listMyOrders);
router.post("/", guard, createOrder);
router.post("/", requireAuth, requireRole("cliente"), createOrder);
router.get("/me", requireAuth, requireRole("cliente"), listMyOrders);

export default router;
