// frontend/src/pages/ops/Dashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { opsApi } from "../../api/ops";
import OrderCard from "../../components/ops/OrderCard";

export default function OpsDashboard() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const { data } = await opsApi.board(); setRows(data); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onStatus = async (id, status) => { await opsApi.setStatus(id, status); await load(); };
  const onCash = async (id, total) => {
    const v = window.prompt(`Total Q${total}. Efectivo recibido:`, `${total}`);
    if (v == null) return;
    const { data } = await opsApi.cashClose(id, Number(v || 0));
    alert(`Cambio: Q${Number(data.change || 0).toFixed(2)}`);
    await load();
  };

  return (
    <div className="pz-container">
      <h2>Pedidos (Ops)</h2>
      {loading && <p>Cargando…</p>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:16 }}>
        {rows.map(o => (
          <OrderCard key={o.id} o={o} role={role} onStatus={onStatus} onCash={onCash} />
        ))}
      </div>
    </div>
  );
}
