import { Router } from "express";
import { list, listMine, create } from "./reservations.controller.js";

const router = Router();
router.get("/", list);
router.get("/mine", listMine);
router.post("/", create);

export default router;
