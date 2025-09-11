import express from "express";
import cors from "cors";

import authRoutes from "./modules/auth/auth.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import reservationRoutes from "./modules/reservations/reservations.routes.js";
import employeesRouter from "./modules/employees/employee.routes.js";
import clientRoutes from "./modules/clientes/cliente.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import mesasRoutes from "./modules/mesas/mesas.routes.js";
import opsRoutes from "./modules/ops/ops.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js"; // 👈

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/employees", employeesRouter);
app.use("/api/clientes", clientRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/mesas", mesasRoutes);
app.use("/api/ops", opsRoutes);
app.use("/api/inventory", inventoryRoutes); // 👈

export default app;
