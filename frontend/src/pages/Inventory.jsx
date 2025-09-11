import { useEffect, useMemo, useState } from "react";
import styles from "./Inventory.module.css";
import {
  getInventory,
  getAddable,
  createInventory,
  replenishInventory,
  updateInventory,
  removeInventory,
} from "../api/inventory";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className={styles.modalBackdrop} onMouseDown={onClose}>
      <div className={styles.modalCard} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <h4 className={styles.modalTitle}>{title}</h4>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [addable, setAddable] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [modal, setModal] = useState({ open: false, kind: null, row: null });

  const [formAdd, setFormAdd] = useState({ id_menu_item: "", stock: "0", price: "" });
  const [formRepl, setFormRepl] = useState({ amount: "1" });
  const [formUpd, setFormUpd] = useState({ name: "", stock: "", price: "" });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [{ data: inv }, { data: add }] = await Promise.all([getInventory(), getAddable()]);
      setItems(Array.isArray(inv) ? inv : []);
      setAddable(Array.isArray(add) ? add : []);
    } catch {
      setItems([]);
      setAddable([]);
      showToast("No se pudo cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return items.filter((r) => {
      const okText = !qx || (r.name ?? "").toLowerCase().includes(qx);
      const okType = !type || r.type === type;
      return okText && okType;
    });
  }, [items, q, type]);

  const openAdd = () => {
    setFormAdd({ id_menu_item: addable[0]?.id_menu_item ?? "", stock: "0", price: "" });
    setModal({ open: true, kind: "add", row: null });
  };
  const openRepl = (row) => {
    setFormRepl({ amount: "1" });
    setModal({ open: true, kind: "repl", row });
  };
  const openUpd = (row) => {
    setFormUpd({
      name: row.name || "",
      stock: String(row.stock),
      price: row.price == null ? "" : String(row.price)
    });
    setModal({ open: true, kind: "upd", row });
  };
  const openDel = (row) => setModal({ open: true, kind: "del", row });
  const closeModal = () => setModal({ open: false, kind: null, row: null });

  async function submitAdd(e) {
    e.preventDefault();
    if (!formAdd.id_menu_item) return;
    const stock = Number(formAdd.stock);
    if (!Number.isFinite(stock) || stock < 0) return showToast("Stock inicial inválido.");
    const payload = { id_menu_item: Number(formAdd.id_menu_item), stock };
    if (formAdd.price !== "") {
      const price = Number(formAdd.price);
      if (!Number.isFinite(price) || price < 0) return showToast("Precio inválido.");
      payload.price = price;
    }
    try {
      setSaving(true);
      const { data } = await createInventory(payload);
      setItems((xs) => [...xs, data].sort((a, b) => a.id - b.id));
      const { data: add } = await getAddable();
      setAddable(add);
      showToast("Producto agregado.");
      closeModal();
    } catch {
      showToast("No se pudo agregar.");
    } finally {
      setSaving(false);
    }
  }

  async function submitRepl(e) {
    e.preventDefault();
    const amount = Number(formRepl.amount);
    if (!Number.isFinite(amount) || amount <= 0) return showToast("Cantidad inválida.");
    try {
      setSaving(true);
      const { data } = await replenishInventory(modal.row.id, amount);
      setItems((xs) => xs.map((it) => (it.id === data.id ? data : it)));
      showToast("Reabastecido.");
      closeModal();
    } catch {
      showToast("No se pudo reabastecer.");
    } finally {
      setSaving(false);
    }
  }

  async function submitUpd(e) {
    e.preventDefault();
    const payload = {};
    if (formUpd.name.trim() !== "") payload.name = formUpd.name.trim();
    if (formUpd.stock !== "") {
      const stock = Number(formUpd.stock);
      if (!Number.isFinite(stock) || stock < 0) return showToast("Stock inválido.");
      payload.stock = stock;
    }
    if (formUpd.price !== "") {
      const price = Number(formUpd.price);
      if (!Number.isFinite(price) || price < 0) return showToast("Precio inválido.");
      payload.price = price;
    }
    try {
      setSaving(true);
      const { data } = await updateInventory(modal.row.id, payload);
      setItems((xs) => xs.map((it) => (it.id === data.id ? data : it)));
      showToast("Actualizado.");
      closeModal();
    } catch {
      showToast("No se pudo actualizar.");
    } finally {
      setSaving(false);
    }
  }

  async function submitDel(e) {
    e.preventDefault();
    try {
      setSaving(true);
      await removeInventory(modal.row.id);
      setItems((xs) => xs.filter((it) => it.id !== modal.row.id));
      const { data: add } = await getAddable();
      setAddable(add);
      showToast("Eliminado.");
      closeModal();
    } catch {
      showToast("No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={`${styles.container} pz-container`}>
      <div className={styles.header}>
        <h2>Inventario</h2>
        {toast && <div className={styles.toast}>{toast}</div>}
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          placeholder="Buscar por nombre…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className={styles.input} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="pizza">pizza</option>
          <option value="postre">postre</option>
          <option value="bebida">bebida</option>
        </select>
        <button className={styles.primary} onClick={openAdd} disabled={!addable.length}>
          Agregar producto
        </button>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thId}>ID</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th className={styles.thActions}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className={styles.empty}>Cargando…</td></tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id}>
                <td className={styles.mono}>{r.id}</td>
                <td>{r.name}</td>
                <td><span className={`${styles.badge} ${styles[`type-${r.type}`]}`}>{r.type}</span></td>
                <td className={styles.bold}>{r.stock}</td>
                <td>Q {Number(r.price ?? 0).toFixed(2)}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.btn} onClick={() => openRepl(r)}>Reabastecer</button>
                    <button className={styles.btn} onClick={() => openUpd(r)}>Actualizar</button>
                    <button className={styles.danger} onClick={() => openDel(r)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className={styles.empty}>No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal.open && modal.kind === "add"} title="Agregar producto" onClose={closeModal}>
        <form className={styles.form} onSubmit={submitAdd}>
          <label>
            Producto
            <select
              className={styles.input}
              value={formAdd.id_menu_item}
              onChange={(e) => setFormAdd((f) => ({ ...f, id_menu_item: e.target.value }))}
              required
            >
              {addable.map((m) => (
                <option key={m.id_menu_item} value={m.id_menu_item}>
                  {m.name} — {m.category} (Q {Number(m.price).toFixed(2)})
                </option>
              ))}
            </select>
          </label>
          <div className={styles.grid2}>
            <label>
              Stock inicial
              <input
                className={styles.input}
                value={formAdd.stock}
                onChange={(e) => setFormAdd((f) => ({ ...f, stock: e.target.value.replace(/\D/g,"") }))}
                inputMode="numeric"
                required
              />
            </label>
            <label>
              Precio inventario (opcional)
              <input
                className={styles.input}
                value={formAdd.price}
                onChange={(e) => setFormAdd((f) => ({ ...f, price: e.target.value }))}
                placeholder="Usar precio del menú"
                inputMode="decimal"
              />
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.ghost} onClick={closeModal}>Cancelar</button>
            <button className={styles.primary} disabled={saving}>Agregar</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal.open && modal.kind === "repl"} title={`Reabastecer: ${modal.row?.name || ""}`} onClose={closeModal}>
        <form className={styles.form} onSubmit={submitRepl}>
          <label>
            Cantidad a reabastecer
            <input
              className={styles.input}
              value={formRepl.amount}
              onChange={(e) => setFormRepl({ amount: e.target.value.replace(/\D/g,"") })}
              inputMode="numeric"
              required
            />
          </label>
          <div className={styles.modalActions}>
            <button type="button" className={styles.ghost} onClick={closeModal}>Cancelar</button>
            <button className={styles.primary} disabled={saving}>Reabastecer</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal.open && modal.kind === "upd"} title={`Actualizar: ${modal.row?.name || ""}`} onClose={closeModal}>
        <form className={styles.form} onSubmit={submitUpd}>
          <label>
            Nombre
            <input
              className={styles.input}
              value={formUpd.name}
              onChange={(e) => setFormUpd((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nuevo nombre"
            />
          </label>
          <div className={styles.grid2}>
            <label>
              Stock
              <input
                className={styles.input}
                value={formUpd.stock}
                onChange={(e) => setFormUpd((f) => ({ ...f, stock: e.target.value.replace(/\D/g,"") }))}
                inputMode="numeric"
                required
              />
            </label>
            <label>
              Precio inventario (vacío = mantener)
              <input
                className={styles.input}
                value={formUpd.price}
                onChange={(e) => setFormUpd((f) => ({ ...f, price: e.target.value }))}
                inputMode="decimal"
                placeholder="Q..."
              />
            </label>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.ghost} onClick={closeModal}>Cancelar</button>
            <button className={styles.primary} disabled={saving}>Guardar</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal.open && modal.kind === "del"} title="Eliminar producto" onClose={closeModal}>
        <p>¿Seguro que deseas eliminar <strong>{modal.row?.name}</strong> del inventario?</p>
        <div className={styles.modalActions}>
          <button type="button" className={styles.ghost} onClick={closeModal}>Cancelar</button>
          <button className={styles.danger} onClick={submitDel} disabled={saving}>Eliminar</button>
        </div>
      </Modal>
    </main>
  );
}
