// backend/src/modules/orders/tracking.controller.js
import {
  OpsOrder,
  OpsOrderItem,
  MenuItem,
  Order,
} from "../../models/index.js";

function buildStages(ops) {
  const stages = [
    { key: "PLACED",    label: "Recibimos tu pedido",   done: true },
    { key: "READY",     label: "Listo en cocina",       done: false },
    { key: "ON_ROUTE",  label: "En camino",             done: false },
    { key: "ARRIVED",   label: "Llegué al destino",     done: false },
    { key: "DELIVERED", label: "Entregado",             done: false },
  ];
  if (!ops) return { stages, current: 0 };

  if (ops.kitchen_ready_at) stages[1].done = true;
  const cs = ops.courier_status || "";
  if (cs === "ON_ROUTE") { stages[1].done = true; stages[2].done = true; }
  else if (cs === "ARRIVED") { stages[1].done = true; stages[2].done = true; stages[3].done = true; }
  else if (cs === "DELIVERED") { stages.forEach(s => s.done = true); }

  if (ops.status === "DELIVERED") stages.forEach(s => (s.done = true));

  const current = stages.reduce((idx, s, i) => (s.done ? i : idx), 0);
  return { stages, current };
}

async function loadOpsByNumber(orderNumber) {
  return OpsOrder.findOne({
    where: { order_number: orderNumber },
    include: [{
      model: OpsOrderItem,
      as: "items",
      required: false,
      include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","price","image"] }],
    }],
    order: [["createdAt","DESC"]],
  });
}

export async function trackOrder(req, res) {
  try {
    const raw = String(req.params.id || "").trim();
    const id = Number(raw || 0);
    if (!id) return res.status(400).json({ error: "ID inválido" });

    let ops = null;

    // 1) intentar por vínculo en la orden web
    const webOrder = await Order.findByPk(id);
    if (webOrder) {
      if (webOrder.ops_order_number) {
        ops = await loadOpsByNumber(webOrder.ops_order_number);
      } else if (webOrder.ops_order_id) {
        ops = await OpsOrder.findOne({
          where: { id_ops_order: webOrder.ops_order_id },
          include: [{
            model: OpsOrderItem,
            as: "items",
            required: false,
            include: [{ model: MenuItem, as: "menuItem", attributes: ["id","name","price","image"] }],
          }],
        });
      }
    }

    // 2) fallback para órdenes de mesa antiguas: ORD-XXX (XXX = id con padding)
    if (!ops) {
      const orderNumber = `ORD-${String(id).padStart(3, "0")}`;
      ops = await loadOpsByNumber(orderNumber);
    }

    const { stages, current } = buildStages(ops);
    const payload = {
      order_id: id,
      order_number: ops?.order_number || (webOrder?.ops_order_number ?? `ORD-${String(id).padStart(3,"0")}`),
      current_stage: current,
      stages,
      ops_info: ops ? {
        status: ops.status,
        courier_status: ops.courier_status,
        courier_name: ops.courier_name,
        assigned_at: ops.assigned_at,
        picked_up_at: ops.picked_up_at,
        arrived_at: ops.arrived_at,
        delivered_at: ops.delivered_at,
        kitchen_ready_at: ops.kitchen_ready_at,
      } : null,
      items: (ops?.items || []).map(it => ({
        id: it.id_ops_order_item,
        id_menu_item: it.id_menu_item,
        name: it.menuItem?.name || it.name || `Item ${it.id_menu_item}`,
        qty: Number(it.qty || 1),
        unit_price: it.unit_price != null ? Number(it.unit_price) : (it.menuItem?.price ?? null),
        image: it.menuItem?.image || null,
      })),
    };

    return res.json(payload);
  } catch (err) {
    console.error("trackOrder error:", err);
    return res.status(500).json({ error: "No se pudo obtener el tracking" });
  }
}
