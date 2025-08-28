import { useEffect, useState } from "react";
import { getMyOrders } from "../api/orders";
import s from "./History.module.css";

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

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

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
          {rows.map((o) => (
            <article key={o.id_order} className={`pz-card ${s.card}`}>
              <header className={s.head}>
                <div className={s.headLeft}>
                  <span className={s.orderTag}>Orden #{o.id_order}</span>
                  <span className={`${s.badge} ${s[o.estado || "pendiente"]}`}>
                    {STATUS_LABEL[o.estado] || o.estado}
                  </span>
                </div>
                <div className={s.headRight}>
                  <span className={`${s.badge} ${s.method}`}>
                    {o.metodo_pago}
                  </span>
                </div>
              </header>

              <ul className={s.items}>
                {(o.items || []).map((it) => (
                  <li key={it.id_item} className={s.item}>
                    {it.menuItem?.image ? (
                      <img
                        className={s.thumb}
                        src={it.menuItem.image}
                        alt={it.menuItem.name}
                      />
                    ) : (
                      <div className={`${s.thumb} ${s.thumbFallback}`}>🍕</div>
                    )}

                    <div className={s.itemInfo}>
                      <div className={s.itemRow}>
                        <span className={s.qty}>{it.qty} ×</span>
                        <span className={s.name}>
                          {it.name || it.menuItem?.name}
                        </span>
                      </div>
                      <div className={s.prices}>
                        <small className={s.unit}>
                          {money(it.price)} c/u
                        </small>
                        <span className={s.lineTotal}>
                          {money(it.price * it.qty)}
                        </span>
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
