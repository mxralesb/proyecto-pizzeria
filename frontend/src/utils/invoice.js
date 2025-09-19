// frontend/src/utils/invoice.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function buildInvoicePDF(bill) {
  const doc = new jsPDF();

  const date = new Date(bill.createdAt || Date.now()).toLocaleString();
  const title = `Factura simulada - Ticket #${bill.id_bill}`;

  doc.setFontSize(14);
  doc.text("Pizzarica", 14, 14);
  doc.setFontSize(10);
  doc.text("Zona 10, Ciudad de Guatemala", 14, 20);
  doc.text("Tel. (502) 5555-1234", 14, 25);

  doc.setFontSize(12);
  doc.text(title, 14, 38);
  doc.setFontSize(10);
  doc.text(`Mesa: ${bill.mesa_id}`, 14, 44);
  doc.text(`Fecha: ${date}`, 14, 49);
  if (bill.payment_method) doc.text(`Pago: ${bill.payment_method}`, 14, 54);
  if (bill.amount_received != null) doc.text(`Recibido: Q${Number(bill.amount_received).toFixed(2)}`, 14, 59);
  if (bill.change_given != null) doc.text(`Cambio: Q${Number(bill.change_given).toFixed(2)}`, 14, 64);

  const rows = (bill.items || []).map((it) => [
    it.name,
    it.qty,
    `Q${Number(it.unit_price).toFixed(2)}`,
    `Q${Number(it.qty * it.unit_price).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 70,
    head: [["Producto", "Cant", "Precio", "Subtotal"]],
    body: rows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [14, 165, 233] },
    theme: "striped",
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } }
  });

  const y = (doc.lastAutoTable?.finalY || 70) + 8;
  doc.setFontSize(11);
  doc.text(`Subtotal: Q${Number(bill.subtotal).toFixed(2)}`, 150, y, { align: "right" });
  doc.text(`IVA: Q${Number(bill.tax).toFixed(2)}`, 150, y + 6, { align: "right" });
  doc.text(`Total: Q${Number(bill.total).toFixed(2)}`, 150, y + 12, { align: "right" });

  doc.save(`factura_ticket_${bill.id_bill}.pdf`);
}
