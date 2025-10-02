import { DataTypes } from "sequelize";
import { sequelize } from "../utils/sequelize.js";

export const OpsOrder = sequelize.define(
  "OpsOrder",
  {
    id_ops_order: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_number: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    source:       { type: DataTypes.STRING(32), allowNull: false, defaultValue: "POS" }, // POS | WEB | PHONE...
    status:       { type: DataTypes.ENUM("PENDING","DELIVERED","CANCELLED"), allowNull: false, defaultValue: "PENDING" },

    // cocina
    kitchen_ready_at: { type: DataTypes.DATE, allowNull: true },

    // reparto
    courier_user_id:  { type: DataTypes.INTEGER, allowNull: true },
    courier_name:     { type: DataTypes.STRING(120), allowNull: true },
    courier_status:   { type: DataTypes.ENUM("ASSIGNED","ON_ROUTE","ARRIVED","DELIVERED"), allowNull: true },

    // cliente
    customer_name:    { type: DataTypes.STRING(120), allowNull: true },
    customer_phone:   { type: DataTypes.STRING(32), allowNull: true },
    customer_address: { type: DataTypes.STRING(240), allowNull: true },

    ingredients_text: { type: DataTypes.TEXT, allowNull: true }, // "sin cebolla | orégano extra"
    total:            { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    delivered_at:     { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "ops_orders", schema: "pizzeria", underscored: true }
);
