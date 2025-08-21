import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Reservation = sequelize.define(
  "Reservation",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    dpi: { type: DataTypes.STRING(13), allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false }, 
    time: { type: DataTypes.TIME, allowNull: false },     
    people: { type: DataTypes.INTEGER, allowNull: false } 
  },
  { tableName: "reservations", timestamps: true }
);
