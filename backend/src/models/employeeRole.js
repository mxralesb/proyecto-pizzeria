import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; 
export const EmployeeRole = sequelize.define(
  "EmployeeRole",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(30), allowNull: false, unique: true },
  },
  { tableName: "roles_empleado", timestamps: false }
);
