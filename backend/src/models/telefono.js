import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cliente } from "./cliente.js";

export const Telefono = sequelize.define("Telefono", {
  id_telefono: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  numero: { type: DataTypes.STRING(20), allowNull: false },
  tipo: { type: DataTypes.ENUM("Movil", "Casa", "Trabajo"), allowNull: false },
}, {
  tableName: "telefono",
  timestamps: false,
});

Cliente.hasMany(Telefono, { foreignKey: "id_cliente", onDelete: "CASCADE", as: "telefonos" });
Telefono.belongsTo(Cliente, { foreignKey: "id_cliente" });
