import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OpsOrderItem = sequelize.define(
  "OpsOrderItem",
  {
    id_ops_order_item: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_ops_order: { type: DataTypes.INTEGER, allowNull: false },
    id_menu_item: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    note: { type: DataTypes.STRING, allowNull: true },
  },
  { tableName: "ops_order_items", timestamps: true }
);
