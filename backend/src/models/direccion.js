import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Cliente } from "./cliente.js";

export const Direccion = sequelize.define("Direccion", {
  id_direccion: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_cliente: { type: DataTypes.INTEGER, allowNull: false },
  tipo_direccion: { type: DataTypes.ENUM("Casa", "Oficina", "Otro"), allowNull: false },
  calle: { type: DataTypes.STRING(100), allowNull: false },
  ciudad: { type: DataTypes.STRING(50), allowNull: false },
  estado: { type: DataTypes.STRING(50) },
  codigo_postal: { type: DataTypes.STRING(10) },
}, {
  tableName: "direccion",
  timestamps: false,
});

Cliente.hasMany(Direccion, { foreignKey: "id_cliente", onDelete: "CASCADE", as: "direcciones" });
Direccion.belongsTo(Cliente, { foreignKey: "id_cliente" });
