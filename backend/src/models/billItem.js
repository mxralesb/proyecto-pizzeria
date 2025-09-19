import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class BillItem extends Model {}
BillItem.init(
  {
    id_bill_item: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    id_bill: { type: DataTypes.INTEGER, allowNull: false },
    id_menu_item: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  },
  { sequelize, modelName: "BillItem", tableName: "bill_items", timestamps: false }
);
