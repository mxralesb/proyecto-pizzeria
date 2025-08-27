import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const today = () => new Date().toISOString().slice(0, 10);

export default function Reserve() {
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [dpi, setDpi] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("19:00");
  const [people, setPeople] = useState(2);

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 ahora el default es folio DESC
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [search, setSearch] = useState("");

  const errors = useMemo(() => {
    const e = {};
    if (!name.trim() || name.trim().length < 3) e.name = "Ingresa un nombre válido";
    if (!/^\d{13}$/.test(dpi)) e.dpi = "El DPI debe tener 13 dígitos";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today()) e.date = "Fecha inválida";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) e.time = "Hora inválida";
    const n = parseInt(people, 10);
    if (!Number.isInteger(n) || n < 1 || n > 12) e.people = "Personas 1–12";
    return e;
  }, [name, dpi, date, time, people]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/reservations");
      setRows(r.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length) return;
    await api.post("/reservations", {
      name: name.trim(),
      dpi,
      date,
      time,
      people: parseInt(people, 10),
    });
    setName("");
    setDpi("");
    setDate(today());
    setTime("19:00");
    setPeople(2);
    setMsg("Reserva creada");
    setTimeout(() => setMsg(""), 2000);
    load();
  };

  const sortedRows = useMemo(() => {
    let sortable = [...rows];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [rows, sortConfig]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return sortedRows;
    return sortedRows.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.dpi.includes(search)
    );
  }, [search, sortedRows]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? "▲" : "▼";
    }
    return "⇅";
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Reservar mesa</h2>

      {/* Formulario */}
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "12px", marginBottom: "30px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <form onSubmit={submit} style={{ display: "grid", gap: "15px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div>
              <label>Nombre</label>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: errors.name ? "1px solid red" : "1px solid #ccc" }}
                type="text"
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="Nombre de la reserva"
              />
              {errors.name && <div style={{ color: "red", fontSize: "12px" }}>{errors.name}</div>}
            </div>

            <div>
              <label>DPI</label>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: errors.dpi ? "1px solid red" : "1px solid #ccc" }}
                type="text"
                value={dpi}
                onChange={e=>setDpi(e.target.value.replace(/\D/g,"").slice(0,13))}
                placeholder="13 dígitos"
              />
              {errors.dpi && <div style={{ color: "red", fontSize: "12px" }}>{errors.dpi}</div>}
            </div>

            <div>
              <label>Fecha</label>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: errors.date ? "1px solid red" : "1px solid #ccc" }}
                type="date"
                min={today()}
                value={date}
                onChange={e=>setDate(e.target.value)}
              />
              {errors.date && <div style={{ color: "red", fontSize: "12px" }}>{errors.date}</div>}
            </div>

            <div>
              <label>Hora</label>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: errors.time ? "1px solid red" : "1px solid #ccc" }}
                type="time"
                step="1800"          
                value={time}
                onChange={e=>setTime(e.target.value)}
              />
              {errors.time && <div style={{ color: "red", fontSize: "12px" }}>{errors.time}</div>}
            </div>

            <div>
              <label>Personas</label>
              <input
                style={{ width: "100%", padding: "8px", borderRadius: "6px", border: errors.people ? "1px solid red" : "1px solid #ccc" }}
                type="number"
                min={1}
                max={12}
                value={people}
                onChange={e=>setPeople(e.target.value)}
              />
              {errors.people && <div style={{ color: "red", fontSize: "12px" }}>{errors.people}</div>}
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              style={{ background: "#4CAF50", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "8px", cursor: "pointer" }}
              disabled={Object.keys(errors).length>0}
            >
              Guardar
            </button>
          </div>

          {msg && <div style={{ textAlign: "center", color: "green", marginTop: "10px" }}>{msg}</div>}
        </form>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <h3 style={{ margin: 0, color: "#333" }}>Últimas reservas</h3>
          <input
            type="text"
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", width: "250px" }}
            placeholder="Buscar por nombre o DPI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("id")}>Folio {getSortIndicator("id")}</th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("name")}>Nombre {getSortIndicator("name")}</th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("dpi")}>DPI {getSortIndicator("dpi")}</th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("date")}>Fecha {getSortIndicator("date")}</th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("time")}>Hora {getSortIndicator("time")}</th>
                <th style={{ padding: "10px", cursor: "pointer" }} onClick={() => requestSort("people")}>Personas {getSortIndicator("people")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>Cargando…</td></tr>}
              {!loading && filteredRows.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>Sin reservas encontradas</td></tr>
              )}
              {!loading && filteredRows.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>#{b.id}</td>
                  <td style={{ padding: "8px" }}>{b.name}</td>
                  <td style={{ padding: "8px" }}>{b.dpi}</td>
                  <td style={{ padding: "8px" }}>{b.date}</td>
                  <td style={{ padding: "8px" }}>{String(b.time).slice(0, 5)}</td>
                  <td style={{ padding: "8px" }}>{b.people}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}