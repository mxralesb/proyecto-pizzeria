import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerClient } from "../../api/clientes";

export default function RegisterClient() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo_electronico: "",
    contrasena: "",
    confirmar: "",
    direccion: {
      tipo_direccion: "Casa",
      calle: "",
      ciudad: "",
      estado: "",
      codigo_postal: "",
    },
    telefono: {
      numero: "",
      tipo: "Movil",
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // estados para mostrar/ocultar contraseña
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const changeDir = (k, v) =>
    setForm((s) => ({ ...s, direccion: { ...s.direccion, [k]: v } }));
  const changeTel = (k, v) =>
    setForm((s) => ({ ...s, telefono: { ...s.telefono, [k]: v } }));

  const formatPhone = (value) => {
    // eliminar todo lo que no sea dígito
    let digits = value.replace(/\D/g, "");
    // limitar a 8
    digits = digits.slice(0, 8);
    // aplicar formato 1234 5678
    if (digits.length > 4) {
      return digits.slice(0, 4) + " " + digits.slice(4);
    }
    return digits;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre || !form.apellido || !form.correo_electronico || !form.contrasena) {
      setError("Completa los campos requeridos.");
      return;
    }
    if (form.contrasena !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const payload = {
      nombre: form.nombre,
      apellido: form.apellido,
      correo_electronico: form.correo_electronico,
      contrasena: form.contrasena,
      direccion: form.direccion,
      telefono: {
        ...form.telefono,
        numero: form.telefono.numero.replace(/\s/g, ""), // guardar solo números
      },
    };

    setLoading(true);
    try {
      const { data } = await registerClient(payload);
      localStorage.setItem("token", data.token);
      nav("/perfil");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.error || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pz-container pz-auth">
      <div className="pz-card-auth">
        <div className="pz-auth-head">
          <span style={{ fontSize: 24 }}>👤</span>
          <div>
            <h3>Crear cuenta de cliente</h3>
          </div>
        </div>

        {error && <div className="pz-alert">{error}</div>}

        <form className="pz-form" onSubmit={submit}>
          <label>
            Nombre *
            <input
              value={form.nombre}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
                  change("nombre", value);
                }
              }}
            />
          </label>

          <label>
            Apellido *
            <input
              value={form.apellido}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/.test(value)) {
                  change("apellido", value);
                }
              }}
            />
          </label>

          <label>
            Correo electrónico *
            <input
              type="email"
              value={form.correo_electronico}
              onChange={(e) => change("correo_electronico", e.target.value)}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Contraseña *
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.contrasena}
                onChange={(e) => change("contrasena", e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="pz-btn pz-btn-secondary"
                style={{ padding: "4px 8px" }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <label style={{ display: "flex", flexDirection: "column" }}>
            Confirmar contraseña *
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmar}
                onChange={(e) => change("confirmar", e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="pz-btn pz-btn-secondary"
                style={{ padding: "4px 8px" }}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          <h4>Dirección</h4>
          <label>
            Tipo
            <select
              value={form.direccion.tipo_direccion}
              onChange={(e) => changeDir("tipo_direccion", e.target.value)}
            >
              <option value="Casa">Casa</option>
              <option value="Oficina">Oficina</option>
              <option value="Otro">Otro</option>
            </select>
          </label>
          <label>
            Calle
            <input
              value={form.direccion.calle}
              onChange={(e) => changeDir("calle", e.target.value)}
            />
          </label>
          <label>
            Ciudad
            <input
              value={form.direccion.ciudad}
              onChange={(e) => changeDir("ciudad", e.target.value)}
            />
          </label>
          <label>
            Estado
            <input
              value={form.direccion.estado}
              onChange={(e) => changeDir("estado", e.target.value)}
            />
          </label>
          <label>
            Código postal
            <input
              value={form.direccion.codigo_postal}
              onChange={(e) => changeDir("codigo_postal", e.target.value)}
            />
          </label>

          <h4>Teléfono</h4>
          <label>
            Número
            <input
              value={form.telefono.numero}
              onChange={(e) => changeTel("numero", formatPhone(e.target.value))}
            />
          </label>
          <label>
            Tipo
            <select
              value={form.telefono.tipo}
              onChange={(e) => changeTel("tipo", e.target.value)}
            >
              <option value="Movil">Móvil</option>
              <option value="Casa">Casa</option>
              <option value="Trabajo">Trabajo</option>
            </select>
          </label>

          <button disabled={loading} className="pz-btn pz-btn-primary pz-btn-block">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="pz-auth-foot">
          <span>¿Ya tienes cuenta?</span>
          <Link className="pz-link-minor" to="/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}