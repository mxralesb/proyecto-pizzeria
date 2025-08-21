import { useMemo, useState } from "react";
import api from "../api/client";

const today = () => new Date().toISOString().slice(0, 10);

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
          <input
            className={`pz-input ${errors.time ? "is-invalid" : ""}`}
            type="time"
            step="1800"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
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