// frontend/src/pages/Auth/RegisterClient.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { registerClient } from "../../api/clientes";
import { googleSignInAndGetIdToken } from "../../services/authGoogle";
import { loginWithGoogleIdTokenCliente } from "../../api/auth";
import s from "./RegisterClient.module.css";

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
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const change = (k, v) => setForm((s0) => ({ ...s0, [k]: v }));
  const changeDir = (k, v) =>
    setForm((s0) => ({ ...s0, direccion: { ...s0.direccion, [k]: v } }));
  const changeTel = (k, v) =>
    setForm((s0) => ({ ...s0, telefono: { ...s0.telefono, [k]: v } }));

  // Solo letras, espacios y acentos
  const handleNameChange = (field, value) => {
    const clean = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    change(field, clean);
  };

  // Teléfono: 8 dígitos con espacio cada 4
  const handlePhoneChange = (value) => {
    let digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    changeTel("numero", formatted);
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
        numero: form.telefono.numero.replace(/\s/g, ""),
      },
    };

    setLoading(true);
    try {
      const { data } = await registerClient(payload);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user ?? { role: "cliente", name: `${form.nombre} ${form.apellido}` }));
      window.location.href = "/perfil";
    } catch (e2) {
      const msg = e2?.response?.data?.error || e2?.response?.data?.message || "No se pudo registrar";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoadingGoogle(true);
    try {
      const { idToken } = await googleSignInAndGetIdToken(); // obtiene idToken via GIS
      const { data } = await loginWithGoogleIdTokenCliente(idToken, {
        direccion: form.direccion,
        telefono: {
          ...form.telefono,
          numero: form.telefono.numero.replace(/\s/g, ""),
        },
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/perfil";
    } catch (e2) {
      const msg =
        e2?.response?.data?.error ||
        e2?.response?.data?.detail ||
        e2?.response?.data?.message ||
        "No se pudo completar el registro con Google";
      setError(msg);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const cardAnim = { initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 } };

  return (
    <main className={s.wrap}>
      <motion.div className={s.card} {...cardAnim} transition={{ duration: 0.25 }}>
        <div className={s.head}>
          <span className={s.avatar} aria-hidden>👤</span>
          <div>
            <h3 className={s.title}>Crear cuenta de cliente</h3>
            <p className={s.subtitle}>Pide más rápido y guarda tus datos de envío</p>
          </div>
        </div>

        {error && (
          <motion.div
            className={s.alert}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

        <button
          type="button"
          className={`${s.btn} ${s.btnGoogle} ${s.btnBlock}`}
          onClick={handleGoogleRegister}
          disabled={loadingGoogle}
        >
          {loadingGoogle ? "Conectando con Google…" : "Crear cuenta con Google"}
        </button>

        <div className={s.divider}><span>o completa el formulario</span></div>

        <form className={s.form} onSubmit={submit}>
          <label className={s.field}>
            <span>Nombre *</span>
            <input
              className={s.input}
              value={form.nombre}
              onChange={(e) => handleNameChange("nombre", e.target.value)}
            />
          </label>

          <label className={s.field}>
            <span>Apellido *</span>
            <input
              className={s.input}
              value={form.apellido}
              onChange={(e) => handleNameChange("apellido", e.target.value)}
            />
          </label>

          <label className={s.field}>
            <span>Correo electrónico *</span>
            <input
              className={s.input}
              type="email"
              value={form.correo_electronico}
              onChange={(e) => change("correo_electronico", e.target.value)}
            />
          </label>

          <label className={s.field}>
            <span>Contraseña *</span>
            <input
              className={s.input}
              type="password"
              value={form.contrasena}
              onChange={(e) => change("contrasena", e.target.value)}
            />
          </label>

          <label className={s.field}>
            <span>Confirmar contraseña *</span>
            <input
              className={s.input}
              type="password"
              value={form.confirmar}
              onChange={(e) => change("confirmar", e.target.value)}
            />
          </label>

          <h4 className={s.section}>Dirección</h4>

          <label className={s.field}>
            <span>Tipo (Casa/Oficina/Otro)</span>
            <input
              className={s.input}
              value={form.direccion.tipo_direccion}
              onChange={(e) => changeDir("tipo_direccion", e.target.value)}
            />
          </label>

          <label className={s.field}>
            <span>Calle</span>
            <input className={s.input} value={form.direccion.calle} onChange={(e) => changeDir("calle", e.target.value)} />
          </label>

          <div className={s.grid3}>
            <label className={s.field}>
              <span>Ciudad</span>
              <input className={s.input} value={form.direccion.ciudad} onChange={(e) => changeDir("ciudad", e.target.value)} />
            </label>
            <label className={s.field}>
              <span>Municipio</span>
              <input className={s.input} value={form.direccion.estado} onChange={(e) => changeDir("estado", e.target.value)} />
            </label>
            <label className={s.field}>
              <span>Código postal</span>
              <input
                className={s.input}
                value={form.direccion.codigo_postal}
                onChange={(e) => changeDir("codigo_postal", e.target.value)}
              />
            </label>
          </div>

          <h4 className={s.section}>Teléfono</h4>

          <div className={s.grid2}>
            <label className={s.field}>
              <span>Número</span>
              <input
                className={s.input}
                value={form.telefono.numero}
                onChange={(e) => handlePhoneChange(e.target.value)}
                inputMode="numeric"
              />
            </label>
            <label className={s.field}>
              <span>Tipo (Movil/Casa/Trabajo)</span>
              <input className={s.input} value={form.telefono.tipo} onChange={(e) => changeTel("tipo", e.target.value)} />
            </label>
          </div>

          <button disabled={loading} className={`${s.btn} ${s.btnPrimary} ${s.btnBlock}`}>
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>

        <div className={s.foot}>
          <span>¿Ya tienes cuenta?</span>
          <Link className={s.linkMinor} to="/login">Iniciar sesión</Link>
        </div>
      </motion.div>
    </main>
  );
}
