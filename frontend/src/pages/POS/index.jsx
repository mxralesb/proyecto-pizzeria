import { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import styles from "./POS.module.css";

export default function POSPage() {
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [mesaId, setMesaId] = useState("");
  const [cart, setCart] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [tRes, mRes] = await Promise.all([
          api.get("/ops/occupied-tables"),
          api.get("/menu"),
        ]);
        setTables(tRes.data || []);
        setMenu(mRes.data || []);
      } catch {
        setTables([]);
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

  const sendOrder = async () => {
    if (!mesaId) {
      alert("Selecciona una mesa ocupada");
      return;
    }
    if (cart.length === 0) {
      alert("No hay productos");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        mesa_id: Number(mesaId),
        items: cart.map((c) => ({ id: c.id, qty: c.qty, price: c.price })),
        notes,
      };
      const { data } = await api.post("/ops/orders", payload);
      clear();
      setNotes("");
      alert(`Orden #${data.id} creada`);
    } catch {
      alert("No se pudo crear la orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pz-container ${styles.wrap}`}>
      <h2 className="pz-title">POS</h2>

      <div className={styles.headerRow}>
        <label>Mesa ocupada:</label>
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
        <button className="pz-btn pz-btn-ghost" onClick={clear} disabled={cart.length === 0 || loading}>
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
                    <div className={styles.itemPrice}>Q{Number(it.precio ?? it.price ?? 0).toFixed(2)}</div>
                  </div>
                  <button className={styles.btnAdd} onClick={() => add(it)} disabled={loading}>
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
                        <button className={styles.btnTiny} onClick={() => dec(c.id)} disabled={loading}>
                          −
                        </button>
                        <span>{c.qty}</span>
                        <button
                          className={styles.btnTiny}
                          onClick={() => add({ id: c.id, nombre: c.name, precio: c.price })}
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
