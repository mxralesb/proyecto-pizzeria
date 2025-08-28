import { useState } from "react";
import styles from "./EditProfileModal.module.css";

export default function EditProfileModal({ me, onClose, onSave }) {
  const [form, setForm] = useState({ nombre: me.nombre, apellido: me.apellido, contrasena: "" });
  const disabled = !form.nombre.trim() || !form.apellido.trim();

  return (
    <div className={styles.modal} onClick={(e)=> e.target===e.currentTarget && onClose()}>
      <form className={styles.card} onSubmit={(e)=>{e.preventDefault(); onSave({ ...form, contrasena: form.contrasena || undefined });}}>
        <h3>Editar perfil</h3>
        <label>Nombre</label>
        <input value={form.nombre} onChange={(e)=>setForm(f=>({...f,nombre:e.target.value}))}/>
        <label>Apellido</label>
        <input value={form.apellido} onChange={(e)=>setForm(f=>({...f,apellido:e.target.value}))}/>
        <label>Nueva contraseña (opcional)</label>
        <input type="password" value={form.contrasena} onChange={(e)=>setForm(f=>({...f,contrasena:e.target.value}))}/>
        <div className={styles.actions}>
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className={styles.primary} disabled={disabled}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
