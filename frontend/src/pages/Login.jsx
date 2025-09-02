import { useState } from "react";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

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
      setErr(e.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pz-auth">
      <div className="pz-card-auth">
        <div className="pz-auth-head">
          <span className="pz-logo"></span>
          <div>
            <h3>Bienvenido</h3>
            <p>Inicia sesión para continuar</p>
          </div>
        </div>

        {err && <div className="pz-alert">{err}</div>}

        <form onSubmit={submit} className="pz-form">
          <label>
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              style={{ borderColor: err.includes("Correo") ? "red" : undefined }}
            />
          </label>

          <label>
            <span>Contraseña</span>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ flex: 1, borderColor: err.includes("Contraseña") ? "red" : undefined }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ marginLeft: 6 }}
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>
          </label>

          <button className="pz-btn pz-btn-primary pz-btn-block" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="pz-auth-foot">
          <div>
            <span>¿Olvidaste tu contraseña?</span>
            <Link to="/recuperar" className="pz-link-minor">Recuperar</Link>
          </div>
          <div>
            <span>¿Aún no tienes cuenta?</span>
            <Link to="/registro" className="pz-link-minor">Registrarse</Link>
          </div>
        </div>
      </div>
    </div>
  );
}