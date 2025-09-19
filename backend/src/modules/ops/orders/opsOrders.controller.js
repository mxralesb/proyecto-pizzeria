import { Op } from "sequelize";
import {
  OpsOrder,
  OpsOrderItem,
  MenuItem,
  InventoryItem,
  CourierState,
  User,
} from "../../../models/index.js";

/* --------------------------- helpers internas --------------------------- */

async function nextOrderNumber() {
  const last = await OpsOrder.findOne({
    order: [["createdAt", "DESC"]],
    attributes: ["order_number"],
  });
  const n = last?.order_number?.match(/\d+/)?.[0];
  const next = (n ? parseInt(n, 10) : 0) + 1;
  return `ORD-${String(next).padStart(3, "0")}`;
}

async function checkStock(items = []) {
  const shortages = [];
  for (const it of items || []) {
    if (!it?.id_menu_item || !it?.qty) continue;
    const row = await InventoryItem.findOne({
      where: { id_menu_item: it.id_menu_item },
    });
    if (!row || row.stock < it.qty) {
      shortages.push({
        id_menu_item: it.id_menu_item,
        need: it.qty,
        have: row?.stock ?? 0,
      });
    }
  }
  return { ok: shortages.length === 0, shortages };
}

async function discountStock(items = []) {
  for (const it of items || []) {
    if (!it?.id_menu_item || !it?.qty) continue;
    const row = await InventoryItem.findOne({
      where: { id_menu_item: it.id_menu_item },
    });
    if (row) {
      row.stock = Math.max(0, (row.stock || 0) - it.qty);
      await row.save();
    }
  }
}

async function ensureCourierState(userId) {
  const [row] = await CourierState.findOrCreate({
    where: { user_id: userId },
    defaults: { user_id: userId, is_available: false, current_ops_order_id: null },
  });
  return row;
}

async function assignFirstAvailableCourier(order) {
  const free = await CourierState.findOne({
    where: { is_available: true },
    order: [["updatedAt", "ASC"]],
  });
  if (!free) return { courier: null, state: null };
  const courier = await User.findByPk(free.user_id);
  order.courier_user_id = free.user_id;
  order.courier_name = courier?.name || "Repartidor";
  order.courier_status = "ASSIGNED";
  order.assigned_at = new Date();
  await order.save();
  free.is_available = false;
  free.current_ops_order_id = order.id_ops_order;
  await free.save();
  return { courier, state: free };
}

/** Sanea mesa_id viniendo como 5, "5", "Mesa #5", "mesa 5", etc. */
function parseMesaId(value) {
  if (value == null) return null;
  const m = String(value).trim().match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : null;
}

/* --------------------------------- CRUD -------------------------------- */

export const OpsOrdersController = {
  create: async (req, res) => {
    try {
      const { source, details_text, ingredients_text, items } = req.body;
      if (!source) return res.status(400).json({ error: "source es requerido" });

      // stock
      if (Array.isArray(items) && items.length) {
        const stock = await checkStock(items);
        if (!stock.ok) {
          return res
            .status(409)
            .json({ error: "Stock insuficiente", shortages: stock.shortages });
        }
      }

      // ingredientes (fallback)
      let finalIngredients = ingredients_text;
      if ((!finalIngredients || !String(finalIngredients).trim()) && Array.isArray(items) && items.length) {
        const ids = items.map((i) => i.id_menu_item).filter(Boolean);
        const menuItems = ids.length ? await MenuItem.findAll({ where: { id: ids } }) : [];
        finalIngredients = Array.from(
          new Set(
            menuItems
              .map((m) => m.ingredients || m.ingredientes || m.description)
              .filter(Boolean)
              .map((s) => String(s).trim())
          )
        ).join(" | ");
      }

      const order_number = await nextOrderNumber();

      const {
        customer_name = null,
        customer_phone = null,
        customer_address = null,
        payment_method = null,
        change_due = null,
        mesa_id = null,
      } = req.body || {};

      // ✅ Saneamos mesa_id siempre
      const mesaIdParsed = parseMesaId(mesa_id);

      const order = await OpsOrder.create({
        order_number,
        source,
        details_text: details_text ?? null,
        ingredients_text: finalIngredients || null,
        status: "PENDING",
        customer_name,
        customer_phone,
        customer_address,
        payment_method,
        change_due,
        courier_user_id: null,
        courier_name: null,
        courier_status: null,
        mesa_id: mesaIdParsed, // 👈 aquí ya va entero (o null)
      });

      if (Array.isArray(items) && items.length) {
        await OpsOrderItem.bulkCreate(
          items.map((it) => ({
            id_ops_order: order.id_ops_order,
            id_menu_item: it.id_menu_item,
            qty: Number(it.qty || 1),
            unit_price: it.unit_price ?? null,
            note: it.note ?? null,
          })),
          { validate: true }
        );
        await discountStock(items);
      }

      const created = await OpsOrder.findByPk(order.id_ops_order, {
        include: [{ model: OpsOrderItem, as: "items", include: [{ model: MenuItem, as: "menuItem" }] }],
      });

      res.status(201).json(created);
    } catch (e) {
      console.error("OPS CREATE ERROR:", e);
      res.status(500).json({ error: "Error al crear el pedido operativo" });
    }
  },

  list: async (req, res) => {
    try {
      const { status, source, q } = req.query;
      const where = {};
      if (status) where.status = status;
      if (source) where.source = source;
      if (q) {
        where[Op.or] = [
          { order_number: { [Op.iLike]: `%${q}%` } },
          { details_text: { [Op.iLike]: `%${q}%` } },
          { ingredients_text: { [Op.iLike]: `%${q}%` } },
        ];
      }
      const rows = await OpsOrder.findAll({
        where,
        order: [["createdAt", "DESC"]],
        include: [{ model: OpsOrderItem, as: "items", include: [{ model: MenuItem, as: "menuItem" }] }],
      });
      res.json(rows);
    } catch (e) {
      console.error("OPS LIST ERROR:", e);
      res.status(500).json({ error: "No se pudo listar" });
    }
  },

  ready: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await OpsOrder.findByPk(id);
      if (!order) return res.status(404).json({ error: "No encontrado" });

      order.kitchen_ready_at = new Date();

      let assigned = false;
      if (!order.courier_user_id) {
        const { courier } = await assignFirstAvailableCourier(order);
        assigned = !!courier;
      } else {
        await order.save();
      }

      const reloaded = await OpsOrder.findByPk(order.id_ops_order);
      res.json({ ok: true, assigned, order: reloaded });
    } catch (e) {
      console.error("OPS READY ERROR:", e);
      res.status(500).json({ error: "No se pudo marcar como listo" });
    }
  },

  assignCourier: async (req, res) => {
    try {
      const { id } = req.params;
      const order = await OpsOrder.findByPk(id);
      if (!order) return res.status(404).json({ error: "No encontrado" });
      if (order.courier_user_id) return res.json({ ok: true, alreadyAssigned: true, order });

      const { courier } = await assignFirstAvailableCourier(order);
      const assigned = !!courier;
      const reloaded = await OpsOrder.findByPk(order.id_ops_order);
      res.json({ ok: true, assigned, order: reloaded });
    } catch (e) {
      console.error("OPS ASSIGN ERROR:", e);
      res.status(500).json({ error: "No se pudo asignar repartidor" });
    }
  },

  deliver: async (req, res) => {
    try {
      const { id } = req.params;
      const row = await OpsOrder.findByPk(id);
      if (!row) return res.status(404).json({ error: "No encontrado" });

      row.status = "DELIVERED";
      row.delivered_at = new Date();
      row.courier_status = "DELIVERED";
      await row.save();

      if (row.courier_user_id) {
        const st = await ensureCourierState(row.courier_user_id);
        st.is_available = true;
        st.current_ops_order_id = null;
        await st.save();
      }
      res.json(row);
    } catch (e) {
      console.error("OPS DELIVER ERROR:", e);
      res.status(500).json({ error: "No se pudo marcar entregado" });
    }
  },

  setStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const row = await OpsOrder.findByPk(id);
      if (!row) return res.status(404).json({ error: "No encontrado" });

      const allowed = ["PENDING", "DELIVERED", "CANCELLED"];
      row.status = allowed.includes(status) ? status : row.status;
      await row.save();
      res.json(row);
    } catch (e) {
      console.error("OPS SET STATUS ERROR:", e);
      res.status(500).json({ error: "No se pudo actualizar estado" });
    }
  },

  setCourierStatus: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { status } = req.body;

      const order = await OpsOrder.findByPk(id);
      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
      if (order.courier_user_id !== userId)
        return res.status(403).json({ error: "No eres el repartidor asignado" });

      const allowed = ["ON_ROUTE", "ARRIVED", "DELIVERED"];
      if (!allowed.includes(status)) return res.status(400).json({ error: "Estado inválido" });

      order.courier_status = status;
      if (status === "ON_ROUTE") order.picked_up_at = new Date();
      if (status === "ARRIVED") order.arrived_at = new Date();
      if (status === "DELIVERED") {
        order.delivered_at = new Date();
        order.status = "DELIVERED";
        const st = await ensureCourierState(userId);
        st.is_available = true;
        st.current_ops_order_id = null;
        await st.save();
      }
      await order.save();
      res.json(order);
    } catch (e) {
      console.error("OPS SET COURIER STATUS ERROR:", e);
      res.status(500).json({ error: "No se pudo actualizar estado de repartidor" });
    }
  },
};
