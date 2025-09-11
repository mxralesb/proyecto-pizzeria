import { Op } from "sequelize";
import { InventoryItem, MenuItem } from "../../models/index.js";

function mapRow(r) {
  return {
    id: r.id_inventory,
    id_menu_item: r.id_menu_item,
    name: r.menuItem?.name ?? "-",
    type: r.menuItem?.category ?? "",
    stock: Number(r.stock ?? 0),
    price: Number(r.price ?? r.menuItem?.price ?? 0),
    active: !!r.active,
  };
}

export async function listInventory(req, res) {
  try {
    const rows = await InventoryItem.findAll({
      include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","category","price"] }],
      order: [["id_inventory", "ASC"]],
    });
    res.json(rows.map(mapRow));
  } catch (e) {
    console.error("listInventory error:", e);
    res.status(500).json({ error: "No se pudo obtener el inventario" });
  }
}

export async function listAddable(req, res) {
  try {
    const inv = await InventoryItem.findAll({ attributes: ["id_menu_item"] });
    const used = inv.map(i => i.id_menu_item);
    const menu = await MenuItem.findAll({
      where: used.length ? { id: { [Op.notIn]: used } } : {},
      order: [["id","ASC"]],
    });
    res.json(menu.map(m => ({
      id_menu_item: m.id,
      name: m.name,
      category: m.category,
      price: Number(m.price),
    })));
  } catch (e) {
    console.error("listAddable error:", e);
    res.status(500).json({ error: "No se pudo obtener productos para agregar" });
  }
}

export async function createInventory(req, res) {
  try {
    const { id_menu_item, stock = 0, price = null, name } = req.body || {};
    const menuId = Number(id_menu_item);
    const qty = Number(stock);

    if (!menuId) return res.status(400).json({ error: "id_menu_item requerido" });
    if (Number.isNaN(qty) || qty < 0) return res.status(400).json({ error: "Stock inválido" });

    const exists = await InventoryItem.findOne({ where: { id_menu_item: menuId } });
    if (exists) return res.status(409).json({ error: "El producto ya está en inventario" });

    // Traemos el MenuItem para poder sincronizar nombre/precio si se envían
    const menuItem = await MenuItem.findByPk(menuId);
    if (!menuItem) return res.status(404).json({ error: "MenuItem no encontrado" });

    // Si viene nombre, lo aplicamos al MenuItem
    if (typeof name === "string" && name.trim()) {
      menuItem.name = name.trim();
    }
    // Si viene precio en create, también lo aplicamos al MenuItem
    if (price !== null && price !== undefined && String(price) !== "") {
      const p = Number(price);
      if (Number.isNaN(p) || p < 0) return res.status(400).json({ error: "Precio inválido" });
      menuItem.price = p;
    }
    await menuItem.save();

    const created = await InventoryItem.create({
      id_menu_item: menuId,
      stock: qty,
      price: price === null || price === undefined || String(price) === "" ? null : Number(price),
      active: true,
    }, { returning: true });

    const withMenu = await InventoryItem.findByPk(created.id_inventory, {
      include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","category","price"] }],
    });
    res.status(201).json(mapRow(withMenu));
  } catch (e) {
    console.error("createInventory error:", e);
    res.status(500).json({ error: "No se pudo agregar el producto" });
  }
}

export async function replenishInventory(req, res) {
  try {
    const id = Number(req.params.id);
    const amount = Number((req.body?.amount ?? 0));
    if (!id) return res.status(400).json({ error: "ID inválido" });
    if (Number.isNaN(amount) || amount <= 0) return res.status(400).json({ error: "Cantidad inválida" });

    const item = await InventoryItem.findByPk(id);
    if (!item) return res.status(404).json({ error: "Producto no encontrado en inventario" });

    await item.increment("stock", { by: amount });
    await item.reload({ include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","category","price"] }] });
    res.json(mapRow(item));
  } catch (e) {
    console.error("replenishInventory error:", e);
    res.status(500).json({ error: "No se pudo reabastecer" });
  }
}

export async function updateInventory(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    const item = await InventoryItem.findByPk(id, {
      include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","category","price"] }],
    });
    if (!item) return res.status(404).json({ error: "Producto no encontrado en inventario" });

    const data = {};
    if (req.body?.stock !== undefined) {
      const s = Number(req.body.stock);
      if (Number.isNaN(s) || s < 0) return res.status(400).json({ error: "Stock inválido" });
      data.stock = s;
    }
    if (req.body?.price !== undefined && req.body.price !== null && req.body.price !== "") {
      const p = Number(req.body.price);
      if (Number.isNaN(p) || p < 0) return res.status(400).json({ error: "Precio inválido" });
      data.price = p;
    }
    if (req.body?.active !== undefined) data.active = !!req.body.active;

    // Actualizamos InventoryItem si corresponde
    if (Object.keys(data).length) {
      await item.update(data);
    }

    // Sincronizamos cambios con MenuItem cuando se envía `name` o `price`
    let menuTouched = false;
    if (typeof req.body?.name === "string" && req.body.name.trim() && item.menuItem) {
      item.menuItem.name = req.body.name.trim();
      menuTouched = true;
    }
    if (req.body?.price !== undefined && req.body.price !== null && req.body.price !== "" && item.menuItem) {
      const mp = Number(req.body.price);
      if (!Number.isNaN(mp) && mp >= 0) {
        item.menuItem.price = mp;
        menuTouched = true;
      }
    }
    if (menuTouched) await item.menuItem.save();

    await item.reload({ include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","category","price"] }] });
    res.json(mapRow(item));
  } catch (e) {
    console.error("updateInventory error:", e);
    res.status(500).json({ error: "No se pudo actualizar" });
  }
}

export async function deleteInventory(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "ID inválido" });
    const rows = await InventoryItem.destroy({ where: { id_inventory: id } });
    if (!rows) return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ ok: true });
  } catch (e) {
    console.error("deleteInventory error:", e);
    res.status(500).json({ error: "No se pudo eliminar" });
  }
}
