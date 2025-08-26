import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [entregadas, setEntregadas] = useState([]);

  const repartidores = ["Luis", "Ana", "Carlos", "Marta"];

  useEffect(() => {
    const sample = [
      {
        id: 1,
        numero: "ORD-001",
        proveniencia: "Cliente Online",
        detalles: "Pizza grande, 2 gaseosas",
        ingredientes: "Harina, Queso, Tomate, Pepperoni",
        fecha: new Date(),
        lista: false,
      },
      {
        id: 2,
        numero: "ORD-002",
        proveniencia: "Mesa de restaurante",
        detalles: "Lasagna, vino tinto",
        ingredientes: "Pasta, Carne, Queso, Salsa",
        fecha: new Date(),
        lista: false,
      },
    ];
    setOrders(sample);
  }, []);

  const getElapsed = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    const min = Math.floor(diff / 60);
    const sec = diff % 60;
    return { min, sec, text: `${min}m ${sec}s` };
  };

  const getRowClass = (date) => {
    const { min } = getElapsed(date);
    if (min < 5) return "row-green";
    if (min < 10) return "row-yellow";
    return "row-red";
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheck = (id) => {
    setOrders((prev) => {
      const orden = prev.find((o) => o.id === id);
      if (!orden) return prev;

      const updated = prev.filter((o) => o.id !== id);
      const libre =
        repartidores[Math.floor(Math.random() * repartidores.length)];
      setEntregadas((prevEnt) => [
        ...prevEnt,
        { ...orden, repartidor: libre, completada: new Date() },
      ]);

      return updated;
    });
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matches =
      o.numero.toLowerCase().includes(q) ||
      o.detalles.toLowerCase().includes(q) ||
      o.ingredientes.toLowerCase().includes(q);

    const filterOk = filter ? o.proveniencia === filter : true;
    return matches && filterOk;
  });

  return (
    <div className="orders-container">
      <style>{`
        .orders-container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #333;
        }
        .filters {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
        }
        .filters input,
        .filters select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          flex: 1;
          font-size: 14px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-bottom: 30px;
          overflow: hidden;
        }
        .card-title {
          margin: 0;
          padding: 12px 16px;
          font-size: 18px;
          font-weight: bold;
          color: #fff;
        }
        .card-title.pending {
          background: linear-gradient(90deg, #3b82f6, #6366f1);
        }
        .card-title.delivered {
          background: linear-gradient(90deg, #10b981, #059669);
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead {
          background: #f9fafb;
        }
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        tbody tr:hover {
          background: #f3f4f6;
          transition: 0.2s;
        }
        /* Estados de colores */
        .row-green {
          background-color: #ecfdf5;
        }
        .row-yellow {
          background-color: #fefce8;
        }
        .row-red {
          background-color: #fef2f2;
        }
        .row-delivered {
          background-color: #f0fdf4;
        }
      `}</style>

      <h2 className="title">📋 Gestión de Órdenes</h2>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Buscar orden..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todas</option>
          <option value="Cliente Online">Cliente Online</option>
          <option value="Mesa de restaurante">Mesa de restaurante</option>
          <option value="Auto de Drive Thru">Auto de Drive Thru</option>
        </select>
      </div>

      {/* Tabla de órdenes pendientes */}
      <div className="card">
        <h3 className="card-title pending">⏳ Órdenes Pendientes</h3>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Proveniencia</th>
              <th>Detalles</th>
              <th>Ingredientes</th>
              <th>Fecha</th>
              <th>Tiempo</th>
              <th>✔</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const { text } = getElapsed(o.fecha);
              return (
                <tr key={o.id} className={getRowClass(o.fecha)}>
                  <td>{o.numero}</td>
                  <td>{o.proveniencia}</td>
                  <td>{o.detalles}</td>
                  <td>{o.ingredientes}</td>
                  <td>{new Date(o.fecha).toLocaleString()}</td>
                  <td>{text}</td>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleCheck(o.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tabla de órdenes entregadas */}
      <div className="card">
        <h3 className="card-title delivered">✅ Órdenes Entregadas</h3>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Proveniencia</th>
              <th>Detalles</th>
              <th>Repartidor</th>
              <th>Fecha Entrega</th>
            </tr>
          </thead>
          <tbody>
            {entregadas.map((e) => (
              <tr key={e.id} className="row-delivered">
                <td>{e.numero}</td>
                <td>{e.proveniencia}</td>
                <td>{e.detalles}</td>
                <td>{e.repartidor}</td>
                <td>{new Date(e.completada).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}