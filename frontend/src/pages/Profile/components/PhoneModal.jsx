import { useState } from "react";
import styles from "./PhoneModal.module.css";

export default function PhoneModal({ current, onClose, onSave }) {
  const [form, setForm] = useState({
    numero: current?.numero || "",
    tipo: current?.tipo || "Movil",
  });
  const disabled = !/^\d{8,20}$/.test(form.numero);

  return (
    <div className={styles.modal} onClick={(e)=> e.target===e.currentTarget && onClose()}>
      <form className={styles.card} onSubmit={(e)=>{e.preventDefault(); onSave(form);}}>
        <h3>{current ? "Editar teléfono" : "Nuevo teléfono"}</h3>
        <label>Número</label>
        <input value={form.numero} onChange={(e)=>setForm(f=>({...f,numero:e.target.value}))}/>
        <label>Tipo</label>
        <select value={form.tipo} onChange={(e)=>setForm(f=>({...f,tipo:e.target.value}))}>
          <option>Movil</option><option>Casa</option><option>Trabajo</option>
        </select>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primary} disabled={disabled}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
