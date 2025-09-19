import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../api/client";
import styles from "./POS.module.css";

/** ID especial para Autoservicio (no numérico, nos sirve para diferenciarlo) */
const AUTO_ID = "AUTO";

/** Sanea un valor de mesa y devuelve el id numérico (5, "5", "Mesa #5", etc.) */
const parseMesaId = (val) => {
  if (val == null) return null;
  const m = String(val).trim().match(/\d+/);
  if (!m) return null;
  const n = parseInt(m[0], 10);
  return Number.isFinite(n) ? n : null;
};

export default function POSPage() {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [mesaId, setMesaId] = useState("");
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState("");

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = (type, message) => {
    setToast({ type, message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [tRes, mRes] = await Promise.all([
          api.get("/ops/occupied-tables"),
          api.get("/menu"),
        ]);

        // normalizamos mesas devueltas por backend
        const mesasBack = Array.isArray(tRes.data)
          ? tRes.data.map((t) => {
              const idNum = parseMesaId(t.id);
              return { id: idNum ?? t.id, name: t.name || `Mesa #${idNum ?? t.id}` };
            })
          : [];

        // ✅ Insertamos "Autoservicio" como opción adicional
        const withAuto = [{ id: AUTO_ID, name: "Autoservicio" }, ...mesasBack];

        setTables(withAuto);
        setMenu(mRes.data || []);
      } catch {
        // aun si falla, mostramos Autoservicio
        setTables([{ id: AUTO_ID, name: "Autoservicio" }]);
        setMenu([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const add = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.nombre || item.name,
          price: Number(item.precio ?? item.price ?? 0),
          qty: 1,
        },
      ];
    });
  };

  const dec = (id) => {
    setCart((prev) => {
      const next = prev
        .map((p) => (p.id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0);
      return next;
    });
  };

  const clear = () => setCart([]);

  const totals = useMemo(() => {
    const subtotal = cart.reduce((acc, it) => acc + it.qty * it.price, 0);
    const tax = Number((subtotal * 0.12).toFixed(2));
    const total = Number((subtotal + tax).toFixed(2));
    return { subtotal, tax, total };
  }, [cart]);

  const describeCart = () =>
    cart.length === 0 ? "" : cart.map((c) => `${c.qty}x ${c.name}`).join(", ");

  const sendOrder = async () => {
    if (!mesaId) {
      notify("warning", "Selecciona una mesa o Autoservicio");
      return;
    }
    if (cart.length === 0) {
      notify("warning", "No hay productos");
      return;
    }

    try {
      setLoading(true);

      // ¿Es autoservicio?
      const isAuto = String(mesaId) === AUTO_ID;

      // Para autoservicio NO exigimos id numérico de mesa
      const mesaIdNum = isAuto ? null : parseMesaId(mesaId);
      if (!isAuto && !mesaIdNum) {
        notify("error", "No se pudo identificar la mesa seleccionada");
        setLoading(false);
        return;
      }

      const mesaName = isAuto
        ? "Autoservicio"
        : tables.find(
            (t) => String(t.id) === String(mesaId) || String(t.id) === String(mesaIdNum)
          )?.name || `Mesa #${mesaIdNum}`;

      // ingredientes a partir de los productos del carrito
      const ingredientsText = Array.from(
        new Set(
          cart
            .map((c) => {
              const mi = menu.find((m) => m.id === c.id);
              return mi?.ingredients || mi?.ingredientes || mi?.description;
            })
            .filter(Boolean)
            .map((s) => String(s).trim())
        )
      ).join(" | ");

      const payloadOps = {
        // 👇 Esto controla lo que ve el cocinero en “Proveniencia”
        source: isAuto ? "Autoservicio" : "Mesa de restaurante",
        details_text: `${mesaName} | ${describeCart()}${notes ? ` | Notas: ${notes}` : ""}`,
        ingredients_text: ingredientsText || null,
        items: cart.map((c) => ({
          id_menu_item: c.id,
          qty: c.qty,
          unit_price: c.price,
        })),
        // En autoservicio lo dejamos nulo; en mesa, enviamos el entero
        mesa_id: mesaIdNum,
        notes,
      };

      const { data } = await api.post("/ops/orders", payloadOps);

      clear();
      setNotes("");
      notify("success", `Orden enviada a cocina: ${data.order_number}`);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo crear la orden";
      notify("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pz-container ${styles.wrap}`}>
      {toast && (
        <div className={styles.toastWrap}>
          <div className={`${styles.toast} ${styles[toast.type || "info"]}`}>
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
            <button className={styles.toastClose} onClick={() => setToast(null)}>
              ✕
            </button>
          </div>
        </div>
      )}

      <h2 className="pz-title">POS</h2>

      <div className={styles.headerRow}>
        <label>Número de mesa o Autoservicio</label>
        <select
          className={styles.select}
          value={mesaId}
          onChange={(e) => setMesaId(e.target.value)}
          disabled={loading}
        >
          <option value="">Selecciona...</option>
          {tables.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          className="pz-btn pz-btn-ghost"
          onClick={clear}
          disabled={cart.length === 0 || loading}
        >
          Vaciar
        </button>
      </div>

      <section className={styles.menuCard}>
        <header className={styles.cardHeader}>Menú</header>
        <div className={styles.cardBody}>
          {menu.length === 0 ? (
            <div>No hay productos.</div>
          ) : (
            <div className={styles.grid}>
              {menu.map((it) => (
                <div key={it.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{it.nombre || it.name}</div>
                    <div className={styles.itemPrice}>
                      Q{Number(it.precio ?? it.price ?? 0).toFixed(2)}
                    </div>
                  </div>
                  <button
                    className={styles.btnAdd}
                    onClick={() => add(it)}
                    disabled={loading}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.resumeCard}>
        <header className={styles.cardHeader}>Resumen</header>
        <div className={styles.cardBody}>
          {cart.length === 0 ? (
            <div>Aún no hay productos.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ width: 140 }}>Cantidad</th>
                  <th style={{ width: 120 }}>Precio</th>
                  <th style={{ width: 120 }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      <div className={styles.qtyRow}>
                        <button
                          className={styles.btnTiny}
                          onClick={() => dec(c.id)}
                          disabled={loading}
                        >
                          −
                        </button>
                        <span>{c.qty}</span>
                        <button
                          className={styles.btnTiny}
                          onClick={() =>
                            add({ id: c.id, nombre: c.name, precio: c.price })
                          }
                          disabled={loading}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>Q{c.price.toFixed(2)}</td>
                    <td>Q{(c.price * c.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div style={{ marginTop: 12 }}>
            <label>Notas:</label>
            <textarea
              rows={2}
              className={styles.notesBox}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className={styles.totals}>
            <div>Sub: Q{totals.subtotal.toFixed(2)}</div>
            <div>IVA: Q{totals.tax.toFixed(2)}</div>
            <div>Total: Q{totals.total.toFixed(2)}</div>
          </div>

          <div className={styles.actionsEnd}>
            <button
              className={styles.btnPrimary}
              onClick={sendOrder}
              disabled={loading || cart.length === 0 || !mesaId}
            >
              Enviar a cocina
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
