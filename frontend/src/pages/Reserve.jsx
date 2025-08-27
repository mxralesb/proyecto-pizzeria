import { useMemo, useState } from "react";
import api from "../api/client";

const today = () => new Date().toISOString().slice(0, 10);

// Genera horarios cada 5 min entre 07:00 y 21:30
const generateTimes = () => {
  const times = [];
  for (let h = 7; h <= 21; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 21 && m > 30) break; // límite hasta 21:30
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      const time24 = `${hh}:${mm}`;
      const hour12 = new Date(`1970-01-01T${time24}:00`)
        .toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      times.push({ value: time24, label: hour12 });
    }
  }
  return times;
};
const times = generateTimes();

export default function Reserve() {
  const [name, setName] = useState("");
  const [dpi, setDpi] = useState("");
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("19:00");
  const [people, setPeople] = useState(2);
  const [msg, setMsg] = useState("");

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
  };

  return (
    <div className="pz-reserve">
      <h2>Reservar mesa</h2>

      <form className="pz-form" onSubmit={submit}>
        <div className="pz-field">
          <label>Nombre</label>
          <input
            className={`pz-input ${errors.name ? "is-invalid" : ""}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la reserva"
            autoComplete="off"
          />
          {errors.name && <div className="pz-error">{errors.name}</div>}
        </div>

        <div className="pz-field">
          <label>DPI</label>
          <input
            className={`pz-input ${errors.dpi ? "is-invalid" : ""}`}
            type="text"
            inputMode="numeric"
            maxLength={13}
            value={dpi}
            onChange={(e) => setDpi(e.target.value.replace(/\D/g, "").slice(0, 13))}
            placeholder="13 dígitos"
            autoComplete="off"
          />
          {errors.dpi && <div className="pz-error">{errors.dpi}</div>}
        </div>

        <div className="pz-field">
          <label>Fecha</label>
          <input
            className={`pz-input ${errors.date ? "is-invalid" : ""}`}
            type="date"
            min={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {errors.date && <div className="pz-error">{errors.date}</div>}
        </div>

        <div className="pz-field">
          <label>Hora</label>
          <select
            className={`pz-input fancy-select ${errors.time ? "is-invalid" : ""}`}
            value={time}
            onChange={(e) => setTime(e.target.value)}
          >
            {Array.from(new Set(times.map((t) => t.value.split(":")[0]))).map((hour) => (
              <optgroup key={hour} label={`${hour}:00`}>
                {times
                  .filter((t) => t.value.startsWith(hour))
                  .map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
          {errors.time && <div className="pz-error">{errors.time}</div>}
        </div>

        <div className="pz-field">
          <label>Personas</label>
          <input
            className={`pz-input ${errors.people ? "is-invalid" : ""}`}
            type="number"
            min={1}
            max={12}
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
          {errors.people && <div className="pz-error">{errors.people}</div>}
        </div>

        <div className="pz-actions">
          <button className="pz-btn pz-btn-primary" disabled={Object.keys(errors).length > 0}>
            Guardar
          </button>
        </div>

        {msg && <div className="pz-alert ok">{msg}</div>}
      </form>
    </div>
  );
}