// backend/src/modules/orders/tracking.routes.js
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { trackOrder } from "./tracking.controller.js";

const router = Router();
const guard = [requireAuth, requireRole("cliente")];

// misma ruta que en order.routes.js (elige UNA de las dos en app.js)
router.get("/:id/track", guard, trackOrder);

export default router;
