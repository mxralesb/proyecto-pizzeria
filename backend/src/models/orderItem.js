import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OrderItem = sequelize.define("order_item", {
  id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_order: { type: DataTypes.INTEGER, allowNull: false },
  id_menu_item: { type: DataTypes.INTEGER, allowNull: true },  
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: "order_items",
  timestamps: false,
});
