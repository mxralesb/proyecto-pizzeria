// frontend/src/pages/Recover.jsx
import { useMemo, useState } from "react";
import api from "../api/client";
import s from "./Recover.module.css";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

export default function Recover() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailError = useMemo(() => {
    if (!touched) return "";
    if (!email.trim()) return "Escribe tu correo electrónico";
    if (!isEmail(email)) return "Ingresa un correo válido";
    return "";
  }, [email, touched]);

  const canSubmit = !emailError && !!email;

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setErr("");
    setMsg("");
    if (!canSubmit) return;

    setLoading(true);
    try {
      await api.post("/auth/recover", { email });
      setMsg("Si el correo existe, te enviamos instrucciones para restablecer tu contraseña.");
      setEmail("");
      setTouched(false);
    } catch (e2) {
      setErr(e2?.response?.data?.error || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={s.wrap}>
      <div className={s.card}>
        <div className={s.head}>
          <span className={s.logo} aria-hidden>🍕</span>
          <div>
            <h3 className={s.title}>Recuperar contraseña</h3>
            <p className={s.subtitle}>Ingresa tu correo para recibir una nueva clave</p>
          </div>
        </div>

        {err && <div className={`${s.alert} ${s.alertDanger}`}>{err}</div>}
        {msg && <div className={`${s.alert} ${s.alertSuccess}`}>{msg}</div>}

        <form className={s.form} onSubmit={submit} noValidate>
          <label className={s.field}>
            <span>Correo</span>
            <input
              className={`${s.input} ${emailError ? s.inputErr : ""}`}
              type="email"
              value={email}
              placeholder="tu@correo.com"
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {emailError && <small className={s.errMsg}>{emailError}</small>}
          </label>

          <button className={`${s.btn} ${s.btnPrimary} ${s.btnBlock}`} disabled={loading || !canSubmit}>
            {loading ? "Enviando…" : "Enviar"}
          </button>
        </form>

        <div className={s.foot}>
          <a className={s.linkMinor} href="/login">Iniciar sesión</a>
        </div>
      </div>
    </main>
  );
}
