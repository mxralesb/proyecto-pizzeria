import { Op } from "sequelize";
import { Mesa } from "../../models/mesa.js";

const ensureSeed = async () => {
  const count = await Mesa.count();
  if (count === 0) {
    const bulk = Array.from({ length: 20 }, (_, i) => ({
      numero: i + 1,
      capacidad: 5,
      estado: "libre",
    }));
    await Mesa.bulkCreate(bulk);
  }
};

const autoReleaseExpired = async () => {
  const now = new Date();
  await Mesa.update(
    { estado: "libre", ocupada_hasta: null },
    { where: { estado: "limpieza", ocupada_hasta: { [Op.lt]: now } } }
  );
  await Mesa.update(
    { estado: "libre", ocupada_hasta: null },
    { where: { estado: "ocupada", ocupada_hasta: { [Op.lt]: now } } }
  );
};

export async function listTables(req, res) {
  try {
    await ensureSeed();
    await autoReleaseExpired();

    const all = await Mesa.findAll({ order: [["numero", "ASC"]] });
    const libres = all.filter((m) => m.estado === "libre");
    const ocupadas = all.filter((m) => m.estado === "ocupada");
    const limpieza = all.filter((m) => m.estado === "limpieza");
    const reservadas = all.filter((m) => m.estado === "reservada");

    res.json({
      total: all.length,
      libres,
      ocupadas,
      limpieza,
      reservadas,
      mesas: all,
    });
  } catch (e) {
    console.error("listTables error:", e);
    res.status(500).json({ error: "Error al listar mesas" });
  }
}

export async function occupyTable(req, res) {
  try {
    const { id_mesa, minutos = 60 } = req.body;
    const mesa = await Mesa.findByPk(id_mesa);
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });
    if (mesa.estado !== "libre")
      return res.status(400).json({ error: "La mesa no está libre" });

    const until = new Date(Date.now() + Number(minutos) * 60 * 1000);
    await mesa.update({ estado: "ocupada", ocupada_hasta: until });

    res.json(mesa);
  } catch (e) {
    console.error("occupyTable error:", e);
    res.status(500).json({ error: "Error al ocupar mesa" });
  }
}

export async function freeTable(req, res) {
  try {
    const { id_mesa } = req.body;
    const mesa = await Mesa.findByPk(id_mesa);
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

    const until = new Date(Date.now() + 5 * 60 * 1000);
    await mesa.update({ estado: "limpieza", ocupada_hasta: until });

    res.json(mesa);
  } catch (e) {
    console.error("freeTable error:", e);
    res.status(500).json({ error: "Error al pasar a limpieza" });
  }
}

export async function releaseAfterClean(req, res) {
  try {
    const { id_mesa } = req.body;
    const mesa = await Mesa.findByPk(id_mesa);
    if (!mesa) return res.status(404).json({ error: "Mesa no encontrada" });

    await mesa.update({ estado: "libre", ocupada_hasta: null });
    res.json(mesa);
  } catch (e) {
    console.error("releaseAfterClean error:", e);
    res.status(500).json({ error: "Error al liberar mesa" });
  }
}