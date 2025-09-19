import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

export class Bill extends Model {}
Bill.init(
  {
    id_bill: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ops_order_id: { type: DataTypes.INTEGER, allowNull: false },
    mesa_id: { type: DataTypes.INTEGER, allowNull: false },
    details_text: { type: DataTypes.TEXT },
    notes: { type: DataTypes.TEXT },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: "pending" },
    payment_method: { type: DataTypes.STRING },
    amount_received: { type: DataTypes.DECIMAL(10, 2) },
    change_given: { type: DataTypes.DECIMAL(10, 2) },
    customer_name: { type: DataTypes.STRING },
    nit: { type: DataTypes.STRING },
    invoice_number: { type: DataTypes.STRING },
    paid_at: { type: DataTypes.DATE },
  },
  { sequelize, modelName: "Bill", tableName: "bills", timestamps: true }
);
