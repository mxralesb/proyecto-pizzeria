import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    email: {
      type: DataTypes.STRING(150),
      unique: true,
      allowNull: false,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING(200), allowNull: false },

    role: {
      type: DataTypes.ENUM("cliente", "empleado", "admin", "mesero", "cocinero", "repartidor ", "cajero"),
      allowNull: false,
      defaultValue: "cliente",
    },

    employee_role: {
      type: DataTypes.ENUM("mesero", "cocinero", "repartidor", "cajero"),
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);