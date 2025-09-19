import { Op } from "sequelize";
import {
  sequelize,
  OpsOrder,
  OpsOrderItem,
  MenuItem,
  Bill,
  BillItem,
} from "../../models/index.js";

function getMenuItemName(mi) {
  return mi?.name ?? null;
}
function getMenuItemPrice(mi) {
  const raw = mi?.price ?? null;
  return raw == null ? null : Number(raw);
}

export async function occupiedTables(_req, res) {
  try {
    const rows = await OpsOrder.findAll({
      attributes: ["mesa_id"],
      where: { mesa_id: { [Op.ne]: null } },
      group: ["mesa_id"],
      order: [["mesa_id", "ASC"]],
    });
    const data = (rows || [])
      .map((r) => Number(r.mesa_id))
      .filter((n) => !!n)
      .map((id) => ({ id, name: `Mesa #${id}` }));
    return res.json(data);
  } catch (err) {
    console.error("BILLING occupiedTables error:", err);
    return res.status(500).json({ error: "No se pudo listar mesas ocupadas" });
  }
}

export async function summaryToday(_req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bills = await Bill.findAll({
      where: { createdAt: { [Op.gte]: today } },
      include: [{ model: BillItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    const cnt = bills.length;
    const sub = bills.reduce((acc, b) => acc + Number(b.subtotal || 0), 0);
    const tax = bills.reduce((acc, b) => acc + Number(b.tax || 0), 0);
    const tot = bills.reduce((acc, b) => acc + Number(b.total || 0), 0);
    res.json({
      tickets: cnt,
      subtotal: Number(sub.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(tot.toFixed(2)),
    });
  } catch (err) {
    console.error("BILLING summaryToday error:", err);
    res.status(500).json({ error: "No se pudo calcular el resumen" });
  }
}

export async function createTicketFromOps(req, res) {
  try {
    const mesaId = Number(req.body?.mesa_id || req.query?.mesa_id || 0);
    if (!mesaId) {
      return res.status(400).json({ error: "mesa_id es requerido" });
    }

    const order = await OpsOrder.findOne({
      where: { mesa_id: mesaId },
      order: [
        ["createdAt", "DESC"],
        ["id_ops_order", "DESC"],
      ],
      include: [
        {
          model: OpsOrderItem,
          as: "items",
          required: false,
          include: [
            {
              model: MenuItem,
              as: "menuItem",
              attributes: ["id", "name", "price"],
              required: false,
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "No hay orden de cocina para esa mesa" });
    }

    let subtotal = 0;
    const itemsPayload = [];

    for (const it of order.items || []) {
      const qty = Number(it.qty || 1);
      const mi = it.menuItem || null;
      const id_menu_item = it.id_menu_item || mi?.id || null;
      if (!id_menu_item) continue;
      const name = getMenuItemName(mi) ?? "Producto";
      const unit_price =
        it.unit_price != null ? Number(it.unit_price) : getMenuItemPrice(mi) ?? 0;
      subtotal += qty * unit_price;
      itemsPayload.push({
        id_menu_item,
        name,
        qty,
        unit_price,
      });
    }

    if (itemsPayload.length === 0) {
      return res.status(409).json({ error: "La última orden no tiene ítems válidos para facturar" });
    }

    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));

    const bill = await Bill.create({
      ops_order_id: order.id_ops_order,
      mesa_id: order.mesa_id ?? mesaId,
      details_text: order.details_text ?? null,
      subtotal,
      tax,
      total,
      status: "pending",
    });

    await BillItem.bulkCreate(
      itemsPayload.map((x) => ({
        id_bill: bill.id_bill,
        id_menu_item: x.id_menu_item,
        name: x.name,
        qty: x.qty,
        unit_price: x.unit_price,
      }))
    );

    const created = await Bill.findByPk(bill.id_bill, {
      include: [{ model: BillItem, as: "items" }],
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error("BILLING createFromOps error:", err);
    return res.status(500).json({ error: "No se pudo crear el ticket" });
  }
}

export async function listTickets(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;
    const rows = await Bill.findAll({
      where,
      include: [{ model: BillItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    return res.json(rows);
  } catch (err) {
    console.error("BILLING listTickets error:", err);
    return res.status(500).json({ error: "No se pudo listar tickets" });
  }
}

export async function payTicket(req, res) {
  try {
    const id = Number(req.params.id || 0);
    if (!id) return res.status(400).json({ error: "id inválido" });

    const bill = await Bill.findByPk(id);
    if (!bill) return res.status(404).json({ error: "Ticket no encontrado" });

    const { payment_method = null, amount_received = null } = req.body || {};

    bill.payment_method = payment_method;
    bill.amount_received = amount_received;

    const total = Number(bill.total || 0);
    const recibido = amount_received != null ? Number(amount_received) : 0;
    const change = recibido - total;

    bill.change_given = Number((change || 0).toFixed(2));
    bill.status = "PAID";
    bill.paid_at = new Date();

    await bill.save();

    const updated = await Bill.findByPk(bill.id_bill, {
      include: [{ model: BillItem, as: "items" }],
    });
    return res.json(updated);
  } catch (err) {
    console.error("BILLING payTicket error:", err);
    return res.status(500).json({ error: "No se pudo pagar el ticket" });
  }
}

export async function debugLastOps(req, res) {
  try {
    const mesaId = Number(req.query?.mesa_id || 0);
    if (!mesaId) return res.status(400).json({ error: "mesa_id es requerido" });

    const order = await OpsOrder.findOne({
      where: { mesa_id: mesaId },
      order: [
        ["createdAt", "DESC"],
        ["id_ops_order", "DESC"],
      ],
      include: [{ model: OpsOrderItem, as: "items", required: false }],
    });

    if (!order) return res.json({ found: false });

    return res.json({
      found: true,
      id_ops_order: order.id_ops_order,
      createdAt: order.createdAt,
      itemsCount: (order.items || []).length,
      mesa_id: order.mesa_id,
      source: order.source,
    });
  } catch (e) {
    console.error("debugLastOps error:", e);
    return res.status(500).json({ error: "debug error" });
  }
}
