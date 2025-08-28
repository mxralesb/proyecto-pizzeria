// backend/src/models/order.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Order = sequelize.define(
  "order",
  {
    id_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cliente: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    metodo_pago: {
      type: DataTypes.ENUM("tarjeta", "efectivo"),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM("pagada", "pendiente", "cancelada"),
      allowNull: false,
      defaultValue: "pagada",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);
