import { useState } from "react";
import { useAuth } from "../context/authContext";
import { Link } from "react-router-dom";

export default function Login(){
  const { login } = useAuth();
  const [email,setEmail]=useState("ivan@pizzeria.com");
  const [password,setPassword]=useState("IvanAdmin1234");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    setErr(""); setLoading(true);
    try{
      await login(email,password);
      window.location.href="/";
    }catch(e){
      setErr(e.response?.data?.error || "Error al iniciar sesión");
    }finally{ setLoading(false); }
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
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" required/>
          </label>
          <label>
            <span>Contraseña</span>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/>
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
          <Link to="/register" className="pz-link-minor">Registrarse</Link>
        </div>
        </div>
      </div>
    </div>
  );
}
