import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; 
import { EmployeeRole } from "./employeeRole.js";   

export const Employee = sequelize.define(
  "Employee",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cui: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    primer_nombre: { type: DataTypes.STRING(50), allowNull: false },
    segundo_nombre: { type: DataTypes.STRING(50) },
    otros_nombres: { type: DataTypes.STRING(100) },
    primer_apellido: { type: DataTypes.STRING(50), allowNull: false },
    segundo_apellido: { type: DataTypes.STRING(50) },
    apellido_casado: { type: DataTypes.STRING(50) },
    telefono: { type: DataTypes.STRING(20), allowNull: false },
    telefono_emergencia: { type: DataTypes.STRING(20) },
    fecha_contratacion: { type: DataTypes.DATEONLY, allowNull: false },
    salario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: "empleados", timestamps: false }
);

Employee.belongsTo(EmployeeRole, { foreignKey: "rol_id", as: "rol" });
EmployeeRole.hasMany(Employee, { foreignKey: "rol_id", as: "empleados" });
