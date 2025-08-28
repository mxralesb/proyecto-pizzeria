import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js"; // ⬅️ named import

export const User = sequelize.define("User", {
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },
  email: { 
    type: DataTypes.STRING(150), 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING(200), 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM("cliente","empleado","admin"), 
    allowNull: false, 
    defaultValue: "cliente" 
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
}, {
  tableName: "users",
  timestamps: true // Sequelize manejará createdAt/updatedAt automáticamente
});
