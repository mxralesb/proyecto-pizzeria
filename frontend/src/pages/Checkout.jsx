import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import { createOrder } from "../api/orders";
import { getMe, listDirecciones, listTelefonos } from "../api/clientes";

const NEW_VALUE = "__new__";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();

  const items = cart?.items?.length
    ? cart.items
    : JSON.parse(localStorage.getItem("pz-cart") || "[]");

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0),
    [items]
  );
  const tax = +(subtotal * 0.12).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    payment: "tarjeta",
    cardName: "",
    cardNumber: "",
    cardExp: "",
    cardCvv: "",
  });

  const [phones, setPhones] = useState([]);
  const [dirs, setDirs] = useState([]);
  const [selPhone, setSelPhone] = useState(NEW_VALUE);
  const [selDir, setSelDir] = useState(NEW_VALUE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!items.length) navigate("/");
  }, [items, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, telRes, dirRes] = await Promise.all([getMe(), listTelefonos(), listDirecciones()]);
        const telList = Array.isArray(telRes?.data) ? telRes.data : [];
        const dirList = Array.isArray(dirRes?.data) ? dirRes.data : [];

        setPhones(telList);
        setDirs(dirList);

        if (telList.length > 0) {
          setSelPhone(String(telList[0].id_telefono));
          setForm((f) => ({ ...f, phone: telList[0].numero || "" }));
        } else {
          setSelPhone(NEW_VALUE);
        }

        if (dirList.length > 0) {
          const d = dirList[0];
          setSelDir(String(d.id_direccion));
          setForm((f) => ({ ...f, address: d.calle || "", city: d.ciudad || "" }));
        } else {
          setSelDir(NEW_VALUE);
        }

        if (meRes?.data?.nombre || meRes?.data?.apellido) {
          const nm = `${meRes.data.nombre || ""} ${meRes.data.apellido || ""}`.trim();
          setForm((f) => ({ ...f, name: nm || f.name }));
        }
        if (meRes?.data?.correo_electronico) {
          setForm((f) => ({ ...f, email: meRes.data.correo_electronico }));
        }
      } catch {
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (form.payment === "efectivo") {
      setForm((f) => ({ ...f, cardName: "", cardNumber: "", cardExp: "", cardCvv: "" }));
    }
  }, [form.payment]);

  const onChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") value = value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    if (name === "cardName") value = value.replace(/[^A-Za-zÀ-ÿ\s]/g, "").toUpperCase();
    if (name === "cardExp") {
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    }
    if (name === "cardCvv") value = value.replace(/\D/g, "").slice(0, 4);
    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 8);
    setForm((f) => ({ ...f, [name]: value }));
  };

  const clearCartEverywhere = () => {
    cart?.clear?.();
    localStorage.removeItem("pz-cart");
  };

  const generateInvoicePDF = (order) => {
    const doc = new jsPDF();
    const dateStr = dayjs(order?.createdAt || new Date()).format("DD/MM/YYYY HH:mm");

    doc.setFontSize(18);
    doc.text("PIZZAS - FACTURA", 14, 18);
    doc.setFontSize(11);
    doc.text(`No. Pedido: ${order?.id_order ?? "N/A"}`, 14, 26);
    doc.text(`Fecha: ${dateStr}`, 14, 32);
    doc.text(`Estado: ${order.estado.toUpperCase()}`, 14, 38);

    doc.text("Cliente:", 14, 46);
    doc.text(`${form.name}`, 40, 46);
    doc.text("Correo:", 14, 52);
    doc.text(`${form.email}`, 40, 52);
    doc.text("Teléfono:", 14, 58);
    doc.text(`${form.phone || "-"}`, 40, 58);
    doc.text("Dirección:", 14, 64);
    doc.text(`${form.address}, ${form.city}`, 40, 64);
    doc.text("Pago:", 14, 70);
    doc.text(form.payment === "tarjeta" ? "Tarjeta" : "Efectivo", 40, 70);

    let y = 82;
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

    if (form.payment === "tarjeta") {
      const cardNameRegex = /^[A-ZÀ-Ÿ\s]{2,}$/;
      const cardNumberRegex = /^\d{16}$/;
      const cardExpRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      const cardCvvRegex = /^\d{3,4}$/;

      if (!cardNameRegex.test(form.cardName)) return alert("El nombre de la tarjeta solo puede contener letras y espacios.");
      if (!cardNumberRegex.test(form.cardNumber.replace(/\s+/g, ""))) return alert("Número de tarjeta inválido. Debe tener 16 dígitos.");
      if (!cardExpRegex.test(form.cardExp)) return alert("Fecha de expiración inválida. Usa formato MM/AA.");
      const [mm, yy] = form.cardExp.split("/").map((v) => parseInt(v, 10));
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      if (mm < 1 || mm > 12 || yy < currentYear || (yy === currentYear && mm < currentMonth)) return alert("La tarjeta ya expiró.");
      if (!cardCvvRegex.test(form.cardCvv)) return alert("CVV inválido. Debe tener 3 o 4 dígitos.");
    }

    setLoading(true);
    try {
      const payload = {
        cliente: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
        metodo_pago: form.payment,
        subtotal,
        tax,
        total,
        estado: form.payment === "efectivo" ? "pendiente" : "pagada",
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
    } catch {
      alert("No se pudo procesar el pago/orden.");
    } finally {
      setLoading(false);
    }
  };

  const disabled = !items.length || loading;

  const onSelectPhone = (e) => {
    const v = e.target.value;
    setSelPhone(v);
    if (v === NEW_VALUE) setForm((f) => ({ ...f, phone: "" }));
    else {
      const found = phones.find((p) => String(p.id_telefono) === v);
      setForm((f) => ({ ...f, phone: found?.numero || "" }));
    }
  };

  const onSelectDir = (e) => {
    const v = e.target.value;
    setSelDir(v);
    if (v === NEW_VALUE) setForm((f) => ({ ...f, address: "", city: "" }));
    else {
      const d = dirs.find((x) => String(x.id_direccion) === v);
      setForm((f) => ({ ...f, address: d?.calle || "", city: d?.ciudad || "" }));
    }
  };

  const phoneDisabled = selPhone !== NEW_VALUE;
  const dirDisabled = selDir !== NEW_VALUE;

  return (
    <main className="pz-container" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <h2>Finalizar compra</h2>

      {!items.length ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18, alignItems: "start" }}>
          <form className="pz-form" onSubmit={submit}>
            <h3>Datos del cliente</h3>

            <label>
              Nombre completo
              <input className="pz-input" name="name" value={form.name} onChange={onChange} required />
            </label>

            <label>
              Correo
              <input className="pz-input" type="email" name="email" value={form.email} onChange={onChange} required />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label>
                Elegir teléfono
                <select className="pz-input" value={selPhone} onChange={onSelectPhone}>
                  {phones.map((p) => (
                    <option key={p.id_telefono} value={String(p.id_telefono)}>
                      {p.tipo} • {p.numero}
                    </option>
                  ))}
                  <option value={NEW_VALUE}>Agregar nuevo…</option>
                </select>
              </label>
              <label>
                Elegir dirección
                <select className="pz-input" value={selDir} onChange={onSelectDir}>
                  {dirs.map((d) => (
                    <option key={d.id_direccion} value={String(d.id_direccion)}>
                      {d.tipo_direccion} • {d.calle}, {d.ciudad}
                    </option>
                  ))}
                  <option value={NEW_VALUE}>Agregar nueva…</option>
                </select>
              </label>
            </div>

            <label>
              Teléfono
              <input
                className="pz-input"
                name="phone"
                value={form.phone}
                onChange={onChange}
                inputMode="tel"
                maxLength={8}
                disabled={phoneDisabled}
                placeholder="8 dígitos"
              />
            </label>

            <label>
              Dirección
              <input
                className="pz-input"
                name="address"
                value={form.address}
                onChange={onChange}
                disabled={dirDisabled}
              />
            </label>

            <label>
              Ciudad
              <input
                className="pz-input"
                name="city"
                value={form.city}
                onChange={onChange}
                disabled={dirDisabled}
              />
            </label>

            <h3>Método de pago</h3>
            <div style={{ display: "flex", gap: 10 }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="radio" name="payment" value="tarjeta" checked={form.payment === "tarjeta"} onChange={onChange} />
                Tarjeta
              </label>
              <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="radio" name="payment" value="efectivo" checked={form.payment === "efectivo"} onChange={onChange} />
                Efectivo al recibir
              </label>
            </div>

            {form.payment === "tarjeta" && (
              <div className="pz-card" style={{ padding: 14 }}>
                <h4 style={{ margin: 0, marginBottom: 10 }}>Datos de tarjeta</h4>
                <label>
                  Nombre en la tarjeta
                  <input className="pz-input" name="cardName" value={form.cardName} onChange={onChange} required autoComplete="cc-name" />
                </label>
                <label>
                  Número de tarjeta
                  <input className="pz-input" name="cardNumber" inputMode="numeric" value={form.cardNumber} onChange={onChange} placeholder="4111 1111 1111 1111" required autoComplete="cc-number" />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <label>
                    Expiración (MM/AA)
                    <input className="pz-input" name="cardExp" placeholder="MM/AA" value={form.cardExp} onChange={onChange} required autoComplete="cc-exp" />
                  </label>
                  <label>
                    CVV
                    <input className="pz-input" name="cardCvv" inputMode="numeric" value={form.cardCvv} onChange={onChange} required autoComplete="cc-csc" />
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
                  <span>{(it.name || it.title) ?? `Item ${it.id}`} × {it.qty || 1}</span>
                  <strong>Q {((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)}</strong>
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
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 6 }}>
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
