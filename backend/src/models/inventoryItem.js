import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const InventoryItem = sequelize.define("InventoryItem", {
  id_inventory: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_menu_item: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: true },
  active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: "InventoryItems",
  timestamps: true
});
