// backend/src/server.js
import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./models/index.js";

const port = Number(process.env.PORT || 4000);

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  } catch (e) {
    console.error("DB start error:", e);
    process.exit(1);
  }
})();