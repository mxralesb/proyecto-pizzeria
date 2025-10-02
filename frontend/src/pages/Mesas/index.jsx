import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/authContext";

function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "4px 8px",
        marginRight: 8,
        background: "#fff",
        fontSize: 13,
      }}
    >
      {children}
    </span>
  );
}

const API_BASE = (import.meta.env.VITE_API_URL || window.__API_URL__ || "").replace(/\/$/, "");
const api = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`; // espera path con /api/...

export default function MesasDashboard() {
  const { user } = useAuth();
  const token = user?.token || localStorage.getItem("token") || "";

  const [data, setData] = useState({
    total: 0,
    libres: [],
    ocupadas: [],
    limpieza: [],
    reservadas: [],
    mesas: [],
  });
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState("");
  const [now, setNow] = useState(Date.now());
  const syncingRef = useRef(false);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const load = useCallback(async () => {
    if (!token) { setErr("Sesión no válida. Vuelve a iniciar sesión."); return; }
    setLoading(true);
    setErr("");
    try {
      const r = await fetch(api("/api/mesas"), { headers: { ...authHeader } });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      setData({
        total: j?.total || 0,
        libres: j?.libres || [],
        ocupadas: j?.ocupadas || [],
        limpieza: j?.limpieza || [],
        reservadas: j?.reservadas || [],
        mesas: j?.mesas || [],
      });
      setNow(Date.now());
    } catch (e) {
      console.error(e);
      setErr("No se pudo cargar el estado de mesas.");
    } finally {
      setLoading(false);
    }
  }, [authHeader, token]);

  useEffect(() => { load(); }, [load]);

  // Reloj + sync cada 30s con bloqueo anti solape
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    const sync = setInterval(() => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        load().finally(() => (syncingRef.current = false));
      }
    }, 30000);
    return () => { clearInterval(t); clearInterval(sync); };
  }, [load]);

  // Si alguna mesa expira su temporizador, sincroniza
  useEffect(() => {
    const needsSync = (data.mesas || []).some((m) => {
      if (!m.ocupada_hasta) return false;
      const left = new Date(m.ocupada_hasta).getTime() - now;
      return (m.estado === "ocupada" || m.estado === "limpieza") && left <= 0;
    });
    if (needsSync && !syncingRef.current) {
      syncingRef.current = true;
      load().finally(() => (syncingRef.current = false));
    }
  }, [now, data.mesas, load]);

  const stats = useMemo(() => ({
    total: data.total || 0,
    libres: data.libres?.length || 0,
    ocupadas: data.ocupadas?.length || 0,
    limpieza: data.limpieza?.length || 0,
    reservadas: data.reservadas?.length || 0,
  }), [data]);

  const post = useCallback(async (path, body) => {
    if (!token) throw new Error("Sesión no válida");
    const r = await fetch(api(`/api/mesas${path}`), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const x = await r.json().catch(() => ({}));
      throw new Error(x?.error || `Error ${r.status}`);
    }
    return r.json();
  }, [authHeader, token]);

  const onOcupar = async (id_mesa) => {
    try {
      setPosting(true);
      await post("/occupy", { id_mesa, minutos: 60 });
      await load();
    } catch (e) {
      alert(e.message);
    } finally { setPosting(false); }
  };

  const onLiberar = async (id_mesa) => {
    try {
      setPosting(true);
      await post("/free", { id_mesa });
      await load();
    } catch (e) {
      alert(e.message);
    } finally { setPosting(false); }
  };

  const onLiberarTrasLimpieza = async (id_mesa) => {
    try {
      setPosting(true);
      await post("/release-after-clean", { id_mesa });
      await load();
    } catch (e) {
      alert(e.message);
    } finally { setPosting(false); }
  };

  return (
    <div className="pz-container" style={{ paddingTop: 18, paddingBottom: 24 }}>
      <h2>Mesas</h2>

      <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: 10, marginBottom: 14 }}>
        <Badge>Total: {stats.total}</Badge>
        <Badge>Libres: {stats.libres}</Badge>
        <Badge>Ocupadas: {stats.ocupadas}</Badge>
        <Badge>Limpieza: {stats.limpieza}</Badge>
        <Badge>Reservadas: {stats.reservadas}</Badge>
        <button className="pz-btn pz-btn-outline" style={{ marginLeft: 8 }} onClick={load} disabled={loading || posting}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {err && <div className="pz-alert">{err}</div>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {(data.mesas || []).map((m) => {
          const until = m.ocupada_hasta ? new Date(m.ocupada_hasta).getTime() : null;
          const leftMs = until ? until - now : 0;
          const leftMin = until ? Math.max(0, Math.floor(leftMs / 60000)) : 0;
          const leftSec = until ? Math.max(0, Math.floor((leftMs % 60000) / 1000)) : 0;

          const bg =
            m.estado === "libre" ? "#f6fff6" :
            m.estado === "ocupada" ? "#fff6f6" :
            m.estado === "limpieza" ? "#fffaf0" : "#f0f6ff";

          return (
            <div
              key={m.id_mesa}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
                background: bg,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <strong>Mesa #{m.numero}</strong>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Cap: {m.capacidad}</span>
              </div>

              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    borderRadius: 12,
                    padding: "2px 8px",
                    background: "#fff",
                    border: "1px solid #eee",
                    fontSize: 12,
                  }}
                >
                  {m.estado.toUpperCase()}
                </span>
              </div>

              {m.estado === "ocupada" && (
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  Termina en: {leftMin}m {leftSec}s
                </div>
              )}
              {m.estado === "limpieza" && (
                <div style={{ fontSize: 12, marginBottom: 8 }}>
                  Limpieza: {leftMin}m {leftSec}s
                </div>
              )}

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {m.estado === "libre" && (
                  <button className="pz-btn pz-btn-primary" onClick={() => onOcupar(m.id_mesa)} disabled={posting}>
                    Ocupar
                  </button>
                )}
                {m.estado === "ocupada" && (
                  <button className="pz-btn pz-btn-outline" onClick={() => onLiberar(m.id_mesa)} disabled={posting}>
                    Liberar
                  </button>
                )}
                {m.estado === "limpieza" && (
                  <button className="pz-btn pz-btn-outline" onClick={() => onLiberarTrasLimpieza(m.id_mesa)} disabled={posting}>
                    Marcar limpia
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
