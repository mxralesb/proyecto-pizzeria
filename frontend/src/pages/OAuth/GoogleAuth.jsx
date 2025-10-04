// src/pages/OAuth/GoogleAuth.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/authContext";

const GOOGLE_SRC = "https://accounts.google.com/gsi/client";

export default function GoogleAuth() {
  const btnRef = useRef(null);
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [err, setErr] = useState("");

  useEffect(() => {
    const exists = document.querySelector(`script[src="${GOOGLE_SRC}"]`);
    if (exists && window.google) {
      renderGoogleButton();
      return;
    }
    const s = document.createElement("script");
    s.src = GOOGLE_SRC;
    s.async = true;
    s.defer = true;
    s.onload = renderGoogleButton;
    s.onerror = () => setErr("No se pudo cargar Google OAuth.");
    document.head.appendChild(s);
    // no cleanup necesario para este script
  }, []);

  const onCredential = async (resp) => {
    try {
      setErr("");
      const idToken = resp?.credential; // <- id_token de Google
      if (!idToken) {
        setErr("No se recibió el token de Google.");
        return;
      }

      // Si quisieras mandar dirección/teléfono opcionales:
      // const extra = { direccion: {...}, telefono: {...} };
      // const { data } = await api.post("/auth/google-cliente", { idToken, ...extra });

      const { data } = await api.post("/auth/google-cliente", { idToken });
      if (!data?.token || !data?.user) {
        setErr("Respuesta inválida del servidor.");
        return;
      }

      setAuth(data.token, data.user); // guarda en contexto + localStorage (según tu implementación)
      navigate("/perfil", { replace: true });
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        "No se pudo autenticar con Google.";
      setErr(msg);
    }
  };

  const renderGoogleButton = () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setErr("Falta VITE_GOOGLE_CLIENT_ID en tu .env del frontend.");
        return;
      }
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onCredential,
        ux_mode: "popup",
        auto_select: false,
      });

      if (btnRef.current) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: 300,
        });
      }

      // opcional: intentamos mostrar One Tap
      try { window.google.accounts.id.prompt(); } catch {}
    } catch (e) {
      console.error(e);
      setErr("No se pudo iniciar Google OAuth.");
    }
  };

  return (
    <main className="pz-container pz-auth" style={{ minHeight: "50vh" }}>
      <div className="pz-card-auth" style={{ textAlign: "center" }}>
        <div className="pz-auth-head" style={{ justifyContent: "center" }}>
          <span style={{ fontSize: 28 }}>🔐</span>
          <div>
            <h3>Acceder con Google</h3>
            <p>Usa tu cuenta de Google para crear tu perfil o iniciar sesión.</p>
          </div>
        </div>

        {err && <div className="pz-alert" style={{ marginBottom: 12 }}>{err}</div>}

        <div ref={btnRef} style={{ display: "grid", placeItems: "center", minHeight: 80 }}>
          {/* El botón se renderiza aquí */}
        </div>

        <p style={{ marginTop: 16, color: "#666" }}>
          Si no tienes cuenta, se creará automáticamente con tu correo de Google.
        </p>
      </div>
    </main>
  );
}
