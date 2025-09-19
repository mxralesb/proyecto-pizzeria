// backend/src/modules/orders/order.controller.js
import {
  sequelize,
  User,
  Cliente,
  Order,
  OrderItem,
  MenuItem,
  InventoryItem,
  OpsOrder,
  OpsOrderItem,
} from "../../models/index.js";

async function getEmailFromReq(req) {
  if (req.user?.email) return req.user.email;
  if (req.user?.id) {
    const u = await User.findByPk(req.user.id);
    return u?.email || null;
  }
  return null;
}

function pad3(n) {
  return String(n).padStart(3, "0");
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

    // Verificar stock
    const idsMenu = items.map((it) => Number(it.id)).filter(Boolean);
    const invRows = await InventoryItem.findAll({
      where: { id_menu_item: idsMenu },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    const invByMenu = new Map(invRows.map((r) => [Number(r.id_menu_item), r]));

    const insuficientes = [];
    for (const it of items) {
      const need = Number(it.qty || 1);
      const inv = invByMenu.get(Number(it.id));
      if (!inv) {
        insuficientes.push({ id: it.id, available: 0 });
      } else if (Number(inv.stock) < need) {
        insuficientes.push({ id: it.id, available: Number(inv.stock) });
      }
    }
    if (insuficientes.length) {
      await t.rollback();
      return res.status(409).json({ error: "Stock insuficiente", detalles: insuficientes });
    }

    // Descontar
    for (const it of items) {
      const inv = invByMenu.get(Number(it.id));
      await inv.update(
        { stock: Number(inv.stock) - Number(it.qty || 1) },
        { transaction: t }
      );
    }

    // Totales
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

    // Orden web
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

    // ------- OPS: crear/reflejar orden para el tablero de cocina y reparto -------
    // Intento por si ya existe (por otra ruta) en los últimos 5 minutos
    let ops = await OpsOrder.findOne({
      where: {
        source: "Cliente Online",
        status: "PENDING",
      },
      order: [["createdAt", "DESC"]],
      transaction: t,
    });

    if (!ops) {
      // Generar un número tipo ORD-XXX sencillo (dev-friendly)
      // (si ya tienes lógica propia para order_number, puedes omitir esto)
      const count = await OpsOrder.count({ transaction: t });
      const orderNumber = `ORD-${pad3(count + 1)}`;

      ops = await OpsOrder.create(
        {
          source: "Cliente Online",
          order_number: orderNumber,
          status: "PENDING",
          customer_name: `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim(),
          customer_phone: null,
          customer_address: null,
          // Si manejas mesa_id para online déjalo null
          mesa_id: null,
          subtotal,
          tax,
          total,
        },
        { transaction: t }
      );

      for (const it of items) {
        await OpsOrderItem.create(
          {
            id_ops_order: ops.id_ops_order,
            id_menu_item: it.id,
            name: it.name || it.title,
            qty: Number(it.qty || 1),
            unit_price: Number(it.price || 0),
          },
          { transaction: t }
        );
      }
    }

    // Guardar VÍNCULO en la orden web
    await order.update(
      {
        ops_order_id: ops.id_ops_order,
        ops_order_number: ops.order_number,
      },
      { transaction: t }
    );

    await t.commit();

    const created = await Order.findByPk(order.id_order, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: MenuItem, as: "menuItem", attributes: ["id", "name", "price", "image"] },
          ],
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
