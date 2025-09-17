// backend/scripts/sync_ops_orders.js
import "dotenv/config";
import { sequelize, OpsOrder, OpsOrderItem } from "../src/models/index.js";

(async () => {
  try {
    await sequelize.authenticate();
    await OpsOrder.sync({ alter: true });
    await OpsOrderItem.sync({ alter: true });
    console.log("✅ Tablas ops_orders listas.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Error en sync_ops_orders:", e);
    process.exit(1);
  }
})();
