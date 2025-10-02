import { z } from "zod";
import { sequelize } from "../../../utils/sequelize.js";
import { OpsOrder } from "../../../models/opsorder.js";
import { OpsOrderItem } from "../../../models/opsorderItem.js";

const CreateOpsSchema = z.object({
  order_number: z.string().min(1),         // ej: "ORD-1234"
  source: z.string().default("POS"),       // "POS" | "WEB" | "PHONE"
  customer: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  ingredients_text: z.string().optional(),
  items: z.array(z.object({
    id_menu_item: z.number().int().optional(),
    name: z.string().optional(),           // si no hay id_menu_item
    qty: z.number().int().positive(),
    unit_price: z.number().nonnegative().optional(),
    note: z.string().optional(),
  })).min(1),
  total: z.number().nonnegative().optional()
});

export async function createOpsOrder(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const payload = CreateOpsSchema.parse(req.body);

    // idempotencia por numero de orden
    const existing = await OpsOrder.findOne({ where: { order_number: payload.order_number }, transaction: t });
    if (existing) {
      await t.commit();
      return res.status(200).json(existing); // ya estaba creada
    }

    // calcula total si no vino
    const computedTotal = payload.items.reduce(
      (acc, it) => acc + (Number(it.unit_price || 0) * Number(it.qty || 1)),
      0
    );

    const o = await OpsOrder.create({
      order_number: payload.order_number,
      source: payload.source || "POS",
      status: "PENDING",
      kitchen_ready_at: null,
      courier_user_id: null,
      courier_name: null,
      courier_status: null,
      customer_name: payload.customer?.name ?? null,
      customer_phone: payload.customer?.phone ?? null,
      customer_address: payload.customer?.address ?? null,
      ingredients_text: payload.ingredients_text ?? null,
      total: payload.total ?? computedTotal,
      delivered_at: null,
    }, { transaction: t });

    await OpsOrderItem.bulkCreate(
      payload.items.map(it => ({
        id_ops_order: o.id_ops_order,
        id_menu_item: it.id_menu_item ?? null,
        name: it.name ?? null,
        qty: it.qty,
        unit_price: it.unit_price ?? null,
        note: it.note ?? null,
      })),
      { transaction: t }
    );

    await t.commit();
    // vuelve con items (para que el tablero la vea completa)
    const full = await OpsOrder.findByPk(o.id_ops_order, { include: [{ model: OpsOrderItem, as: "items" }] });
    return res.status(201).json(full);

  } catch (e) {
    await t.rollback();
    if (e?.issues) return res.status(400).json({ error: "Datos inválidos" });
    next(e);
  }
}
