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
    usarExtras: false,
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

  const change = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const changeDir = (k, v) =>
    setForm((s) => ({ ...s, direccion: { ...s.direccion, [k]: v } }));
  const changeTel = (k, v) =>
    setForm((s) => ({ ...s, telefono: { ...s.telefono, [k]: v } }));

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
      ...(form.usarExtras ? { direccion: form.direccion } : {}),
      ...(form.usarExtras ? { telefono: form.telefono } : {}),
    };

    setLoading(true);
    try {
      const { data } = await registerClient(payload);
      localStorage.setItem("token", data.token);
      // si usas contexto de auth, aquí podrías setUser(data.user)
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
            <p>Accede a tu historial, reservas y pedidos.</p>
          </div>
        </div>

        {error && <div className="pz-alert">{error}</div>}

        <form className="pz-form" onSubmit={submit}>
          <label>
            Nombre *
            <input value={form.nombre} onChange={(e) => change("nombre", e.target.value)} />
          </label>

          <label>
            Apellido *
            <input value={form.apellido} onChange={(e) => change("apellido", e.target.value)} />
          </label>

          <label>
            Correo electrónico *
            <input
              type="email"
              value={form.correo_electronico}
              onChange={(e) => change("correo_electronico", e.target.value)}
            />
          </label>

          <label>
            Contraseña *
            <input
              type="password"
              value={form.contrasena}
              onChange={(e) => change("contrasena", e.target.value)}
            />
          </label>

          <label>
            Confirmar contraseña *
            <input
              type="password"
              value={form.confirmar}
              onChange={(e) => change("confirmar", e.target.value)}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.usarExtras}
              onChange={(e) => change("usarExtras", e.target.checked)}
            />
            Capturar dirección y teléfono ahora
          </label>

          {form.usarExtras && (
            <>
              <h4>Dirección</h4>
              <label>
                Tipo (Casa/Oficina/Otro)
                <input
                  value={form.direccion.tipo_direccion}
                  onChange={(e) => changeDir("tipo_direccion", e.target.value)}
                />
              </label>
              <label>
                Calle
                <input value={form.direccion.calle} onChange={(e) => changeDir("calle", e.target.value)} />
              </label>
              <label>
                Ciudad
                <input value={form.direccion.ciudad} onChange={(e) => changeDir("ciudad", e.target.value)} />
              </label>
              <label>
                Estado
                <input value={form.direccion.estado} onChange={(e) => changeDir("estado", e.target.value)} />
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
                <input value={form.telefono.numero} onChange={(e) => changeTel("numero", e.target.value)} />
              </label>
              <label>
                Tipo (Movil/Casa/Trabajo)
                <input value={form.telefono.tipo} onChange={(e) => changeTel("tipo", e.target.value)} />
              </label>
            </>
          )}

          <button disabled={loading} className="pz-btn pz-btn-primary pz-btn-block">
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="pz-auth-foot">
          <span>¿Ya tienes cuenta?</span>
          <Link className="pz-link-minor" to="/login">Iniciar sesión</Link>
        </div>
      </div>
    </main>
  );
}
