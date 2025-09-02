// frontend/src/components/ops/OrderCard.jsx
export default function OrderCard({ o, role, onStatus, onCash }) {
  const can = () => {
    if (role === "cocinero") return { tomar: o.status === "pendiente", listo: o.status === "en_preparacion" };
    if (role === "mesero" && o.origin === "mesa") return { entregar: o.status === "listo", cobrar: o.status === "listo" };
    if (role === "repartidor" && o.origin === "online")
      return { recoger: o.status === "listo", entregar: o.status === "en_reparto", cobrar: o.status === "en_reparto" };
    if (role === "admin") return { tomar: o.status === "pendiente", listo: o.status === "en_preparacion", entregar: ["listo","en_reparto"].includes(o.status), cobrar: ["listo","en_reparto"].includes(o.status) };
    return {};
  };

  const p = can();

  return (
    <article style={{ background:"#fff", border:"1px solid #eee", borderRadius:8, padding:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <strong>#{o.id} • {o.origin === "mesa" ? `Mesa ${o.table_no}` : "Online"}</strong>
        <small>{new Date(o.createdAt).toLocaleTimeString()}</small>
      </div>
      <ul style={{ margin:"6px 0 8px 18px" }}>
        {o.items.map(it => <li key={it.id}>{it.qty} × {it.name}</li>)}
      </ul>
      <div style={{ fontSize:13, color:"#555" }}>Estado: {o.status} • Total: Q{o.total.toFixed(2)}</div>
      <div style={{ display:"flex", gap:8, marginTop:8, flexWrap:"wrap" }}>
        {p.tomar && <button onClick={() => onStatus(o.id, "en_preparacion")}>Tomar</button>}
        {p.listo && <button onClick={() => onStatus(o.id, "listo")}>Listo</button>}
        {p.recoger && <button onClick={() => onStatus(o.id, "en_reparto")}>Recoger</button>}
        {p.entregar && <button onClick={() => onStatus(o.id, "entregado")}>Entregado</button>}
        {p.cobrar && <button onClick={() => onCash(o.id, o.total)}>Cobrar efectivo</button>}
      </div>
    </article>
  );
}
