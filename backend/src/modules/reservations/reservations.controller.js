import { Reservation } from "../../models/reservation.js";
import { Cliente } from "../../models/cliente.js";

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s) => /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const todayIso = () => new Date().toISOString().slice(0, 10);

async function getEmailFromReq(req) {
  if (req.user?.email) return req.user.email;
  return null;
}

export async function list(req, res) {
  try {
    const rows = await Reservation.findAll({
      order: [["date", "DESC"], ["time", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listMine(req, res) {
  try {
    const email = await getEmailFromReq(req);
    if (!email) return res.status(401).json({ error: "No autenticado" });
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    const rows = await Reservation.findAll({
      where: { id_cliente: cliente.id_cliente },
      order: [["date", "DESC"], ["time", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const email = await getEmailFromReq(req);
    if (!email) return res.status(401).json({ error: "No autenticado" });
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });

    const { name, dpi, date, time, people } = req.body;
    const errors = {};
    if (!name || name.trim().length < 3) errors.name = "Nombre inválido";
    if (!/^\d{13}$/.test(dpi)) errors.dpi = "DPI inválido";
    if (!isDate(date)) errors.date = "Fecha inválida";
    if (!isTime(time)) errors.time = "Hora inválida";
    const num = parseInt(people, 10);
    if (!Number.isInteger(num) || num < 1 || num > 12) errors.people = "Personas 1–12";
    const today = todayIso();
    if (!errors.date && date < today) errors.date = "La fecha no puede ser en el pasado";
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const row = await Reservation.create({
      id_cliente: cliente.id_cliente,
      name: name.trim(),
      dpi,
      date,
      time: `${time}:00`,
      people: num,
    });

    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
