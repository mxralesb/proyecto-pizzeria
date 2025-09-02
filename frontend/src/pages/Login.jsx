import { useState } from "react";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (e) {
      setErr(e?.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const emailErr = err.toLowerCase().includes("correo");
  const passErr = err.toLowerCase().includes("contraseña");

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <div className={styles.logo}>🍕</div>
          <div>
            <h3 className={styles.title}>Bienvenido</h3>
            <p className={styles.subtitle}>Inicia sesión para continuar</p>
          </div>
        </div>

        {err && <div className={styles.alert}>{err}</div>}

        <form onSubmit={submit} className={styles.form}>
          <label className={styles.label}>
            <span>Correo</span>
            <input
              className={`${styles.input} ${emailErr ? styles.inputErr : ""}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoFocus
            />
          </label>

          <label className={styles.label}>
            <span>Contraseña</span>
            <div className={styles.passRow}>
              <input
                className={`${styles.input} ${passErr ? styles.inputErr : ""}`}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          <button className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.foot}>
          <div className={styles.footRow}>
            <span>¿Olvidaste tu contraseña?</span>
            <Link to="/recuperar" className={styles.linkMinor}>Recuperar</Link>
          </div>
          <div className={styles.footRow}>
            <span>¿Aún no tienes cuenta?</span>
            <Link to="/registro" className={styles.linkMinor}>Registrarse</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
