import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

export default function Employee() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [msg, setMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

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
    fecha_nacimiento: "",
    fecha_contratacion: new Date().toISOString().split("T")[0],
    salario: "",
    rol_id: "",
  });

  const errors = useMemo(() => {
    const e = {};
    if (!/^\d{13}$/.test(form.cui)) e.cui = "El CUI debe tener 13 dígitos";
    if (!form.primer_nombre.trim()) e.primer_nombre = "Primer nombre requerido";
    if (!form.primer_apellido.trim()) e.primer_apellido = "Primer apellido requerido";
    if (!/^\d{8}$/.test(form.telefono)) e.telefono = "Teléfono inválido (8 dígitos)";
    if (!form.fecha_nacimiento) e.fecha_nacimiento = "Fecha de nacimiento requerida";
    if (!form.fecha_contratacion) e.fecha_contratacion = "Fecha contratación requerida";
    if (!form.salario || parseFloat(form.salario) <= 0) e.salario = "Salario inválido";
    if (!form.rol_id) e.rol_id = "Selecciona un rol";
    return e;
  }, [form]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/employees");
      setEmployees(res.data);
    })();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setShowForm(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    await api.post("/employees", form);
    setMsg("Empleado creado");
    setTimeout(() => setMsg(""), 2000);

    const res = await api.get("/employees");
    setEmployees(res.data);

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
      fecha_nacimiento: "",
      fecha_contratacion: new Date().toISOString().split("T")[0],
      salario: "",
      rol_id: "",
    });

    setShowForm(false);
  };

  const filtered = employees
    .filter((e) => {
      const q = search.toLowerCase();
      const matches =
        e.primer_nombre.toLowerCase().includes(q) ||
        e.primer_apellido.toLowerCase().includes(q) ||
        e.cui.includes(search);

      const roleOk = roleFilter ? e.rol_id === parseInt(roleFilter, 10) : true;
      const statusOk =
        statusFilter === ""
          ? true
          : statusFilter === "activos"
          ? e.activo
          : !e.activo;

      return matches && roleOk && statusOk;
    })
    .sort((a, b) => {
      if (sortFilter === "az") return a.primer_nombre.localeCompare(b.primer_nombre);
      if (sortFilter === "za") return b.primer_nombre.localeCompare(a.primer_nombre);
      if (sortFilter === "mayor") return b.salario - a.salario;
      if (sortFilter === "menor") return a.salario - b.salario;
      return 0;
    });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "15px" }}>Empleados</h2>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <input style={{ padding: "8px", flex: "1" }} type="text" placeholder="Buscar por nombre o CUI..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ padding: "8px" }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="1">Cocinero</option>
          <option value="2">Cajero</option>
          <option value="3">Repartidor</option>
          <option value="4">Mesero</option>
        </select>
        <select style={{ padding: "8px" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
        <select style={{ padding: "8px" }} value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
          <option value="">Ordenar</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="mayor">Mayor salario</option>
          <option value="menor">Menor salario</option>
        </select>
        <button style={{ padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={() => setShowForm(true)}>+ Crear</button>
      </div>

      {/* Tabla */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>CUI</th>
            <th style={th}>Primer Nombre</th>
            <th style={th}>Segundo Nombre</th>
            <th style={th}>Otros Nombres</th>
            <th style={th}>Primer Apellido</th>
            <th style={th}>Segundo Apellido</th>
            <th style={th}>Apellido Casado</th>
            <th style={th}>Teléfono</th>
            <th style={th}>Tel. Emergencia</th>
            <th style={th}>Fecha Nacimiento</th>
            <th style={th}>Fecha Contratación</th>
            <th style={th}>Salario</th>
            <th style={th}>Rol</th>
            <th style={th}>Activo</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id}>
              <td style={td}>{e.cui}</td>
              <td style={td}>{e.primer_nombre}</td>
              <td style={td}>{e.segundo_nombre}</td>
              <td style={td}>{e.otros_nombres}</td>
              <td style={td}>{e.primer_apellido}</td>
              <td style={td}>{e.segundo_apellido}</td>
              <td style={td}>{e.apellido_casado}</td>
              <td style={td}>{e.telefono}</td>
              <td style={td}>{e.telefono_emergencia}</td>
              <td style={td}>{e.fecha_nacimiento}</td>
              <td style={td}>{e.fecha_contratacion}</td>
              <td style={td}>Q{e.salario}</td>
              <td style={td}>{e.rol_id}</td>
              <td style={td}>{e.activo ? "Sí" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulario flotante */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <form onSubmit={submit} style={{ background: "white", padding: "20px", borderRadius: "8px", width: "450px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
            <h3 style={{ marginBottom: "15px" }}>Nuevo empleado</h3>
            
            {Object.keys(form).map((field) => (
              <div key={field} style={{ marginBottom: "10px" }}>
                <label style={{ display: "block", fontSize: "14px", marginBottom: "5px" }}>
                  {field.replaceAll("_", " ")}
                </label>
                {field === "rol_id" ? (
                  <select value={form.rol_id} onChange={(e)=>setForm({...form,rol_id:e.target.value})} style={{ width:"100%", padding:"8px", border:"1px solid #ccc", borderRadius:"4px" }}>
                    <option value="">Selecciona un rol</option>
                    <option value="1">Cocinero</option>
                    <option value="2">Cajero</option>
                    <option value="3">Repartidor</option>
                    <option value="4">Mesero</option>
                  </select>
                ) : (
                  <input
                    type={field.includes("fecha") ? "date" : field==="salario" ? "number" : "text"}
                    step={field==="salario"?"0.01":undefined}
                    value={form[field]}
                    onChange={(e)=>setForm({...form,[field]:e.target.value})}
                    style={{ width: "100%", padding: "8px", border: errors[field]?"1px solid red":"1px solid #ccc", borderRadius: "4px" }}
                  />
                )}
                {errors[field] && <div style={{ color: "red", fontSize: "12px" }}>{errors[field]}</div>}
              </div>
            ))}
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px", background: "white", cursor: "pointer" }}>Cancelar</button>
              <button disabled={Object.keys(errors).length > 0} style={{ padding: "8px 12px", background: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Guardar</button>
            </div>
          </form>
        </div>
      )}

      {msg && <div style={{ marginTop:"10px", padding:"10px", background:"#d4edda", color:"#155724", borderRadius:"5px" }}>{msg}</div>}
    </div>
  );
}

const th = { padding: "10px", border: "1px solid #ddd" };
const td = { padding: "8px", border: "1px solid #ddd" };