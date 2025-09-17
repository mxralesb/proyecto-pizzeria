import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OpsOrder = sequelize.define(
  "ops_order",
  {
    id_ops_order: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    order_number: { type: DataTypes.STRING(20), unique: true, allowNull: true },
    source: { type: DataTypes.STRING(50), allowNull: false },

    details_text: { type: DataTypes.TEXT, allowNull: true },
    ingredients_text: { type: DataTypes.TEXT, allowNull: true },

    customer_name: { type: DataTypes.STRING, allowNull: true },
    customer_phone: { type: DataTypes.STRING, allowNull: true },
    customer_address: { type: DataTypes.STRING, allowNull: true },

    payment_method: { type: DataTypes.STRING(20), allowNull: true },
    change_due: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    // STRING en lugar de ENUM para evitar problemas al resetear
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },

    courier_user_id: { type: DataTypes.INTEGER, allowNull: true },
    courier_name: { type: DataTypes.STRING, allowNull: true },
    courier_status: { type: DataTypes.STRING(20), allowNull: true }, // ASSIGNED|ON_ROUTE|ARRIVED|DELIVERED

    assigned_at: { type: DataTypes.DATE, allowNull: true },
    picked_up_at: { type: DataTypes.DATE, allowNull: true },
    arrived_at: { type: DataTypes.DATE, allowNull: true },
    delivered_at: { type: DataTypes.DATE, allowNull: true },

    kitchen_ready_at: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: "ops_orders", timestamps: true }
);
