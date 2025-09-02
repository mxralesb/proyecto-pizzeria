import { Sequelize } from "sequelize";
import { Mesa } from "../../models/mesa.js";
import { Order } from "../../models/order.js";
import { OrderItem } from "../../models/orderItem.js";
import { MenuItem } from "../../models/menuItem.js";
import { sequelize } from "../../models/index.js";

export async function listOccupiedTables(req, res) {
  try {
    const rows = await Mesa.findAll({
      where: { estado: "ocupada" },
      order: [["numero", "ASC"]],
    });

    const out = rows.map((m) => ({
      id: m.id,
      numero: m.numero,
      name: `Mesa #${m.numero ?? m.id}`,
      capacidad: m.capacidad ?? 4,
    }));

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: "No se pudo listar mesas ocupadas" });
  }
}

export async function createPosOrder(req, res) {
  const t = await sequelize.transaction();
  try {
    const { mesa_id, items = [], notes = "" } = req.body;

    if (!mesa_id || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const mesa = await Mesa.findByPk(mesa_id, { transaction: t });
    if (!mesa) {
      await t.rollback();
      return res.status(404).json({ error: "Mesa no encontrada" });
    }

    const ids = items.map((i) => Number(i.id)).filter(Boolean);
    const dbItems = await MenuItem.findAll({
      where: { id: ids },
      transaction: t,
    });

    const map = new Map(dbItems.map((d) => [d.id, d]));
    const norm = items
      .map((i) => {
        const row = map.get(Number(i.id));
        if (!row) return null;
        const qty = Math.max(1, Number(i.qty || 1));
        const price = Number(i.price ?? row.precio ?? row.price ?? 0);
        return {
          id_menu_item: row.id,
          name: row.nombre ?? row.name,
          quantity: qty,
          unit_price: price,
          subtotal: qty * price,
        };
      })
      .filter(Boolean);

    if (norm.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Items inválidos" });
    }

    const subtotal = norm.reduce((acc, it) => acc + it.subtotal, 0);
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const order = await Order.create(
      {
        id_cliente: null,
        source: "pos",
        type: "dine-in",
        status: "recibida",
        mesa_id,
        notes,
        subtotal,
        tax,
        total,
      },
      { transaction: t }
    );

    for (const it of norm) {
      await OrderItem.create(
        {
          id_order: order.id,
          id_menu_item: it.id_menu_item,
          quantity: it.quantity,
          unit_price: it.unit_price,
          subtotal: it.subtotal,
          name_snapshot: it.name ?? null,
        },
        { transaction: t }
      );
    }

    await t.commit();

    res.status(201).json({
      id: order.id,
      mesa_id,
      subtotal,
      tax,
      total,
      status: order.status,
    });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ error: "No se pudo crear la orden" });
  }
}
