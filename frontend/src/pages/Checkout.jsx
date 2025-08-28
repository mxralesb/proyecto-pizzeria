import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import { createOrder } from "../api/orders";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();

  const items = cart?.items?.length
    ? cart.items
    : JSON.parse(localStorage.getItem("pz-cart") || "[]");

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1),
        0
      ),
    [items]
  );
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "Calle Falsa 123",
    city: "Guatemala",
    payment: "tarjeta",
    cardName: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!items.length) navigate("/");
  }, [items, navigate]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const clearCartEverywhere = () => {
    cart?.clear?.();
    localStorage.removeItem("pz-cart");
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    const dateStr = dayjs(order?.createdAt || new Date()).format(
      "DD/MM/YYYY HH:mm"
    );

    doc.setFontSize(18);
    doc.text("PIZZAS - FACTURA", 14, 18);
    doc.setFontSize(11);
    doc.text(`No. Pedido: ${order?.id_order ?? "N/A"}`, 14, 26);
    doc.text(`Fecha: ${dateStr}`, 14, 32);

    doc.text("Cliente:", 14, 42);
    doc.text(`${form.name}`, 40, 42);
    doc.text("Correo:", 14, 48);
    doc.text(`${form.email}`, 40, 48);
    doc.text("Teléfono:", 14, 54);
    doc.text(`${form.phone || "-"}`, 40, 54);
    doc.text("Dirección:", 14, 60);
    doc.text(`${form.address}, ${form.city}`, 40, 60);
    doc.text("Pago:", 14, 66);
    doc.text(form.payment === "tarjeta" ? "Tarjeta" : "Efectivo", 40, 66);

    let y = 78;
    doc.setFontSize(12);
    doc.text("Detalle de compra", 14, y);
    y += 6;

    doc.setFontSize(10);
    doc.text("Producto", 14, y);
    doc.text("Cant.", 120, y);
    doc.text("P. Unit.", 140, y);
    doc.text("Total", 170, y);
    y += 4;
    doc.line(14, y, 196, y);
    y += 6;

    items.forEach((it) => {
      const name = it.name || it.title || `Item ${it.id}`;
      const qty = Number(it.qty) || 1;
      const price = Number(it.price) || 0;
      const line = +(qty * price).toFixed(2);

      doc.text(String(name).slice(0, 42), 14, y);
      doc.text(String(qty), 120, y, { align: "right" });
      doc.text(`Q ${price.toFixed(2)}`, 160, y, { align: "right" });
      doc.text(`Q ${line.toFixed(2)}`, 196, y, { align: "right" });
      y += 6;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 4;
    doc.line(120, y, 196, y);
    y += 8;
    doc.text("Subtotal:", 160, y, { align: "right" });
    doc.text(`Q ${subtotal.toFixed(2)}`, 196, y, { align: "right" });
    y += 6;
    doc.text("IVA (12%):", 160, y, { align: "right" });
    doc.text(`Q ${tax.toFixed(2)}`, 196, y, { align: "right" });
    y += 6;
    doc.setFontSize(12);
    doc.text("TOTAL:", 160, y, { align: "right" });
    doc.text(`Q ${total.toFixed(2)}`, 196, y, { align: "right" });

    y += 14;
    doc.setFontSize(10);
    doc.text("Gracias por su compra. ¡Buen provecho!", 14, y);

    doc.save(`Factura_${order?.id_order ?? Date.now()}.pdf`);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    try {
      const payload = {
        metodo_pago: form.payment, 
        subtotal,
        tax,
        total,
        items: items.map((it) => ({
          id: it.id,
          name: it.name || it.title,
          price: Number(it.price || 0),
          qty: Number(it.qty || 1),
        })),
      };

      const { data: order } = await createOrder(payload);

      generateInvoicePDF(order);
      clearCartEverywhere();
      navigate("/historial", { replace: true });
    } catch (err) {
      console.error(err);
      alert("No se pudo procesar el pago/orden.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = !items.length || loading;

  return (
    <main className="pz-container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2>Finalizar compra</h2>

      {!items.length ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            alignItems: "start",
          }}
        >
          <form className="pz-form" onSubmit={submit}>
            <h3>Datos del cliente</h3>
            <label>
              Nombre completo
              <input
                className="pz-input"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Correo
              <input
                className="pz-input"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                required
              />
            </label>
            <label>
              Teléfono
              <input
                className="pz-input"
                name="phone"
                value={form.phone}
                onChange={onChange}
              />
            </label>
            <label>
              Dirección
              <input
                className="pz-input"
                name="address"
                value={form.address}
                onChange={onChange}
              />
            </label>
            <label>
              Ciudad
              <input
                className="pz-input"
                name="city"
                value={form.city}
                onChange={onChange}
              />
            </label>

            <h3>Método de pago</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="radio"
                  name="payment"
                  value="tarjeta"
                  checked={form.payment === "tarjeta"}
                  onChange={onChange}
                />
                Tarjeta
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="radio"
                  name="payment"
                  value="efectivo"
                  checked={form.payment === "efectivo"}
                  onChange={onChange}
                />
                Efectivo al recibir
              </label>
            </div>

            {form.payment === "tarjeta" && (
              <div className="pz-card" style={{ padding: 14 }}>
                <h4 style={{ margin: 0, marginBottom: 10 }}>
                  Datos de tarjeta (simulado)
                </h4>
                <label>
                  Nombre en la tarjeta
                  <input
                    className="pz-input"
                    name="cardName"
                    value={form.cardName}
                    onChange={onChange}
                    required={form.payment === "tarjeta"}
                  />
                </label>
                <label>
                  Número de tarjeta
                  <input
                    className="pz-input"
                    name="cardNumber"
                    inputMode="numeric"
                    value={form.cardNumber}
                    onChange={onChange}
                    placeholder="4111 1111 1111 1111"
                    required={form.payment === "tarjeta"}
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label>
                    Expiración (MM/AA)
                    <input
                      className="pz-input"
                      name="cardExp"
                      placeholder="12/28"
                      value={form.cardExp}
                      onChange={onChange}
                      required={form.payment === "tarjeta"}
                    />
                  </label>
                  <label>
                    CVV
                    <input
                      className="pz-input"
                      name="cardCvv"
                      inputMode="numeric"
                      value={form.cardCvv}
                      onChange={onChange}
                      required={form.payment === "tarjeta"}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="pz-actions" style={{ marginTop: 8 }}>
              <button className="pz-btn pz-btn-primary" disabled={disabled}>
                {loading ? "Procesando..." : "Confirmar y pagar"}
              </button>
            </div>
          </form>

          <div className="pz-card" style={{ padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>Resumen</h3>
            <ul className="pz-list" style={{ marginBottom: 10 }}>
              {items.map((it) => (
                <li key={it.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>
                    {(it.name || it.title) ?? `Item ${it.id}`} × {it.qty || 1}
                  </span>
                  <strong>
                    Q {(((Number(it.price) || 0) * (Number(it.qty) || 1))).toFixed(2)}
                  </strong>
                </li>
              ))}
            </ul>
            <div style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span>Q {subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>IVA (12%)</span>
                <span>Q {tax.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  marginTop: 6,
                }}
              >
                <span>Total</span>
                <span>Q {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
