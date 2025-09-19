// frontend/src/pages/Charges/index.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import BillingAPI from "../../api/billing";
import { buildInvoicePDF } from "../../utils/invoice";
import PaymentModal from "../../components/PaymentModal";
import styles from "./Charges.module.css";

function getNumeric(v) {
  const m = String(v ?? "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}
function mesaIdSeguro(m) {
  const id =
    m?.id ??
    m?.id_mesa ??
    m?.mesa_id ??
    getNumeric(m?.name ?? m?.nombre ?? "");
  return Number(id || 0);
}
function mesaNombre(m) {
  const id = mesaIdSeguro(m);
  return m?.name ?? m?.nombre ?? (id ? `Mesa #${id}` : "Mesa");
}

export default function ChargesPage() {
  const [loading, setLoading] = useState(false);
  const [mesas, setMesas] = useState([]);
  const [mesaId, setMesaId] = useState("");
  const [tickets, setTickets] = useState([]);
  const [q, setQ] = useState("");

  // modal de pago
  const [showPayModal, setShowPayModal] = useState(false);
  const [ticketToPay, setTicketToPay] = useState(null);

  // ---------- Toast bonito ----------
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };
  // ----------------------------------

  const loadMesas = async () => {
    try {
      const { data } = await api.get("/ops/occupied-tables");
      const arr = Array.isArray(data) ? data : [];
      const norm = arr
        .map((m) => ({ ...m, __safeId: mesaIdSeguro(m) }))
        .filter((m) => m.__safeId);
      setMesas(norm);
      if (norm.length > 0) setMesaId(String(norm[0].__safeId));
    } catch {
      setMesas([]);
      setMesaId("");
    }
  };

  const loadTickets = async () => {
    try {
      const { data } = await BillingAPI.list();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    }
  };

  useEffect(() => {
    loadMesas();
    loadTickets();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tickets;
    return tickets.filter(
      (t) =>
        String(t.mesa_id).includes(s) ||
        String(t.details_text || "").toLowerCase().includes(s)
    );
  }, [tickets, q]);

  const onSubmitCrear = async (e) => {
    e.preventDefault();
    const id = getNumeric(mesaId);
    if (!id) {
      notify("warning", "Selecciona una mesa válida");
      return;
    }
    setLoading(true);
    try {
      const { data } = await BillingAPI.createFromMesa(id);
      await loadTickets();
      notify("success", `Ticket creado para Mesa #${data?.mesa_id ?? id}`);
    } catch (e2) {
      notify("error", e2?.response?.data?.error || "No se pudo crear el ticket");
    } finally {
      setLoading(false);
    }
  };

  const probarPostDirecto = async () => {
    const id = getNumeric(mesaId);
    if (!id) {
      notify("warning", "Selecciona una mesa válida");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/billing/tickets/from-ops", {
        mesa_id: id,
      });
      await loadTickets();
      notify("success", `POST directo OK (Mesa #${data?.mesa_id ?? id})`);
    } catch (e) {
      notify("error", e?.response?.data?.error || "Falló POST directo");
    } finally {
      setLoading(false);
    }
  };

  const cobrar = (t) => {
    setTicketToPay(t);
    setShowPayModal(true);
  };

  const Card = ({ t }) => (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,.08)" }}
    >
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Mesa #{t.mesa_id}</div>
          <div className={styles.muted}>{t.details_text || "—"}</div>
        </div>
        <div className={styles.badge}>Q{Number(t.total).toFixed(2)}</div>
      </div>

      <div className={styles.tableWrap}>
        <table className="pz-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {(t.items || []).map((i) => (
              <tr key={i.id_bill_item || `${i.name}-${i.qty}`}>
                <td>{i.name}</td>
                <td style={{ textAlign: "right" }}>{i.qty}</td>
                <td style={{ textAlign: "right" }}>
                  Q{Number(i.unit_price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.totals}>
        <div>
          Sub: <strong>Q{Number(t.subtotal).toFixed(2)}</strong>
        </div>
        <div>
          IVA: <strong>Q{Number(t.tax).toFixed(2)}</strong>
        </div>
        <div>
          Total: <strong>Q{Number(t.total).toFixed(2)}</strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnGhost} onClick={() => buildInvoicePDF(t)}>
          Descargar factura
        </button>
        <button
          className={styles.btnPrimary}
          onClick={() => cobrar(t)}
          disabled={loading}
        >
          Cobrar
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="pz-container" style={{ padding: "24px 0" }}>
      {/* Toast */}
      {toast && (
        <div className={styles.toastWrap}>
          <motion.div
            className={`${styles.toast} ${styles[toast.type || "info"]}`}
            initial={{ y: -10, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <span className={styles.toastIcon}>
              {toast.type === "success"
                ? "✅"
                : toast.type === "error"
                ? "❌"
                : toast.type === "warning"
                ? "⚠️"
                : "ℹ️"}
            </span>
            <span className={styles.toastMsg}>{toast.message}</span>
            <button
              className={styles.toastClose}
              onClick={() => setToast(null)}
              aria-label="Cerrar notificación"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}

      <h2 className="pz-title">Cobros</h2>

      <div className={styles.toolbar}>
        <input
          className="pz-input"
          placeholder="Buscar ticket..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          disabled={loading}
        />
        <button className={styles.btn} onClick={loadTickets} disabled={loading}>
          Actualizar
        </button>
      </div>

      <form onSubmit={onSubmitCrear} className={styles.formRow}>
        <div className={styles.formCol}>
          <label>Mesa ocupada</label>
          <select
            className="pz-input"
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
          >
            {mesas.length === 0 && <option value="">No hay mesas</option>}
            {mesas.map((m, idx) => {
              const id = m.__safeId;
              const name = mesaNombre(m);
              return (
                <option key={`mesa-${id || idx}`} value={String(id)}>
                  {name}
                </option>
              );
            })}
          </select>
          <small className={styles.muted}>
            Se generará el ticket desde la última orden de esta mesa.
          </small>
        </div>

        <button
          type="submit"
          className={`${styles.btnPrimary}`}
          disabled={loading || !getNumeric(mesaId)}
          style={{ height: 38 }}
        >
          Crear ticket
        </button>

        <button
          type="button"
          className={styles.btnGhost}
          onClick={probarPostDirecto}
          disabled={loading || !getNumeric(mesaId)}
          style={{ height: 38 }}
        >
          Probar POST
        </button>
      </form>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No hay tickets pendientes.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((t) => (
            <Card key={t.id_bill} t={t} />
          ))}
        </div>
      )}

      <PaymentModal
        open={showPayModal}
        total={ticketToPay?.total || 0}
        onClose={() => {
          setShowPayModal(false);
          setTicketToPay(null);
        }}
        onConfirm={async (recibido) => {
          setShowPayModal(false);
          setLoading(true);
          try {
            const { data } = await BillingAPI.pay(ticketToPay.id_bill, {
              payment_method: "EFECTIVO",
              amount_received: Number(recibido),
            });
            await loadTickets();
            buildInvoicePDF(data);
            notify("success", `💸 Cobro registrado — Mesa #${ticketToPay.mesa_id}`);
          } catch (e) {
            notify("error", e?.response?.data?.error || "No se pudo cobrar");
          } finally {
            setLoading(false);
            setTicketToPay(null);
          }
        }}
      />
    </div>
  );
}
