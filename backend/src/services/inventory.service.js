import { sequelize } from "../models/index.js";
import { InventoryItem } from "../models/inventoryItem.js";

export async function listInventory() {
  const rows = await InventoryItem.findAll({ order: [["id","ASC"]] });
  return rows;
}

export async function replenishItem(id, amount) {
  const item = await InventoryItem.findByPk(id);
  if (!item) throw new Error("Not found");
  const add = Math.max(0, Number(amount||0));
  await item.update({ stock: item.stock + add });
  return item;
}

export async function updateItem(id, payload) {
  const item = await InventoryItem.findByPk(id);
  if (!item) throw new Error("Not found");
  const data = {};
  if (payload.name !== undefined) data.name = String(payload.name);
  if (payload.type !== undefined) data.type = String(payload.type);
  if (payload.price !== undefined) data.price = Number(payload.price);
  if (payload.stock !== undefined) data.stock = Math.max(0, parseInt(payload.stock,10));
  if (payload.active !== undefined) data.active = !!payload.active;
  await item.update(data);
  return item;
}

export async function deleteItem(id) {
  await InventoryItem.destroy({ where: { id } });
  return { ok: true };
}

export async function checkAndReserveInventory(tx, items) {
  const ids = items.map(i => i.id);
  const dbItems = await InventoryItem.findAll({ where: { id_menu_item: ids.length ? ids : [-1] }, transaction: tx });
  const byMenu = new Map(dbItems.map(d => [d.id_menu_item, d]));
  const insuff = [];
  for (const it of items) {
    const inv = byMenu.get(it.id) || null;
    const need = Number(it.qty || 1);
    if (!inv) insuff.push({ id: it.id, available: 0 });
    else if (inv.stock < need) insuff.push({ id: it.id, available: inv.stock });
  }
  if (insuff.length) return { ok: false, insuff };
  for (const it of items) {
    const inv = byMenu.get(it.id);
    await inv.update({ stock: inv.stock - Number(it.qty || 1) }, { transaction: tx });
  }
  return { ok: true };
}
