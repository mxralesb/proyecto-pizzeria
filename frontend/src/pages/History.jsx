import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders";
import { trackOrder } from "../api/tracking";
import s from "./History.module.css";
import "./History.tracking.css";

function money(q) {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    maximumFractionDigits: 2,
  }).format(q);
}

const STATUS_LABEL = {
  pagada: "PAGADA",
  pendiente: "PENDIENTE",
  cancelada: "CANCELADA",
};

const fmtQ = (v) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(v || 0);

function guessOpsOrderNumber(order) {
  if (order.order_number) return order.order_number;
  const n = Number(order.id_order || 0);
  return n ? `ORD-${String(n).padStart(3, "0")}` : "";
}

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [openId, setOpenId] = useState(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [trackMap, setTrackMap] = useState({}); // { [id_order]: trackingData }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await getMyOrders();
        setRows(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleTrack = async (o) => {
    const id = o.id_order;
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);

    // si no he cargado este tracking aún, lo traigo
    if (!trackMap[id]) {
      try {
        setLoadingTrack(true);
        const orderNumber = guessOpsOrderNumber(o);
        if (!orderNumber) throw new Error("No hay número de orden OPS relacionado");
        const { data } = await trackOrder(orderNumber);
        setTrackMap((prev) => ({ ...prev, [id]: data }));
      } catch (e) {
        console.error(e);
        alert(
          "No fue posible obtener el estado del pedido.\n" +
          "Puede que aún no haya sido enviado a cocina."
        );
      } finally {
        setLoadingTrack(false);
      }
    }
  };

  return (
    <div className={`pz-container ${s.wrap}`}>
      <h2 className={s.title}>Historial de compras</h2>

      {loading && <div className={s.skeleton}>Cargando…</div>}
      {err && <p className={s.error}>{err}</p>}

      {!loading && !err && rows.length === 0 && (
        <div className={s.empty}>
          <p>Aún no tienes órdenes. ¡Empieza agregando algo al carrito! 🍕</p>
        </div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className={s.grid}>
          {rows.map((o) => {
            const isOpen = openId === o.id_order;
            const trk = trackMap[o.id_order];

            return (
              <article key={o.id_order} className={`pz-card ${s.card}`}>
                <header className={s.head}>
                  <div className={s.headLeft}>
                    <span className={s.orderTag}>Orden #{o.id_order}</span>
                    <span className={`${s.badge} ${s[o.estado || "pendiente"]}`}>
                      {STATUS_LABEL[o.estado] || o.estado}
                    </span>
                  </div>
                  <div className={s.headRight}>
                    <span className={`${s.badge} ${s.method}`}>{o.metodo_pago}</span>
                  </div>
                </header>

                <ul className={s.items}>
                  {(o.items || []).map((it) => (
                    <li key={it.id_item} className={s.item}>
                      {it.menuItem?.image ? (
                        <img className={s.thumb} src={it.menuItem.image} alt={it.menuItem.name} />
                      ) : (
                        <div className={`${s.thumb} ${s.thumbFallback}`}>🍕</div>
                      )}

                      <div className={s.itemInfo}>
                        <div className={s.itemRow}>
                          <span className={s.qty}>{it.qty} ×</span>
                          <span className={s.name}>{it.name || it.menuItem?.name}</span>
                        </div>
                        <div className={s.prices}>
                          <small className={s.unit}>{money(it.price)} c/u</small>
                          <span className={s.lineTotal}>{money(it.price * it.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className={s.foot}>
                  <div className={s.totals}>
                    <div className={s.totalRow}>
                      <span>Subtotal</span>
                      <strong>{money(o.subtotal)}</strong>
                    </div>
                    <div className={s.totalRowBig}>
                      <span>Total</span>
                      <strong>{money(o.total)}</strong>
                    </div>
                  </div>
                </footer>
                <div className={`trk-panel ${isOpen ? "open" : ""}`}>
                  <div className="trk-inner">
                    {loadingTrack && !trk && <div style={{ color: "#6b7280" }}>Cargando estado…</div>}

                    {trk && (
                      <>
                        <div className="trk-head">
                          <div>
                            <div className="trk-title">
                              {trk.order_number || guessOpsOrderNumber(o)}
                            </div>
                            <div className="trk-sub">{trk.source || "Cliente Online"}</div>
                          </div>
                          <div className={`trk-pill ${trk.status === "DELIVERED" ? "ok" : "wait"}`}>
                            {trk.status === "DELIVERED" ? "Entregado" : "En proceso"}
                          </div>
                        </div>

                        <ol className="timeline">
                          {trk.steps.map((st) => (
                            <li key={st.key} className={`step ${st.done ? "done" : ""}`}>
                              <div className="dot" />
                              <div className="lbl">
                                <div className="t">{st.label}</div>
                                <div className="time">
                                  {st.at ? new Date(st.at).toLocaleString() : "—"}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>

                        <div className="trk-items">
                          <h4>Detalle</h4>
                          <ul className="trk-list">
                            {trk.items.map((it) => (
                              <li key={it.id} className="trk-item">
                                <div className="trk-thumb">
                                  {it.image ? <img src={it.image} alt={it.name} /> : "🍕"}
                                </div>
                                <div className="trk-txt">
                                  <div className="trk-row">
                                    <strong>{it.name}</strong>
                                    <span>x{it.qty}</span>
                                  </div>
                                  <div className="trk-muted">{fmtQ(it.unit_price)}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {(trk.customer?.address || trk.customer?.phone) && (
                          <div className="trk-box">
                            <div><strong>Entrega</strong></div>
                            {trk.customer.address && <div>📍 {trk.customer.address}</div>}
                            {trk.customer.phone && <div>📞 {trk.customer.phone}</div>}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
