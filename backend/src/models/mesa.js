import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Mesa = sequelize.define(
  "Mesa",
  {
    id_mesa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    estado: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "libre",
      validate: { isIn: [["libre", "ocupada", "limpieza", "reservada"]] },
    },
    ocupada_hasta: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "mesas",
    timestamps: true,
    underscored: true,
  }
);