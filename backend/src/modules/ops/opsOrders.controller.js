// backend/src/modules/ops/opsOrders.controller.js
import { Order, OrderItem, MenuItem } from "../../models/index.js";

export async function createPosOrder(req, res) {
  const t = await Order.sequelize.transaction();
  try {
    const { mesa_id, items } = req.body;
    if (!mesa_id || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const order = await Order.create(
      { source: "pos", status: "preparing", mesa_id },
      { transaction: t }
    );

    for (const it of items) {
      const prod = await MenuItem.findByPk(it.id);
      if (!prod) continue;
      await OrderItem.create(
        {
          id_order: order.id,
          id_menu_item: prod.id,
          qty: it.qty,
          price: prod.price,
        },
        { transaction: t }
      );
    }

    await t.commit();
    res.status(201).json({ ok: true, id: order.id });
  } catch (e) {
    console.error("createPosOrder error:", e);
    await t.rollback();
    res.status(500).json({ error: "No se pudo crear el pedido" });
  }
}
