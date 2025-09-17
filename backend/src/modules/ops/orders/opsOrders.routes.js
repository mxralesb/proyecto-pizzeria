import { Router } from "express";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/roles.js";
import { OpsOrdersController } from "./opsOrders.controller.js";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  requireRole("admin", "empleado", "mesero", "cocinero", "cliente"),
  async (req, res, next) => {
    try {
      const role = req.user?.role;
      const source = req.body?.source || "";
      if (role === "cliente" && source !== "Cliente Online") {
        return res.status(403).json({ error: "Solo se permite source 'Cliente Online' para clientes" });
      }
      delete req.body.status;
      delete req.body.courier_user_id;
      delete req.body.courier_name;
      delete req.body.courier_status;
      return OpsOrdersController.create(req, res);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", requireRole("admin", "empleado", "mesero", "cocinero", "repartidor"), OpsOrdersController.list);
router.patch("/:id/ready", requireRole("admin", "cocinero"), OpsOrdersController.ready);
router.patch("/:id/assign-courier", requireRole("admin", "cocinero"), OpsOrdersController.assignCourier);
router.patch("/:id/deliver", requireRole("admin", "empleado"), OpsOrdersController.deliver);
router.patch("/:id/status", requireRole("admin", "empleado"), OpsOrdersController.setStatus);
router.patch("/:id/courier-status", requireRole("repartidor", "admin"), OpsOrdersController.setCourierStatus);

export default router;
