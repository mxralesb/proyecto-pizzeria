import { useState } from "react";
import styles from "./AddressModal.module.css";

export default function AddressModal({ current, onClose, onSave }) {
  const [form, setForm] = useState({
    tipo_direccion: current?.tipo_direccion || "Casa",
    calle: current?.calle || "",
    ciudad: current?.ciudad || "",
    estado: current?.estado || "",
    codigo_postal: current?.codigo_postal || "",
  });

  const disabled = !form.calle.trim() || !form.ciudad.trim();

  const submit = (e) => {
    e.preventDefault();
    onSave({
      tipo_direccion: form.tipo_direccion,
      calle: form.calle,
      ciudad: form.ciudad,
      estado: form.estado || null,
      codigo_postal: form.codigo_postal || null,
    });
  };

  return (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.card} onSubmit={submit}>
        <h3>{current ? "Editar dirección" : "Nueva dirección"}</h3>

        <label>Tipo</label>
        <select
          value={form.tipo_direccion}
          onChange={(e) => setForm((f) => ({ ...f, tipo_direccion: e.target.value }))}
        >
          <option>Casa</option>
          <option>Oficina</option>
          <option>Otro</option>
        </select>

        <label>Calle</label>
        <input
          value={form.calle}
          onChange={(e) => setForm((f) => ({ ...f, calle: e.target.value }))}
        />

        <label>Ciudad</label>
        <input
          value={form.ciudad}
          onChange={(e) => setForm((f) => ({ ...f, ciudad: e.target.value }))}
        />

        <label>Estado</label>
        <input
          value={form.estado || ""}
          onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
        />

        <label>Código postal</label>
        <input
          value={form.codigo_postal || ""}
          onChange={(e) => setForm((f) => ({ ...f, codigo_postal: e.target.value }))}
        />

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primary} disabled={disabled}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
