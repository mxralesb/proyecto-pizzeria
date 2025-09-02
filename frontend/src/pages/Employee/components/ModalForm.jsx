import { useEffect, useMemo, useState } from "react";
import api from "../../../api/client";
import styles from "./ModalForm.module.css";

export default function ModalForm({ roles, form, setForm, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const [createAccount, setCreateAccount] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState("empleado");

  const [errors, setErrors] = useState({});

  const onlyLetters = (v) =>
    v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").replace(/\s{2,}/g, " ");

  const onlyPhone = (v) => v.replace(/\D/g, "").slice(0, 8);

  useEffect(() => {
    setErrors({});
  }, [
    form.cui,
    form.primer_nombre,
    form.segundo_nombre,
    form.otros_nombres,
    form.primer_apellido,
    form.segundo_apellido,
    form.apellido_casado,
    form.telefono,
    form.telefono_emergencia,
    form.fecha_contratacion,
    form.salario,
    form.rol_id,
    form.activo,
    createAccount,
    userEmail,
    userPassword,
    userRole,
  ]);

  const val = useMemo(() => {
    const e = {};
    if (!form.primer_nombre?.trim()) e.primer_nombre = "Requerido";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.primer_nombre || "")) e.primer_nombre = "Solo letras";
    if (!form.primer_apellido?.trim()) e.primer_apellido = "Requerido";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.primer_apellido || "")) e.primer_apellido = "Solo letras";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.segundo_nombre || "")) e.segundo_nombre = "Solo letras";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.otros_nombres || "")) e.otros_nombres = "Solo letras";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.segundo_apellido || "")) e.segundo_apellido = "Solo letras";
    if (/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/.test(form.apellido_casado || "")) e.apellido_casado = "Solo letras";

    if (!form.telefono?.trim()) e.telefono = "Requerido";
    if (form.telefono && form.telefono.length !== 8) e.telefono = "8 dígitos";
    if (form.telefono_emergencia && form.telefono_emergencia.length !== 8)
      e.telefono_emergencia = "8 dígitos";

    if (!form.salario || Number(form.salario) < 3723) e.salario = ">= Q3723.00";
    if (!form.rol_id) e.rol_id = "Selecciona un rol";
    if (createAccount) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) e.userEmail = "Correo inválido";
      if (!userPassword || userPassword.length < 6) e.userPassword = "Mínimo 6 caracteres";
      if (!userRole) e.userRole = "Selecciona";
    }
    return e;
  }, [form, createAccount, userEmail, userPassword, userRole]);

  const submit = async (e) => {
    e.preventDefault();
    if (Object.keys(val).length) {
      setErrors(val);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        cui: form.cui || null,
        primer_nombre: form.primer_nombre,
        segundo_nombre: form.segundo_nombre || null,
        otros_nombres: form.otros_nombres || null,
        primer_apellido: form.primer_apellido,
        segundo_apellido: form.segundo_apellido || null,
        apellido_casado: form.apellido_casado || null,
        telefono: form.telefono,
        telefono_emergencia: form.telefono_emergencia || null,
        fecha_contratacion: form.fecha_contratacion,
        salario: Number(form.salario),
        activo: !!form.activo,
        rol_id: Number(form.rol_id),
      };

      if (createAccount) {
        payload.userEmail = userEmail.trim().toLowerCase();
        payload.userPassword = userPassword;
        payload.userRole = userRole;
      }

      await api.post("/employees", payload);
      await onSaved();
    } catch (err) {
      alert("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h3>Nuevo empleado</h3>

        <form onSubmit={submit} className={styles.grid}>
          <label>
            CUI
            <input
              value={form.cui}
              onChange={(e) =>
                setForm((f) => ({ ...f, cui: e.target.value.replace(/\D/g, "").slice(0, 13) }))
              }
              inputMode="numeric"
            />
          </label>

          <label>
            Primer nombre*
            <input
              value={form.primer_nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, primer_nombre: onlyLetters(e.target.value) }))
              }
              className={errors.primer_nombre ? styles.err : ""}
            />
          </label>

          <label>
            Segundo nombre
            <input
              value={form.segundo_nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, segundo_nombre: onlyLetters(e.target.value) }))
              }
              className={errors.segundo_nombre ? styles.err : ""}
            />
          </label>

          <label>
            Otros nombres
            <input
              value={form.otros_nombres}
              onChange={(e) =>
                setForm((f) => ({ ...f, otros_nombres: onlyLetters(e.target.value) }))
              }
              className={errors.otros_nombres ? styles.err : ""}
            />
          </label>

          <label>
            Primer apellido*
            <input
              value={form.primer_apellido}
              onChange={(e) =>
                setForm((f) => ({ ...f, primer_apellido: onlyLetters(e.target.value) }))
              }
              className={errors.primer_apellido ? styles.err : ""}
            />
          </label>

          <label>
            Segundo apellido
            <input
              value={form.segundo_apellido}
              onChange={(e) =>
                setForm((f) => ({ ...f, segundo_apellido: onlyLetters(e.target.value) }))
              }
              className={errors.segundo_apellido ? styles.err : ""}
            />
          </label>

          <label>
            Apellido casado
            <input
              value={form.apellido_casado}
              onChange={(e) =>
                setForm((f) => ({ ...f, apellido_casado: onlyLetters(e.target.value) }))
              }
              className={errors.apellido_casado ? styles.err : ""}
            />
          </label>

          <label>
            Teléfono*
            <input
              value={form.telefono}
              onChange={(e) => setForm((f) => ({ ...f, telefono: onlyPhone(e.target.value) }))}
              className={errors.telefono ? styles.err : ""}
              inputMode="numeric"
              maxLength={8}
            />
          </label>

          <label>
            Tel. emergencia
            <input
              value={form.telefono_emergencia || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, telefono_emergencia: onlyPhone(e.target.value) }))
              }
              className={errors.telefono_emergencia ? styles.err : ""}
              inputMode="numeric"
              maxLength={8}
            />
          </label>

          <label>
            Fecha contratación*
            <input
              type="date"
              value={form.fecha_contratacion}
              onChange={(e) => setForm((f) => ({ ...f, fecha_contratacion: e.target.value }))}
            />
          </label>

          <label>
            Salario (Q)*
            <input
              type="number"
              step="0.01"
              value={form.salario}
              onChange={(e) => setForm((f) => ({ ...f, salario: e.target.value }))}
              className={errors.salario ? styles.err : ""}
            />
          </label>

          <label>
            Rol*
            <select
              value={form.rol_id}
              onChange={(e) => setForm((f) => ({ ...f, rol_id: e.target.value }))}
              className={errors.rol_id ? styles.err : ""}
            >
              <option value="">Selecciona…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.row}>
            <label className={styles.chk}>
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
              />
              Activo
            </label>

            <label className={styles.chk}>
              <input
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
              />
              Crear cuenta de acceso
            </label>
          </div>

          {createAccount && (
            <div className={styles.account}>
              <label>
                Correo*
                <input
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={errors.userEmail ? styles.err : ""}
                />
              </label>

              <label>
                Contraseña*
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className={errors.userPassword ? styles.err : ""}
                />
              </label>

              <label>
                Rol de acceso*
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className={errors.userRole ? styles.err : ""}
                >
                  <option value="empleado">empleado</option>
                  <option value="admin">admin</option>
                </select>
              </label>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.ghost} onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button className={styles.primary} disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
