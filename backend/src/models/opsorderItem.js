import { DataTypes } from "sequelize";
import { sequelize } from "../utils/sequelize.js";
import { OpsOrder } from "./opsorder.js";

export const OpsOrderItem = sequelize.define(
  "OpsOrderItem",
  {
    id_ops_order_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_ops_order:      { type: DataTypes.INTEGER, allowNull: false },
    id_menu_item:      { type: DataTypes.INTEGER, allowNull: true },   // opcional
    name:              { type: DataTypes.STRING(200), allowNull: true },// si no hay menuItem, usamos name
    qty:               { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price:        { type: DataTypes.DECIMAL(10,2), allowNull: true },
    note:              { type: DataTypes.STRING(240), allowNull: true },
  },
  { tableName: "ops_order_items", schema: "pizzeria", underscored: true }
);

OpsOrder.hasMany(OpsOrderItem, { as: "items", foreignKey: "id_ops_order", onDelete: "CASCADE" });
OpsOrderItem.belongsTo(OpsOrder, { as: "order", foreignKey: "id_ops_order" });
