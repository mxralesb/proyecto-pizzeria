import { useEffect, useMemo, useState } from "react";
import {
  listOpsOrders,
  markReady,
  assignCourier,
  deliverOpsOrder,
} from "../../api/opsOrders";
import { useAuth } from "../../context/authContext";

const STATUS_ES = { PENDING: "Pendiente", READY: "Lista", DELIVERED: "Entregada", CANCELLED: "Cancelada" };
const COURIER_ES = { ASSIGNED: "Asignado", ON_ROUTE: "En camino", ARRIVED: "Llegué al destino", DELIVERED: "Entregado" };
const tStatus = (s) => STATUS_ES[s] || s || "";
const tCourier = (s) => COURIER_ES[s] || s || "";
const money = (n) => `Q ${Number(n || 0).toFixed(2)}`;

function RoleBadge({ text }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        background: "#eef2ff",
        color: "#3730a3",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
}

function ActionButton({ children, onClick, tone = "primary", disabled }) {
  const colors =
    tone === "ghost"
      ? { bg: "#f3f4f6", color: "#111827" }
      : tone === "danger"
      ? { bg: "#fee2e2", color: "#991b1b" }
      : { bg: "#e0f2fe", color: "#075985" };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        background: disabled ? "#e5e7eb" : colors.bg,
        color: disabled ? "#6b7280" : colors.color,
        fontWeight: 600,
        border: "1px solid rgba(0,0,0,0.06)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ItemsList({ items = [] }) {
  if (!items.length) return <span>—</span>;
  return (
    <ul style={{ margin: "0", padding: "0 0 0 16px", lineHeight: 1.25 }}>
      {items.map((it) => {
        const id = it.id_ops_order_item ?? `${it.id_menu_item}-${it.note ?? ""}`;
        const name = it.menuItem?.name || it.name || `Item ${it.id_menu_item}`;
        const qty = Number(it.qty || 1);
        const rowTotal = it.unit_price != null ? qty * Number(it.unit_price || 0) : null;
        return (
          <li key={id} style={{ margin: "3px 0" }}>
            {qty} × {name}
            {rowTotal != null && (
              <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 12 }}>{money(rowTotal)}</span>
            )}
            {it.note && (
              <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 12 }}>({it.note})</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function IngredientChips({ text }) {
  const parts = String(text || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parts.length) return <span>—</span>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {parts.map((p, i) => (
        <span
          key={`${p}-${i}`}
          style={{
            padding: "2px 8px",
            borderRadius: 999,
            background: "#f3f4f6",
            color: "#374151",
            fontSize: 12,
            lineHeight: 1.4,
            border: "1px solid #e5e7eb",
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

export default function OrdersOpsBoard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const role = String(user?.role ?? user?.payload?.role ?? user?.data?.role ?? "").toLowerCase();
  const empRole = String(
    user?.employee_role ?? user?.payload?.employee_role ?? user?.data?.employee_role ?? ""
  ).toLowerCase();

  const isAdmin = role === "admin";
  const isCook = empRole === "cocinero" || isAdmin;
  const canDeliver = isAdmin || empRole === "repartidor" || empRole === "mesero";

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await listOpsOrders();
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const pending = useMemo(
    () => rows.filter((r) => r.status === "PENDING" && !r.kitchen_ready_at),
    [rows]
  );
  const ready = useMemo(
    () => rows.filter((r) => r.status === "PENDING" && !!r.kitchen_ready_at),
    [rows]
  );
  const delivered = useMemo(
    () => rows.filter((r) => r.status === "DELIVERED"),
    [rows]
  );

  const doReady = async (id) => {
    try {
      await markReady(id);
      await load();
    } catch {
      alert("No se pudo marcar como listo.");
    }
  };

  const doAssign = async (id) => {
    try {
      await assignCourier(id);
      await load();
    } catch {
      alert("No se pudo asignar un repartidor.");
    }
  };

  const doDeliver = async (id) => {
    try {
      await deliverOpsOrder(id);
      await load();
    } catch {
      alert("No se pudo marcar como entregada.");
    }
  };

  const Card = ({ title, children }) => (
    <section className="pz-card" style={{ marginBottom: 16, borderRadius: 12, padding: 10 }}>
      <div style={{ fontWeight: 800, margin: "4px 6px 8px" }}>{title}</div>
      {children}
    </section>
  );

  const Table = ({ head, children }) => (
    <div className="pz-table">
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {head.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: "left",
                  fontSize: 12,
                  color: "#6b7280",
                  fontWeight: 700,
                  padding: "8px 10px",
                  borderBottom: "1px solid #eef2f7",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );

  return (
    <main className="pz-container" style={{ paddingTop: 18, paddingBottom: 24 }}>
      <h2 style={{ marginBottom: 12 }}>
        Gestión de Órdenes (OPS) {!loading && <RoleBadge text="Actualizado" />}
      </h2>

      <Card title="Órdenes Pendientes">
        <Table head={["Número", "Proveniencia", "Detalles", "Ingredientes", "Fecha", "Acciones"]}>
          {pending.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                No hay pendientes.
              </td>
            </tr>
          ) : (
            pending.map((o) => (
              <tr key={o.id_ops_order} style={{ verticalAlign: "top" }}>
                <td style={{ padding: 10 }}>{o.order_number}</td>
                <td style={{ padding: 10 }}>{o.source}</td>
                <td style={{ padding: 10 }}>
                  <ItemsList items={o.items || []} />
                </td>
                <td style={{ padding: 10 }}>
                  <IngredientChips text={o.ingredients_text} />
                </td>
                <td style={{ padding: 10 }}>{new Date(o.createdAt).toLocaleString()}</td>
                <td style={{ padding: 10 }}>
                  {isCook ? (
                    <ActionButton onClick={() => doReady(o.id_ops_order)}>Listo</ActionButton>
                  ) : (
                    <span style={{ color: "#6b7280" }}>—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Card title="Órdenes por recoger">
        <Table head={["Número", "Proveniencia", "Repartidor", "Estado repartidor", "Cliente", "Acciones"]}>
          {ready.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 12, color: "#6b7280" }}>
                No hay órdenes listas por recoger.
              </td>
            </tr>
          ) : (
            ready.map((o) => (
              <tr key={o.id_ops_order} style={{ verticalAlign: "top" }}>
                <td style={{ padding: 10 }}>{o.order_number}</td>
                <td style={{ padding: 10 }}>{o.source}</td>
                <td style={{ padding: 10 }}>
                  {o.courier_name || (o.courier_user_id ? `#${o.courier_user_id}` : "—")}
                </td>
                <td style={{ padding: 10 }}>
                  {o.courier_status ? <RoleBadge text={tCourier(o.courier_status)} /> : "—"}
                </td>
                <td style={{ padding: 10 }}>
                  {o.customer_name ? (
                    <div style={{ display: "grid", gap: 2 }}>
                      <strong>{o.customer_name}</strong>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{o.customer_phone || "s/tel"}</span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{o.customer_address || "s/dirección"}</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td style={{ padding: 10, display: "flex", gap: 8 }}>
                  {isCook && !o.courier_user_id && (
                    <ActionButton onClick={() => doAssign(o.id_ops_order)}>Asignar</ActionButton>
                  )}
                  {canDeliver && (
                    <ActionButton tone="primary" onClick={() => doDeliver(o.id_ops_order)}>
                      Entregada
                    </ActionButton>
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <Card title="Órdenes Entregadas">
        <Table head={["Número", "Proveniencia", "Detalles", "Repartidor", "Fecha Entrega"]}>
          {delivered.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: 12, color: "#6b7280" }}>
                Aún no hay entregadas.
              </td>
            </tr>
          ) : (
            delivered.map((o) => (
              <tr key={o.id_ops_order} style={{ verticalAlign: "top" }}>
                <td style={{ padding: 10 }}>{o.order_number}</td>
                <td style={{ padding: 10 }}>{o.source}</td>
                <td style={{ padding: 10 }}>
                  <ItemsList items={o.items || []} />
                </td>
                <td style={{ padding: 10 }}>{o.courier_name || "—"}</td>
                <td style={{ padding: 10 }}>
                  {o.delivered_at ? new Date(o.delivered_at).toLocaleString() : "—"}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </main>
  );
}
