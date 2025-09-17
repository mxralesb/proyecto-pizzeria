import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const CourierState = sequelize.define(
  "courier_state",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    current_ops_order_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "courier_states", timestamps: true }
);
