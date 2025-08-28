import { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import Field from "./Field";
import styles from "./ModalForm.module.css";

export default function ModalForm({ roles, form, setForm, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const errors = useMemo(() => {
    const e = {};
    if (!/^\d{13}$/.test(form.cui)) e.cui = "El CUI debe tener 13 dígitos";
    if (!form.primer_nombre.trim()) e.primer_nombre = "Primer nombre requerido";
    if (!form.primer_apellido.trim()) e.primer_apellido = "Primer apellido requerido";
    if (!/^\d{8}$/.test(form.telefono)) e.telefono = "Teléfono inválido (8 dígitos)";
    if (!form.fecha_contratacion) e.fecha_contratacion = "Fecha contratación requerida";
    if (!form.salario || Number(form.salario) <= 0) e.salario = "Salario inválido";
    if (!form.rol_id) e.rol_id = "Selecciona un rol";
    return e;
  }, [form]);

  const submit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;

    const payload = {
      ...form,
      salario: Number(form.salario),
      rol_id: Number(form.rol_id),
    };

    try {
      setSaving(true);
      await api.post("/employees", payload);
      await onSaved();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Error al crear empleado";
      alert(msg);
      console.error(err.response?.data || err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.header}><h3>Nuevo empleado</h3></div>

        <div className={styles.grid}>
          <Field label="CUI*" error={errors.cui}>
            <input value={form.cui} onChange={(e) => setForm({ ...form, cui: e.target.value })} />
          </Field>

          <Field label="Primer nombre*" error={errors.primer_nombre}>
            <input value={form.primer_nombre} onChange={(e) => setForm({ ...form, primer_nombre: e.target.value })} />
          </Field>

          <Field label="Segundo nombre">
            <input value={form.segundo_nombre} onChange={(e) => setForm({ ...form, segundo_nombre: e.target.value })} />
          </Field>

          <Field label="Otros nombres">
            <input value={form.otros_nombres} onChange={(e) => setForm({ ...form, otros_nombres: e.target.value })} />
          </Field>

          <Field label="Primer apellido*" error={errors.primer_apellido}>
            <input value={form.primer_apellido} onChange={(e) => setForm({ ...form, primer_apellido: e.target.value })} />
          </Field>

          <Field label="Segundo apellido">
            <input value={form.segundo_apellido} onChange={(e) => setForm({ ...form, segundo_apellido: e.target.value })} />
          </Field>

          <Field label="Apellido casado">
            <input value={form.apellido_casado} onChange={(e) => setForm({ ...form, apellido_casado: e.target.value })} />
          </Field>

          <Field label="Teléfono*" error={errors.telefono}>
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </Field>

          <Field label="Tel. emergencia">
            <input value={form.telefono_emergencia} onChange={(e) => setForm({ ...form, telefono_emergencia: e.target.value })} />
          </Field>

          <Field label="Fecha contratación*" error={errors.fecha_contratacion}>
            <input type="date" value={form.fecha_contratacion} onChange={(e) => setForm({ ...form, fecha_contratacion: e.target.value })} />
          </Field>

          <Field label="Salario (Q)*" error={errors.salario}>
            <input type="number" step="0.01" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} />
          </Field>

          <Field label="Rol*" error={errors.rol_id}>
            <select value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })}>
              <option value="">Selecciona…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>

          <div className={styles.check}>
            <input id="activo" type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            <label htmlFor="activo">Activo</label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancelar</button>
          <button className={`${styles.btn} ${styles.primary}`} disabled={saving || Object.keys(errors).length > 0}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
