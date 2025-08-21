import { useState } from "react";
import api from "../api/client";

export default function Recover(){
  const [email,setEmail]=useState("");
  const [msg,setMsg]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    setErr(""); setMsg(""); setLoading(true);
    try{
      await api.post("/auth/recover",{ email });
      setMsg("Si el correo existe, enviamos una nueva contraseña.");
      setEmail("");
    }catch(e){
      setErr(e.response?.data?.error || "No se pudo procesar la solicitud");
    }finally{ setLoading(false); }
  };

  return (
    <div className="pz-auth">
      <div className="pz-card-auth">
        <div className="pz-auth-head">
          <span className="pz-logo">🍕</span>
          <div>
            <h3>Recuperar contraseña</h3>
            <p>Ingresa tu correo para recibir una nueva clave</p>
          </div>
        </div>

        {err && <div className="pz-alert">{err}</div>}
        {msg && <div className="pz-alert" style={{background:"#ecfdf5",color:"#065f46",borderColor:"#a7f3d0"}}>{msg}</div>}

        <form onSubmit={submit} className="pz-form">
          <label>
            <span>Correo</span>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com" required/>
          </label>
          <button className="pz-btn pz-btn-primary pz-btn-block" disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
