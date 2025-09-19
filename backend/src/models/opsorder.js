import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const OpsOrder = sequelize.define(
  "OpsOrder",
  {
    id_ops_order: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

    // Identificación / texto
    order_number: { type: DataTypes.STRING(20), allowNull: false },
    source: { type: DataTypes.STRING(50), allowNull: false },
    details_text: { type: DataTypes.TEXT, allowNull: true },
    ingredients_text: { type: DataTypes.TEXT, allowNull: true },

    // Estado de cocina / entrega
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
    assigned_at: { type: DataTypes.DATE, allowNull: true },
    picked_up_at: { type: DataTypes.DATE, allowNull: true },
    arrived_at: { type: DataTypes.DATE, allowNull: true },
    delivered_at: { type: DataTypes.DATE, allowNull: true },
    kitchen_ready_at: { type: DataTypes.DATE, allowNull: true },

    // Cliente (cuando aplique)
    customer_name: { type: DataTypes.STRING, allowNull: true },
    customer_phone: { type: DataTypes.STRING, allowNull: true },
    customer_address: { type: DataTypes.STRING, allowNull: true },

    // Pago (cuando aplique)
    payment_method: { type: DataTypes.STRING, allowNull: true },
    change_due: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    // Repartidor (cuando aplique)
    courier_user_id: { type: DataTypes.INTEGER, allowNull: true },
    courier_name: { type: DataTypes.STRING, allowNull: true },
    courier_status: { type: DataTypes.STRING(20), allowNull: true },

    // 🔴 Campo clave para Cobros:
    mesa_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "ops_orders",
    underscored: true, // created_at/updated_at en snake_case
    timestamps: true,
  }
);
