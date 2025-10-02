// backend/src/app.js
import express from "express";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./modules/auth/auth.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import reservationRoutes from "./modules/reservations/reservations.routes.js";
import employeesRouter from "./modules/employees/employee.routes.js";
import clientRoutes from "./modules/clientes/cliente.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import orderTrackingRoutes from "./modules/orders/tracking.routes.js";
import mesasRoutes from "./modules/mesas/mesas.routes.js";
// import opsRoutes from "./modules/ops/ops.routes.js"; // <- ⚠️ solo si NO se pisa con opsOrders
import opsOrdersRoutes from "./modules/ops/orders/opsOrders.routes.js";
import courierRoutes from "./modules/couriers/courier.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";
import { ensureOrderOpsLink } from "./utils/ensureOrderOpsLink.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      /\.onrender\.com$/, // OK: RegExp permitido
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "2mb" })); // pequeño extra por si mandas payloads grandecitos

// Raíz y health
app.get("/", (_req, res) => {
  res.type("html").send(`<pre>Pizzería API
GET  /health
GET  /api/health
...  /api/*
</pre>`);
});
app.get("/health", (_req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV, time: new Date().toISOString() })
);
// Alias que usaste en pruebas:
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV, time: new Date().toISOString() })
);

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/employees", employeesRouter);
app.use("/api/clientes", clientRoutes);
app.use("/api/orders", orderRoutes);

// Si quieres que tracking cuelgue de /api/orders/tracking, déjalo como lo tenías.
// Yo lo separo para evitar colisiones y hacerlo más claro:
app.use("/api/tracking", orderTrackingRoutes);

app.use("/api/mesas", mesasRoutes);

// app.use("/api/ops", opsRoutes); // ⚠️ monta esto solo si NO duplica endpoints del tablero
app.use("/api/ops-orders", opsOrdersRoutes); // ✅ <-- lo que espera Orders.jsx

app.use("/api/couriers", courierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/billing", billingRoutes);

// 404 y errores
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno" });
});

// Tarea auxiliar
(async () => {
  try {
    await ensureOrderOpsLink();
    console.log("ensureOrderOpsLink OK");
  } catch (e) {
    console.warn("ensureOrderOpsLink falló (continúo):", e?.message || e);
  }
})();

export default app;
