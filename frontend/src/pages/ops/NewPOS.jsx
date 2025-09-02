// frontend/src/pages/ops/NewPOS.jsx
import { useEffect, useState } from "react";
import { opsApi } from "../../api/ops";
import api from "../../api/client";

export default function OpsNewPOS() {
  const [menu, setMenu] = useState([]);
  const [tableNo, setTableNo] = useState("");
  const [items, setItems] = useState([]); // {menuItemId, name, price, qty}

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/menu"); // ya lo tienes
      setMenu(data || []);
    })();
  }, []);

  const add = (m) => {
    setItems((prev) => {
      const i = prev.find(p => p.menuItemId === m.id);
      if (i) return prev.map(p => p.menuItemId === m.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { menuItemId: m.id, name: m.name, price: m.price, qty: 1 }];
    });
  };

  const remove = (id) => setItems(prev => prev.filter(p => p.menuItemId !== id));
  const total = items.reduce((s,i)=> s + Number(i.price)*Number(i.qty), 0);

  const submit = async () => {
    if (!tableNo || items.length === 0) return alert("Faltan datos");
    await opsApi.posCreate({
      table_no: Number(tableNo),
      items: items.map(i => ({ menuItemId: i.menuItemId, qty: i.qty })),
      notes: null
    });
    alert("Orden creada");
    setItems([]); setTableNo("");
  };

  return (
    <div className="pz-container">
      <h2>Nueva orden (POS)</h2>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <section>
          <label>Mesa</label>
          <input value={tableNo} onChange={e=>setTableNo(e.target.value)} placeholder="Ej. 5" />
          <ul style={{ marginTop:12 }}>
            {menu.map(m => (
              <li key={m.id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
                <span>{m.name} — Q{m.price}</span>
                <button onClick={()=>add(m)}>Agregar</button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4>Pedido</h4>
          <ul>
            {items.map(it => (
              <li key={it.menuItemId} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0" }}>
                <span>{it.qty} × {it.name}</span>
                <button onClick={()=>remove(it.menuItemId)}>Quitar</button>
              </li>
            ))}
          </ul>
          <div style={{ marginTop:12, fontWeight:700 }}>Total: Q{total.toFixed(2)}</div>
          <button style={{ marginTop:12 }} onClick={submit}>Crear orden</button>
        </section>
      </div>
    </div>
  );
}
