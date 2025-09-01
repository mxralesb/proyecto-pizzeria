// src/pages/Inventory.jsx
import { useState, useMemo } from "react";

const initialProducts = [
  { id: 1, name: "Margarita", type: "Pizza", stock: 120, price: 50 },
  { id: 2, name: "Pepperoni", type: "Pizza", stock: 95, price: 55 },
  { id: 3, name: "Hawaiana", type: "Pizza", stock: 60, price: 52 },
  { id: 4, name: "Cuatro Quesos", type: "Pizza", stock: 40, price: 60 },
  { id: 5, name: "Barbacoa", type: "Pizza", stock: 25, price: 58 },
  { id: 6, name: "Vegetariana", type: "Pizza", stock: 15, price: 48 },
  { id: 7, name: "Cannolis", type: "Postre", stock: 50, price: 25 },
  { id: 8, name: "Tiramisú", type: "Postre", stock: 30, price: 28 },
  { id: 9, name: "Brownie con Helado", type: "Postre", stock: 20, price: 30 },
  { id: 10, name: "Cheesecake", type: "Postre", stock: 10, price: 32 },
  { id: 11, name: "Coca-Cola", type: "Bebida", stock: 150, price: 10 },
  { id: 12, name: "7-Up", type: "Bebida", stock: 100, price: 10 },
  { id: 13, name: "Fanta de Naranja", type: "Bebida", stock: 90, price: 10 },
  { id: 14, name: "Grappete", type: "Bebida", stock: 60, price: 10 },
  { id: 15, name: "Doctor Pepper", type: "Bebida", stock: 40, price: 12 },
];

export default function Inventory() {
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState({ search: "", type: "" });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  const sortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchType = filters.type ? p.type === filters.type : true;
      return matchSearch && matchType;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (sortConfig.key === "stock" || sortConfig.key === "price") {
          return sortConfig.direction === "asc" ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
        }
        return 0;
      });
    }

    return filtered;
  }, [products, filters, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const handleReplenish = (id) => {
    const amount = parseInt(prompt("Cantidad a reabastecer:"), 10);
    if (!isNaN(amount) && amount > 0) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: p.stock + amount } : p));
      alert("Stock actualizado y orden generada (simulación frontend).");
    }
  };

  const handleUpdate = (id) => {
    const newStock = parseInt(prompt("Ingrese stock correcto:"), 10);
    if (!isNaN(newStock) && newStock >= 0) {
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      alert("Stock corregido (simulación frontend).");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Desea eliminar este producto del inventario?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const getRowColor = (stock) => {
    if (stock <= 20) return "#f8d7da"; // rojo
    if (stock <= 100) return "#fff3cd"; // amarillo
    return "#d4edda"; // verde
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Inventario</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ padding: 6, flex: 1 }}
        />
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          style={{ padding: 6 }}
        >
          <option value="">Todos los tipos</option>
          <option value="Pizza">Pizza</option>
          <option value="Postre">Postre</option>
          <option value="Bebida">Bebida</option>
        </select>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Nombre</th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Tipo</th>
            <th
              style={{ border: "1px solid #ccc", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("stock")}
            >
              Cantidad {sortConfig.key === "stock" ? (sortConfig.direction === "asc" ? "⬆" : "⬇") : ""}
            </th>
            <th
              style={{ border: "1px solid #ccc", padding: 8, cursor: "pointer" }}
              onClick={() => handleSort("price")}
            >
              Precio Unitario {sortConfig.key === "price" ? (sortConfig.direction === "asc" ? "⬆" : "⬇") : ""}
            </th>
            <th style={{ border: "1px solid #ccc", padding: 8 }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(product => (
            <tr key={product.id} style={{ backgroundColor: getRowColor(product.stock) }}>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{product.id}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{product.name}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{product.type}</td>
              <td style={{ border: "1px solid #ccc", padding: 8, fontWeight: 600 }}>{product.stock}</td>
              <td style={{ border: "1px solid #ccc", padding: 8 }}>{product.price} Q</td>
              <td style={{ border: "1px solid #ccc", padding: 8, display: "flex", gap: 6 }}>
                <button onClick={() => handleReplenish(product.id)} style={{ padding: "4px 8px" }}>Reabastecer</button>
                <button onClick={() => handleUpdate(product.id)} style={{ padding: "4px 8px" }}>Actualizar</button>
                <button onClick={() => handleDelete(product.id)} style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "#fff" }}>Eliminar</button>
              </td>
            </tr>
          ))}
          {sortedProducts.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: 10, textAlign: "center" }}>No hay productos</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}