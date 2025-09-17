import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { CourierController } from "./courier.controller.js";

const router = Router();

router.use(requireAuth);
router.get("/state", requireRole("repartidor", "admin"), CourierController.myState);
router.patch("/state", requireRole("repartidor", "admin"), CourierController.setState);
router.get("/my-assignments", requireRole("repartidor", "admin"), CourierController.myAssignments);

export default router;
