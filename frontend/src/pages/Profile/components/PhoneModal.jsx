import { useState } from "react";
import styles from "./PhoneModal.module.css";

export default function PhoneModal({ current, onClose, onSave }) {
  const [form, setForm] = useState({
    numero: current?.numero || "",
    tipo: current?.tipo || "Movil",
  });

  const only8Digits = (v) => v.replace(/\D/g, "").slice(0, 8);

  const disabled = !/^\d{8}$/.test(form.numero);

  const submit = (e) => {
    e.preventDefault();
    onSave({ numero: form.numero, tipo: form.tipo });
  };

  return (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.card} onSubmit={submit}>
        <h3>{current ? "Editar teléfono" : "Nuevo teléfono"}</h3>

        <label>Número</label>
        <input
          inputMode="numeric"
          maxLength={8}
          value={form.numero}
          onChange={(e) => setForm((f) => ({ ...f, numero: only8Digits(e.target.value) }))}
          placeholder="8 dígitos"
        />

        <label>Tipo</label>
        <select
          value={form.tipo}
          onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
        >
          <option>Movil</option>
          <option>Casa</option>
          <option>Trabajo</option>
        </select>

        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primary} disabled={disabled}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
