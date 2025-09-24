// backend/src/config/database.js
import { Sequelize } from "sequelize";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: process.env.DB_LOGGING === "true" ? console.log : false,
  pool: { max: 10, min: 0, idle: 10_000, acquire: 30_000 },
  dialectOptions: {
    ssl: {
      require: true,              // Neon exige SSL
      rejectUnauthorized: false,  // Render + Neon
    },
  },
});
