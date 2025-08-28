import { useEffect, useState } from "react";
import { listMyOrders, getInvoicePdf } from "../../api/orders";

const fmtQ = v =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    v || 0
  );

export default function History() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { data } = await listMyOrders();
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const downloadInvoice = async (orderId) => {
    try {
      const res = await getInvoicePdf(orderId);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${orderId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("No fue posible descargar la factura");
    }
  };

  return (
    <div className="pz-container" style={{ paddingBottom: 40 }}>
      <div className="pz-header-row" style={{display:"flex", justifyContent:"space-between", alignItems:"center", gap:16}}>
        <h2 style={{margin:0}}>Historial de compras</h2>
      </div>

      {loading && <p>Cargando…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && rows.length === 0 && (
        <div className="pz-empty" style={{marginTop: 24}}>
          Aún no tienes compras.
        </div>
      )}

      {!loading && !err && rows.length > 0 && (
        <div className="pz-card" style={{ marginTop: 16 }}>
          <table className="pz-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{textAlign:"left", padding:"10px 8px"}}>#</th>
                <th style={{textAlign:"left", padding:"10px 8px"}}>Fecha</th>
                <th style={{textAlign:"left", padding:"10px 8px"}}>Método</th>
                <th style={{textAlign:"right", padding:"10px 8px"}}>Total</th>
                <th style={{textAlign:"center", padding:"10px 8px"}}>Factura</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id_order}>
                  <td style={{padding:"8px"}}>{o.id_order}</td>
                  <td style={{padding:"8px"}}>{new Date(o.created_at || o.fecha).toLocaleString()}</td>
                  <td style={{padding:"8px"}}>{o.metodo_pago}</td>
                  <td style={{padding:"8px", textAlign:"right"}}>{fmtQ(o.total)}</td>
                  <td style={{padding:"8px", textAlign:"center"}}>
                    <button
                      className="pz-btn pz-btn-outline"
                      onClick={() => downloadInvoice(o.id_order)}
                    >
                      Descargar PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{marginTop: 16}}>
            {rows.map((o) => (
              <details key={`det-${o.id_order}`} style={{marginBottom: 12}}>
                <summary>Ver detalle de la orden #{o.id_order}</summary>
                <ul style={{marginTop: 8}}>
                  {(o.items || o.OrderItems || []).map((it, i) => (
                    <li key={i}>
                      {it.cantidad} × {it.nombre || it.item_name} — {fmtQ(it.precio_unitario || it.unit_price)}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
