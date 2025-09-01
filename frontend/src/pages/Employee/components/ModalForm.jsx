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

  // ✅ Función de sanitización inline
  const sanitizeInput = (value, type, maxLength, allowSpaces = false) => {
    let clean = value;

    switch (type) {
      case "number":
        clean = clean.replace(/\D/g, ""); // solo números
        break;

      case "letters":
        if (allowSpaces) {
          // permite letras y espacios (para otros_nombres)
          clean = clean.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
          clean = clean.replace(/\s{2,}/g, " "); // quita espacios dobles
        } else {
          // permite solo letras (sin espacios)
          clean = clean.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ]/g, "");
        }
        break;

      case "salary":
        // permitir solo números y punto decimal
        clean = clean.replace(/[^0-9.]/g, "");
        // asegurar máximo un punto decimal
        const parts = clean.split(".");
        if (parts.length > 2) clean = parts[0] + "." + parts[1];
        break;

      case "phone":
        // permitir solo números
        clean = clean.replace(/\D/g, "");
        clean = clean.slice(0, 8);
        // formatear en bloques de 4 dígitos
        if (clean.length > 4) {
          clean = clean.replace(/(\d{4})(\d{0,4})/, "$1 $2");
        }
        break;

      default:
        break;
    }

    if (maxLength && type !== "phone") {
      clean = clean.slice(0, maxLength);
    }

    clean = clean.trim();

    // Capitalización automática para letras
    if (type === "letters") {
      clean = clean
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return clean;
  };

  // ✅ Validaciones finales antes de enviar
  const errors = useMemo(() => {
    const e = {};
    const today = new Date().toISOString().slice(0, 10);

    if (!/^\d{13}$/.test(form.cui)) e.cui = "El CUI debe tener 13 dígitos";
    if (!form.primer_nombre.trim()) e.primer_nombre = "Primer nombre requerido";
    if (!form.primer_apellido.trim()) e.primer_apellido = "Primer apellido requerido";
    if (!/^\d{4}\s\d{4}$/.test(form.telefono)) e.telefono = "Número de teléfono inválido";

    if (!form.fecha_contratacion) {
      e.fecha_contratacion = "Fecha contratación requerida";
    } else if (form.fecha_contratacion > today) {
      e.fecha_contratacion = "La fecha de contratación no puede ser mayor a hoy";
    }

    if (!form.salario || Number(form.salario) < 3723)
      e.salario = "El salario no puede ser menor a Q3723.00";

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
      telefono: form.telefono.replace(/\s/g, ""), // quitar espacio antes de enviar
      telefono_emergencia: form.telefono_emergencia.replace(/\s/g, ""),
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
          {/* CUI */}
          <Field label="CUI*" error={errors.cui}>
            <input
              value={form.cui}
              onChange={(e) => setForm({ ...form, cui: sanitizeInput(e.target.value, "number", 13) })}
            />
          </Field>

          {/* Primer nombre */}
          <Field label="Primer nombre*" error={errors.primer_nombre}>
            <input
              value={form.primer_nombre}
              onChange={(e) => setForm({ ...form, primer_nombre: sanitizeInput(e.target.value, "letters") })}
            />
          </Field>

          {/* Segundo nombre */}
          <Field label="Segundo nombre">
            <input
              value={form.segundo_nombre}
              onChange={(e) => setForm({ ...form, segundo_nombre: sanitizeInput(e.target.value, "letters") })}
            />
          </Field>

          {/* Otros nombres (✅ permite espacios) */}
          <Field label="Otros nombres">
            <input
              value={form.otros_nombres}
              onChange={(e) => setForm({ ...form, otros_nombres: sanitizeInput(e.target.value, "letters", null, true) })}
            />
          </Field>

          {/* Primer apellido */}
          <Field label="Primer apellido*" error={errors.primer_apellido}>
            <input
              value={form.primer_apellido}
              onChange={(e) => setForm({ ...form, primer_apellido: sanitizeInput(e.target.value, "letters") })}
            />
          </Field>

          {/* Segundo apellido */}
          <Field label="Segundo apellido">
            <input
              value={form.segundo_apellido}
              onChange={(e) => setForm({ ...form, segundo_apellido: sanitizeInput(e.target.value, "letters") })}
            />
          </Field>

          {/* Apellido casado */}
          <Field label="Apellido casado">
            <input
              value={form.apellido_casado}
              onChange={(e) => setForm({ ...form, apellido_casado: sanitizeInput(e.target.value, "letters") })}
            />
          </Field>

          {/* Teléfono */}
          <Field label="Teléfono*" error={errors.telefono}>
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: sanitizeInput(e.target.value, "phone") })}
            />
          </Field>

          {/* Tel. emergencia */}
          <Field label="Tel. emergencia">
            <input
              value={form.telefono_emergencia}
              onChange={(e) => setForm({ ...form, telefono_emergencia: sanitizeInput(e.target.value, "phone") })}
            />
          </Field>

          {/* Fecha contratación */}
          <Field label="Fecha contratación*" error={errors.fecha_contratacion}>
            <input
              type="date"
              max={new Date().toISOString().slice(0, 10)} // ✅ bloquea fechas futuras
              value={form.fecha_contratacion}
              onChange={(e) => setForm({ ...form, fecha_contratacion: e.target.value })}
            />
          </Field>

          {/* Salario */}
          <Field label="Salario (Q)*" error={errors.salario}>
            <input
              type="number"
              step="0.01"
              value={form.salario}
              onChange={(e) => setForm({ ...form, salario: sanitizeInput(e.target.value, "salary") })}
            />
          </Field>

          {/* Rol */}
          <Field label="Rol*" error={errors.rol_id}>
            <select
              value={form.rol_id}
              onChange={(e) => setForm({ ...form, rol_id: e.target.value })}
            >
              <option value="">Selecciona…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>

          {/* Activo */}
          <div className={styles.check}>
            <input
              id="activo"
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            <label htmlFor="activo">Activo</label>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={onClose}>Cancelar</button>
          <button
            className={`${styles.btn} ${styles.primary}`}
            disabled={saving || Object.keys(errors).length > 0}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}