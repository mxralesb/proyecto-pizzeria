import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/authContext";

const todayStr = () => new Date().toISOString().slice(0, 10);
const HMIN = 11;
const HMAX = 23;
const stepMin = 30;

function buildSlots() {
  const slots = [];
  for (let h = HMIN; h < HMAX; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

function normalizeTime(t) {
  return String(t).slice(0, 5);
}

export default function Reserve() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [dpi, setDpi] = useState("");
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("19:00");
  const [people, setPeople] = useState(2);

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });

  const [occupied, setOccupied] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const errors = useMemo(() => {
    const e = {};
    const nm = name.trim();
    if (!nm || nm.length < 3) e.name = "Ingresa un nombre válido";
    if (!/^\d{13}$/.test(dpi)) e.dpi = "El DPI debe tener 13 dígitos";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayStr()) e.date = "Fecha inválida";
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) e.time = "Hora inválida";
    const [hh, mm] = time.split(":").map(Number);
    if (!(hh >= HMIN && (hh < HMAX || (hh === HMAX && mm === 0)))) e.time = "Horario permitido 11:00–23:00";
    const n = parseInt(people, 10);
    if (!Number.isInteger(n) || n < 1 || n > 12) e.people = "Personas 1–12";
    return e;
  }, [name, dpi, date, time, people]);

  const loadMine = async () => {
    setLoading(true);
    setErr("");
    try {
      let data = [];
      const rMine = await api.get("/reservations/mine").catch(() => null);
      if (rMine?.data) {
        data = rMine.data;
      } else {
        const r = await api.get("/reservations");
        const all = Array.isArray(r.data) ? r.data : [];
        if (user?.email) {
          data = all.filter(
            (x) =>
              String(x.userEmail || x.email || "").toLowerCase() ===
              String(user.email).toLowerCase()
          );
        } else {
          data = all;
        }
      }
      setRows(Array.isArray(data) ? data : []);
    } catch {
      setErr("No se pudieron cargar tus reservas");
    } finally {
      setLoading(false);
    }
  };

  const loadOccupied = async (d) => {
    try {
      const res = await api
        .get("/reservations/occupied", { params: { date: d } })
        .catch(() => null);
      if (res?.data && Array.isArray(res.data)) {
        setOccupied(res.data.map(normalizeTime));
      } else {
        const r = await api.get("/reservations", { params: { date: d } });
        const times = (r.data || [])
          .filter((x) => x.date === d)
          .map((x) => normalizeTime(x.time));
        setOccupied(times);
      }
    } catch {
      setOccupied([]);
    }
  };

  useEffect(() => {
    loadMine();
  }, [user?.email]);

  useEffect(() => {
    loadOccupied(date);
  }, [date]);

  useEffect(() => {
    const all = buildSlots();
    const free = all.filter((t) => !occupied.includes(t));
    setSuggestions(free.slice(0, 8));
  }, [occupied]);

  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedRows = useMemo(() => {
    const arr = [...rows];
    const { key, direction } = sortConfig;
    arr.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va < vb) return direction === "asc" ? -1 : 1;
      if (va > vb) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, sortConfig]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return sortedRows;
    const s = search.toLowerCase();
    return sortedRows.filter(
      (r) =>
        String(r.name || "").toLowerCase().includes(s) ||
        String(r.dpi || "").includes(s)
    );
  }, [search, sortedRows]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) return sortConfig.direction === "asc" ? "▲" : "▼";
    return "⇅";
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (Object.keys(errors).length) return;

    const chosen = normalizeTime(time);
    if (occupied.includes(chosen)) {
      const all = buildSlots();
      const free = all.filter((t) => !occupied.includes(t));
      setSuggestions(free.slice(0, 8));
      setErr("Ese horario ya está reservado. Elige otro.");
      return;
    }

    setCreating(true);
    try {
      await api.post("/reservations", {
        name: name.trim(),
        dpi,
        date,
        time: chosen,
        people: parseInt(people, 10),
        userEmail: user?.email || null,
      });
      setName("");
      setDpi("");
      setDate(todayStr());
      setTime("19:00");
      setPeople(2);
      setMsg("Reserva creada");
      await Promise.all([loadMine(), loadOccupied(date)]);
    } catch {
      setErr("No se pudo crear la reserva");
    } finally {
      setCreating(false);
      setTimeout(() => setMsg(""), 2500);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <h2 style={{ marginBottom: 16 }}>Reservar mesa</h2>

      <div style={{ background: "#f9f9f9", padding: 18, borderRadius: 12, marginBottom: 20 }}>
        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label>Nombre</label>
              <input
                style={{ width: "100%" }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la reserva"
              />
              {errors.name && <div style={{ color: "crimson", fontSize: 12 }}>{errors.name}</div>}
            </div>

            <div>
              <label>DPI</label>
              <input
                style={{ width: "100%" }}
                value={dpi}
                onChange={(e) => setDpi(e.target.value.replace(/\D/g, "").slice(0, 13))}
                placeholder="13 dígitos"
              />
              {errors.dpi && <div style={{ color: "crimson", fontSize: 12 }}>{errors.dpi}</div>}
            </div>

            <div>
              <label>Fecha</label>
              <input
                type="date"
                min={todayStr()}
                style={{ width: "100%" }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <div style={{ color: "crimson", fontSize: 12 }}>{errors.date}</div>}
            </div>

            <div>
              <label>Hora</label>
              <input
                type="time"
                step={stepMin * 60}
                min="11:00"
                max="23:00"
                style={{ width: "100%" }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              {errors.time && <div style={{ color: "crimson", fontSize: 12 }}>{errors.time}</div>}
            </div>

            <div>
              <label>Personas</label>
              <input
                type="number"
                min={1}
                max={12}
                style={{ width: "100%" }}
                value={people}
                onChange={(e) => setPeople(e.target.value)}
              />
              {errors.people && <div style={{ color: "crimson", fontSize: 12 }}>{errors.people}</div>}
            </div>
          </div>

          {!!err && (
            <div style={{ color: "crimson" }}>{err}</div>
          )}

          {occupied.includes(normalizeTime(time)) && suggestions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {suggestions.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => {
                    setTime(s);
                    setErr("");
                  }}
                  className="pz-btn pz-btn-outline"
                  style={{ padding: "6px 10px" }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <button className="pz-btn pz-btn-primary" disabled={creating || Object.keys(errors).length > 0}>
              {creating ? "Guardando..." : "Guardar"}
            </button>
            {msg && <span style={{ marginLeft: 10, color: "green" }}>{msg}</span>}
          </div>
        </form>
      </div>

      <div style={{ background: "#fff", padding: 18, borderRadius: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <h3 style={{ margin: 0 }}>Mis reservas</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o DPI..."
            style={{ width: 260 }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f3f3" }}>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("id")}>Folio {getSortIndicator("id")}</th>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("name")}>Nombre {getSortIndicator("name")}</th>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("dpi")}>DPI {getSortIndicator("dpi")}</th>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("date")}>Fecha {getSortIndicator("date")}</th>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("time")}>Hora {getSortIndicator("time")}</th>
                <th style={{ padding: 10, cursor: "pointer" }} onClick={() => requestSort("people")}>Personas {getSortIndicator("people")}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 18 }}>Cargando…</td>
                </tr>
              )}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 18 }}>Sin reservas</td>
                </tr>
              )}
              {!loading && filteredRows.map((b, i) => (
                <tr key={b.id} style={{ background: i % 2 ? "#fafafa" : "#fff" }}>
                  <td style={{ padding: 8, fontWeight: 600 }}>#{b.id}</td>
                  <td style={{ padding: 8 }}>{b.name}</td>
                  <td style={{ padding: 8 }}>{b.dpi}</td>
                  <td style={{ padding: 8 }}>{b.date}</td>
                  <td style={{ padding: 8 }}>{normalizeTime(b.time)}</td>
                  <td style={{ padding: 8 }}>{b.people}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
