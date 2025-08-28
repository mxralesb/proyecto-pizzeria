import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // ⬅️ named import

export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("cliente", "admin"),
      allowNull: false,
      defaultValue: "cliente",
    },
    branch: { type: DataTypes.STRING },
  },
  { tableName: "users", freezeTableName: false }
);
