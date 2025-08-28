import { useEffect, useState } from "react";
import { fetchEmployeeRoles, createEmployee } from "../api/employees";
import { useAuth } from "../context/authContext";
import Toast from "../components/Toast";
import Layout from "../components/Layout";  

export default function AddEmployee() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    cui: "",
    primer_nombre: "",
    segundo_nombre: "",
    otros_nombres: "",
    primer_apellido: "",
    segundo_apellido: "",
    apellido_casado: "",
    telefono: "",
    telefono_emergencia: "",
    fecha_contratacion: "",
    salario: "",
    activo: true,
    rol_id: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchEmployeeRoles();
        setRoles(data);
      } catch (e) {
        console.error(e);
        alert("No se pudieron cargar los roles");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.cui || !form.primer_nombre || !form.primer_apellido || !form.telefono || !form.fecha_contratacion || !form.salario || !form.rol_id) {
      alert("Completa los campos obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        salario: Number(form.salario),
        rol_id: Number(form.rol_id),
      };
      await createEmployee(payload);
      alert("Empleado creado ✅");
      setForm({
        cui: "",
        primer_nombre: "",
        segundo_nombre: "",
        otros_nombres: "",
        primer_apellido: "",
        segundo_apellido: "",
        apellido_casado: "",
        telefono: "",
        telefono_emergencia: "",
        fecha_contratacion: "",
        salario: "",
        activo: true,
        rol_id: "",
      });
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || "Error al crear empleado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando…</div>;

  return (
    <Layout>
      <h1>Agregar empleado</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 680 }}>
        <div>
          <label>CUI*</label>
          <input name="cui" value={form.cui} onChange={onChange} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Primer nombre*</label>
            <input name="primer_nombre" value={form.primer_nombre} onChange={onChange} />
          </div>
          <div>
            <label>Segundo nombre</label>
            <input name="segundo_nombre" value={form.segundo_nombre} onChange={onChange} />
          </div>
        </div>

        <div>
          <label>Otros nombres</label>
          <input name="otros_nombres" value={form.otros_nombres} onChange={onChange} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Primer apellido*</label>
            <input name="primer_apellido" value={form.primer_apellido} onChange={onChange} />
          </div>
          <div>
            <label>Segundo apellido</label>
            <input name="segundo_apellido" value={form.segundo_apellido} onChange={onChange} />
          </div>
        </div>

        <div>
          <label>Apellido de casado</label>
          <input name="apellido_casado" value={form.apellido_casado} onChange={onChange} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Teléfono*</label>
            <input name="telefono" value={form.telefono} onChange={onChange} />
          </div>
          <div>
            <label>Teléfono emergencia</label>
            <input name="telefono_emergencia" value={form.telefono_emergencia} onChange={onChange} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Fecha de contratación*</label>
            <input type="date" name="fecha_contratacion" value={form.fecha_contratacion} onChange={onChange} />
          </div>
          <div>
            <label>Salario (Q)*</label>
            <input type="number" step="0.01" name="salario" value={form.salario} onChange={onChange} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Rol*</label>
            <select name="rol_id" value={form.rol_id} onChange={onChange}>
              <option value="">Selecciona…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <label style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
            Activo
          </label>
        </div>

        <button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar empleado"}</button>
      </form>
    </Layout>
  );
}
