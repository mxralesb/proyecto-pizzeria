import { sequelize } from "../config/database.js";
import "dotenv/config";

import { User } from "./user.js";
import { MenuItem } from "./menuItem.js";
import { Reservation } from "./reservation.js";
import { EmployeeRole } from "./employeeRole.js";
import { Employee } from "./employee.js";
import { Cliente } from "./cliente.js";
import { Direccion } from "./direccion.js";
import { Telefono } from "./telefono.js";
import { Order } from "./order.js";
import { OrderItem } from "./orderItem.js";
import { Mesa } from "./mesa.js";
import { InventoryItem } from "./inventoryItem.js"; 

function linkOnce(model, assocName, fn) {
  const already = model.associations && Object.prototype.hasOwnProperty.call(model.associations, assocName);
  if (!already) fn();
}

linkOnce(Cliente, "direcciones", () => {
  Cliente.hasMany(Direccion, { foreignKey: "id_cliente", as: "direcciones" });
});
linkOnce(Direccion, "cliente", () => {
  Direccion.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
});

linkOnce(Cliente, "telefonos", () => {
  Cliente.hasMany(Telefono, { foreignKey: "id_cliente", as: "telefonos" });
});
linkOnce(Telefono, "cliente", () => {
  Telefono.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
});

linkOnce(Cliente, "orders", () => {
  Cliente.hasMany(Order, { foreignKey: "id_cliente", as: "orders" });
});
linkOnce(Order, "cliente", () => {
  Order.belongsTo(Cliente, { foreignKey: "id_cliente", as: "cliente" });
});

linkOnce(Order, "items", () => {
  Order.hasMany(OrderItem, { foreignKey: "id_order", as: "items" });
});
linkOnce(OrderItem, "order", () => {
  OrderItem.belongsTo(Order, { foreignKey: "id_order", as: "order" });
});

linkOnce(OrderItem, "menuItem", () => {
  OrderItem.belongsTo(MenuItem, { foreignKey: "id_menu_item", as: "menuItem" });
});
linkOnce(MenuItem, "orderItems", () => {
  MenuItem.hasMany(OrderItem, { foreignKey: "id_menu_item", as: "orderItems" });
});

linkOnce(MenuItem, "stock", () => {
  MenuItem.hasOne(InventoryItem, { foreignKey: "id_menu_item", as: "stock" });
});
linkOnce(InventoryItem, "menuItem", () => {
  InventoryItem.belongsTo(MenuItem, { foreignKey: "id_menu_item", as: "menuItem" });
});

export {
  sequelize,
  User,
  MenuItem,
  Reservation,
  EmployeeRole,
  Employee,
  Cliente,
  Direccion,
  Telefono,
  Order,
  OrderItem,
  Mesa,
  InventoryItem, 
};
