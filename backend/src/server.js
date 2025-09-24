// backend/src/server.js
import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./config/database.js";

const PORT = Number(process.env.PORT || 4000);
const SHOULD_SYNC = process.env.SYNC_DB === "1"; // activa SOLO cuando quieras

async function start() {
  try {
    await sequelize.authenticate();
    console.log("DB connection OK");

    if (SHOULD_SYNC) {
      console.log("Running sequelize.sync({ alter: true })...");
      await sequelize.sync({ alter: true });
      console.log("Sync done");
    }
  } catch (e) {
    console.error("DB start error:", e?.message || e);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API listening on ${PORT}`);
  });
}

start();
