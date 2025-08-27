import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { User } from "./user.js";

export const ClienteProfile = sequelize.define("ClienteProfile", {
  id_cliente: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  primer_nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  segundo_nombre: {
    type: DataTypes.STRING
  },
  primer_apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  segundo_apellido: {
    type: DataTypes.STRING
  },
}, {
  tableName: "cliente_profile",
  timestamps: false
});

// Relación 1 a 1
User.hasOne(ClienteProfile, { foreignKey: "user_id" });
ClienteProfile.belongsTo(User, { foreignKey: "user_id" });
