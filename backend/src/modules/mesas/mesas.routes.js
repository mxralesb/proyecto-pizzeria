import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { listTables, occupyTable, freeTable, releaseAfterClean } from "./mesas.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", requireRole("admin", "mesero"), listTables);

router.post("/ocupar", requireRole("admin", "mesero"), occupyTable);
router.post("/liberar", requireRole("admin", "mesero"), freeTable);
router.post("/liberar-despues-limpieza", requireRole("admin", "mesero"), releaseAfterClean);

router.post("/occupy", requireRole("admin", "mesero"), occupyTable);
router.post("/free", requireRole("admin", "mesero"), freeTable);
router.post("/release-after-clean", requireRole("admin", "mesero"), releaseAfterClean);

export default router;
