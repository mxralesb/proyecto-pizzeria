import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sequelize } from "./models/index.js";

const port = Number(process.env.PORT || 4000);

(async ()=>{
  await sequelize.authenticate();
  app.listen(port, ()=> console.log(`API on http://localhost:${port}`));
})();
