import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const MenuItem = sequelize.define("MenuItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: "pizza" },
  available: { type: DataTypes.BOOLEAN, defaultValue: true },
  image: { type: DataTypes.STRING }
});
