import { useEffect, useMemo, useState } from "react";
import {
  myAssignments,
  getAvailability,
  setAvailability,
  setCourierStatus,
} from "../../api/couriers";
import styles from "./Courier.module.css";

const STATUS_ES = {
  PENDING: "Pendiente",
  READY: "Lista",
  DELIVERED: "Entregada",
  CANCELLED: "Cancelada",
};
const COURIER_ES = {
  ASSIGNED: "Asignado",
  ON_ROUTE: "En camino",
  ARRIVED: "Llegué al destino",
  DELIVERED: "Entregado",
};

function tStatus(s) {
  return STATUS_ES[s] || s || "";
}
function tCourier(s) {
  return COURIER_ES[s] || s || "";
}

function OrderCard({ order, onAction, loading }) {
  const id = order.id_ops_order ?? order.id;
  const number =
    order.order_number ||
    order.numero ||
    (id ? `ORD-${String(id).padStart(3, "0")}` : "ORD-—");
  const createdAt = order.createdAt || order.fecha || new Date().toISOString();

  const customer = {
    name: order.customer_name ?? order.cliente?.name ?? "",
    phone: order.customer_phone ?? order.cliente?.phone ?? "",
    address: order.customer_address ?? order.cliente?.address ?? "",
  };

  const paymentMethod = order.payment_method ?? order.pago?.metodo ?? "efectivo";
  const changeDue = order.change_due ?? order.pago?.cambio ?? 0;

  const etaMs = 18 * 60 * 1000;
  const assignedAt =
    (order.assigned_at && new Date(order.assigned_at).getTime()) ||
    (createdAt && new Date(createdAt).getTime()) ||
    Date.now();
  const pct = Math.max(
    0,
    Math.min(100, Math.round(((Date.now() - assignedAt) / etaMs) * 100))
  );

  const nextAction = (() => {
    switch (order.courier_status) {
      case "ASSIGNED":
        return { label: "Recoger (en camino)", status: "ON_ROUTE" };
      case "ON_ROUTE":
        return { label: "Marcar como llegado", status: "ARRIVED" };
      case "ARRIVED":
        return { label: "Entregado", status: "DELIVERED" };
      default:
        return null;
    }
  })();

  return (
    <div className={styles.card}>
      <header className={styles.cardHeader}>
        <div>
          <strong>{number}</strong>
          {order.source && <span className={styles.badge}>{order.source}</span>}
          {order.status && (
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
              {tStatus(order.status)}
            </span>
          )}
          {order.courier_status && (
            <span className={`${styles.badge} ${styles.badgeBlue}`}>
              {tCourier(order.courier_status)}
            </span>
          )}
        </div>
        <div className={styles.when}>
          Creada: {new Date(createdAt).toLocaleString()}
        </div>
      </header>

      <div className={styles.grid}>
        <div>
          <h4>Cliente</h4>
          <div>
            <strong>{customer.name || "—"}</strong>
          </div>
          <div>📞 {customer.phone || "—"}</div>
          <div>📍 {customer.address || "—"}</div>
        </div>

        <div>
          <h4>Pago</h4>
          <div>
            Método: <strong>{paymentMethod}</strong>
          </div>
          {paymentMethod === "efectivo" && (
            <div>
              Cambio: <strong>Q {Number(changeDue).toFixed(2)}</strong>
            </div>
          )}
        </div>

        <div>
          <h4>Detalle</h4>
          <div className={styles.items}>
            {(order.items || []).map((it) => (
              <div
                key={it.id_ops_order_item ?? it.id}
                className={styles.itemRow}
              >
                <span>
                  {it.qty} × {it.menuItem?.name || it.name || `Item ${it.id_menu_item}`}
                </span>
                {it.unit_price != null && (
                  <span>
                    Q {(Number(it.unit_price) * Number(it.qty)).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.progressWrap}>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <small>ETA simulado • progreso {pct}%</small>
      </div>

      <footer className={styles.cardFooter}>
        {nextAction ? (
          <button
            className={styles.btnPrimary}
            onClick={() => onAction(id, nextAction.status)}
            disabled={loading}
          >
            {loading ? "Actualizando..." : nextAction.label}
          </button>
        ) : (
          <span className={styles.muted}>No hay acciones disponibles</span>
        )}
      </footer>
    </div>
  );
}

export default function CourierDashboard() {
  const [loading, setLoading] = useState(false);
  const [savingAvail, setSavingAvail] = useState(false);
  const [orders, setOrders] = useState([]);
  const [available, setAvailable] = useState(false);

  const hasOrders = orders.length > 0;
  const assigned = useMemo(
    () => orders.filter((o) => o.courier_status === "ASSIGNED"),
    [orders]
  );
  const onRoute = useMemo(
    () => orders.filter((o) => o.courier_status === "ON_ROUTE"),
    [orders]
  );
  const arrived = useMemo(
    () => orders.filter((o) => o.courier_status === "ARRIVED"),
    [orders]
  );

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await myAssignments();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const { data } = await getAvailability();
      setAvailable(Boolean(data?.is_available));
    } catch {
      setAvailable(false);
    }
  };

  useEffect(() => {
    loadAvailability();
    loadOrders();
    const id = setInterval(loadOrders, 15000);
    return () => clearInterval(id);
  }, []);

  const toggleAvailability = async () => {
    try {
      setSavingAvail(true);
      const next = !available;
      await setAvailability(next);
      setAvailable(next);
    } catch {
      alert("No se pudo cambiar disponibilidad");
    } finally {
      setSavingAvail(false);
    }
  };

  const doAction = async (orderId, status) => {
    try {
      setLoading(true);
      await setCourierStatus(orderId, status);
      await loadOrders();
      if (status === "DELIVERED") {
        await loadAvailability();
      }
    } catch {
      alert("No se pudo actualizar el estado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pz-container" style={{ paddingTop: 18, paddingBottom: 24 }}>
      <h2 style={{ marginBottom: 12 }}>Repartos</h2>

      <div className={styles.availRow}>
        <span>
          Estado: {available ? <b>Disponible</b> : <b>No disponible</b>}
        </span>
        <button
          className={styles.btnGhost}
          onClick={toggleAvailability}
          disabled={savingAvail}
        >
          {savingAvail
            ? "Guardando..."
            : available
            ? "Ponerme no disponible"
            : "Ponerme disponible"}
        </button>
        <button className={styles.btnGhost} onClick={loadOrders} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {!hasOrders ? (
        <div className="pz-card" style={{ padding: 18 }}>
          <div>No tienes pedidos asignados.</div>
        </div>
      ) : (
        <>
          {assigned.length > 0 && (
            <section className="pz-card" style={{ marginBottom: 14, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>Asignados</h3>
              <div className={styles.list}>
                {assigned.map((o) => (
                  <OrderCard
                    key={o.id_ops_order ?? o.id}
                    order={o}
                    onAction={doAction}
                    loading={loading}
                  />
                ))}
              </div>
            </section>
          )}

          {onRoute.length > 0 && (
            <section className="pz-card" style={{ marginBottom: 14, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>En camino</h3>
              <div className={styles.list}>
                {onRoute.map((o) => (
                  <OrderCard
                    key={o.id_ops_order ?? o.id}
                    order={o}
                    onAction={doAction}
                    loading={loading}
                  />
                ))}
              </div>
            </section>
          )}

          {arrived.length > 0 && (
            <section className="pz-card" style={{ marginBottom: 14, padding: 14 }}>
              <h3 style={{ marginTop: 0 }}>Llegué al destino</h3>
              <div className={styles.list}>
                {arrived.map((o) => (
                  <OrderCard
                    key={o.id_ops_order ?? o.id}
                    order={o}
                    onAction={doAction}
                    loading={loading}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
