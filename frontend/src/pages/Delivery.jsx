import { useEffect, useState } from "react";

export default function Delivery() {
  const [deliveries, setDeliveries] = useState([]);

  // Simulación de datos recibidos desde Orders.jsx
  useEffect(() => {
    const sampleDeliveries = [
      {
        id: 1,
        numero: "ORD-010",
        cliente: {
          nombre: "Juan Pérez",
          telefono: "555-123456",
          direccion: "Av. Central 123, Zona 10",
          correo: "juanperez@gmail.com",
        },
        detalle: {
          descripcion: "2 Pizzas familiares, 1 Coca Cola",
          metodoPago: "Tarjeta",
          monto: 220.5,
        },
        estado: "Pendiente",
        fecha: new Date(),
      },
      {
        id: 2,
        numero: "ORD-011",
        cliente: {
          nombre: "María López",
          telefono: "555-987654",
          direccion: "Calle Las Rosas 45, Zona 5",
          correo: "marialopez@gmail.com",
        },
        detalle: {
          descripcion: "1 Lasagna, 1 pizza personal",
          metodoPago: "Efectivo",
          monto: 150.0,
        },
        estado: "Pendiente",
        fecha: new Date(),
      },
    ];
    setDeliveries(sampleDeliveries);
  }, []);

  const handleEstado = (id, nuevoEstado) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, estado: nuevoEstado } : d
      )
    );
  };

  return (
    <div className="delivery-container">
      <style>{`
        .delivery-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-bottom: 25px;
          padding: 16px;
        }
        .card-header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #1f2937;
        }
        .section {
          margin-bottom: 10px;
        }
        .section strong {
          color: #374151;
        }
        .estado {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 14px;
          border: none;
          cursor: pointer;
          margin-top: 8px;
        }
        .pendiente { background-color: #fef3c7; }
        .camino { background-color: #bfdbfe; }
        .entregado { background-color: #bbf7d0; }
      `}</style>

      <h2 className="title">🚚 Órdenes para Delivery</h2>

      {deliveries.map((d) => (
        <div key={d.id} className="card">
          <div className="card-header">
            📦 Orden {d.numero}
          </div>

          <div className="section">
            <strong>Cliente:</strong> {d.cliente.nombre} <br />
            <strong>Teléfono:</strong> {d.cliente.telefono} <br />
            <strong>Dirección:</strong> {d.cliente.direccion} <br />
            <strong>Email:</strong> {d.cliente.correo}
          </div>

          <div className="section">
            <strong>Detalle:</strong> {d.detalle.descripcion} <br />
            <strong>Método de pago:</strong> {d.detalle.metodoPago} <br />
            <strong>Total:</strong> Q{d.detalle.monto.toFixed(2)}
          </div>

          <div className="section">
            <strong>Estado:</strong> {d.estado}
          </div>

          <div>
            <button
              className="estado pendiente"
              onClick={() => handleEstado(d.id, "Pendiente")}
            >
              Pendiente
            </button>
            <button
              className="estado camino"
              onClick={() => handleEstado(d.id, "En camino")}
            >
              En camino
            </button>
            <button
              className="estado entregado"
              onClick={() => handleEstado(d.id, "Entregado")}
            >
              Entregado
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}