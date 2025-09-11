import { sequelize, User, Cliente, Order, OrderItem, MenuItem, InventoryItem } from "../../models/index.js";

async function getEmailFromReq(req) {
  if (req.user?.email) return req.user.email;
  if (req.user?.id) {
    const u = await User.findByPk(req.user.id);
    return u?.email || null;
  }
  return null;
}

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const email = await getEmailFromReq(req);
    if (!email) {
      await t.rollback();
      return res.status(401).json({ error: "No autenticado" });
    }

    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) {
      await t.rollback();
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    const { items = [], metodo_pago } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "Carrito vacío" });
    }
    if (!["tarjeta", "efectivo"].includes(metodo_pago)) {
      await t.rollback();
      return res.status(400).json({ error: "Método de pago inválido" });
    }

    const idsMenu = items.map((it) => Number(it.id)).filter(Boolean);
    const invRows = await InventoryItem.findAll({ where: { id_menu_item: idsMenu }, transaction: t });
    const invByMenu = new Map(invRows.map((r) => [Number(r.id_menu_item), r]));

    const insuficientes = [];
    for (const it of items) {
      const need = Number(it.qty || 1);
      const inv = invByMenu.get(Number(it.id));
      if (!inv) {
        insuficientes.push({ id: it.id, available: 0 });
      } else if (inv.stock < need) {
        insuficientes.push({ id: it.id, available: inv.stock });
      }
    }

    if (insuficientes.length) {
      await t.rollback();
      return res.status(409).json({ error: "Stock insuficiente", detalles: insuficientes });
    }

    for (const it of items) {
      const inv = invByMenu.get(Number(it.id));
      await inv.update({ stock: inv.stock - Number(it.qty || 1) }, { transaction: t });
    }

    let subtotal = 0;
    for (const it of items) {
      const qty = Number(it.qty || 1);
      const price = Number(it.price || 0);
      subtotal += qty * price;
    }
    subtotal = +subtotal.toFixed(2);
    const tax = +(subtotal * 0.12).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    const estado = metodo_pago === "efectivo" ? "pendiente" : "pagada";

    const order = await Order.create(
      {
        id_cliente: cliente.id_cliente,
        subtotal,
        tax,
        total,
        metodo_pago,
        estado,
      },
      { transaction: t }
    );

    for (const it of items) {
      await OrderItem.create(
        {
          id_order: order.id_order,
          id_menu_item: it.id,
          name: it.name || it.title,
          price: Number(it.price || 0),
          qty: Number(it.qty || 1),
        },
        { transaction: t }
      );
    }

    await t.commit();

    const created = await Order.findByPk(order.id_order, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, as: "menuItem", attributes: ["id", "name", "price", "image"] }],
        },
      ],
    });

    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    console.error("createOrder error:", err);
    res.status(500).json({ error: "Error al crear la orden" });
  }
};

export const listMyOrders = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    if (!email) return res.status(401).json({ error: "No autenticado" });

    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const rows = await Order.findAll({
      where: { id_cliente: cliente.id_cliente },
      order: [["id_order", "DESC"]],
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: MenuItem, as: "menuItem", attributes: ["id", "name", "price", "image"] }],
        },
      ],
    });

    res.json(rows);
  } catch (err) {
    console.error("listMyOrders error:", err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};
