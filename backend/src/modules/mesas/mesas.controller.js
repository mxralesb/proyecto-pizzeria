import { Op } from "sequelize";
import { z } from "zod";
import { Mesa } from "../../models/mesa.js";

/** ===================== utilidades ===================== */

const ensureSeed = async () => {
  const count = await Mesa.count();
  if (count === 0) {
    const bulk = Array.from({ length: 20 }, (_, i) => ({
      numero: i + 1,
      capacidad: 4,        // puedes ajustar por defecto
      estado: "libre",
      ocupada_hasta: null,
    }));
    await Mesa.bulkCreate(bulk, { ignoreDuplicates: true });
  }
};

// libera automáticamente mesas cuyo tiempo ya venció
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

const buildResumen = async () => {
  const all = await Mesa.findAll({ order: [["numero", "ASC"]] });
  const libres = all.filter((m) => m.estado === "libre");
  const ocupadas = all.filter((m) => m.estado === "ocupada");
  const limpieza = all.filter((m) => m.estado === "limpieza");
  const reservadas = all.filter((m) => m.estado === "reservada");
  return {
    total: all.length,
    libres,
    ocupadas,
    limpieza,
    reservadas,
    mesas: all,
  };
};

/** ===================== validaciones ===================== */

const OccupySchema = z.object({
  id_mesa: z.coerce.number().int().positive(),
  minutos: z.coerce.number().int().positive().default(60),
});

const IdSchema = z.object({
  id_mesa: z.coerce.number().int().positive(),
});

/** ===================== controladores ===================== */

export async function listTables(_req, res) {
  try {
    await ensureSeed();
    await autoReleaseExpired();
    const resumen = await buildResumen();
    res.json(resumen);
  } catch (e) {
    console.error("listTables error:", e);
    res.status(500).json({ error: "Error al listar mesas" });
  }
}

/**
 * Ocupa una mesa si y solo si está 'libre' (update atómico).
 * Devuelve resumen actualizado.
 */
export async function occupyTable(req, res) {
  try {
    const { id_mesa, minutos } = OccupySchema.parse(req.body);

    const until = new Date(Date.now() + Number(minutos) * 60 * 1000);

    // UPDATE atómico: solo si está libre
    const [affected] = await Mesa.update(
      { estado: "ocupada", ocupada_hasta: until },
      { where: { id: id_mesa, estado: "libre" } }
    );

    if (affected === 0) {
      const current = await Mesa.findByPk(id_mesa);
      if (!current) return res.status(404).json({ error: "Mesa no encontrada" });
      return res
        .status(409)
        .json({ error: `La mesa no está libre (estado actual: ${current.estado})` });
    }

    await autoReleaseExpired();
    const resumen = await buildResumen();
    res.json(resumen);
  } catch (e) {
    console.error("occupyTable error:", e);
    if (e?.issues) return res.status(400).json({ error: "Datos inválidos" });
    res.status(500).json({ error: "Error al ocupar mesa" });
  }
}

/**
 * Pasa la mesa a 'limpieza' por 5 minutos (si está ocupada).
 * Devuelve resumen actualizado.
 */
export async function freeTable(req, res) {
  try {
    const { id_mesa } = IdSchema.parse(req.body);
    const until = new Date(Date.now() + 5 * 60 * 1000);

    // UPDATE atómico: solo liberar si está ocupada
    const [affected] = await Mesa.update(
      { estado: "limpieza", ocupada_hasta: until },
      { where: { id: id_mesa, estado: "ocupada" } }
    );

    if (affected === 0) {
      const current = await Mesa.findByPk(id_mesa);
      if (!current) return res.status(404).json({ error: "Mesa no encontrada" });
      return res
        .status(409)
        .json({ error: `No se puede liberar: estado actual ${current.estado}` });
    }

    await autoReleaseExpired();
    const resumen = await buildResumen();
    res.json(resumen);
  } catch (e) {
    console.error("freeTable error:", e);
    if (e?.issues) return res.status(400).json({ error: "Datos inválidos" });
    res.status(500).json({ error: "Error al pasar a limpieza" });
  }
}

/**
 * Marca como 'libre' después de limpieza.
 * Devuelve resumen actualizado.
 */
export async function releaseAfterClean(req, res) {
  try {
    const { id_mesa } = IdSchema.parse(req.body);

    // UPDATE atómico: solo si está en limpieza
    const [affected] = await Mesa.update(
      { estado: "libre", ocupada_hasta: null },
      { where: { id: id_mesa, estado: "limpieza" } }
    );

    if (affected === 0) {
      const current = await Mesa.findByPk(id_mesa);
      if (!current) return res.status(404).json({ error: "Mesa no encontrada" });
      return res
        .status(409)
        .json({ error: `No se puede marcar limpia: estado ${current.estado}` });
    }

    await autoReleaseExpired();
    const resumen = await buildResumen();
    res.json(resumen);
  } catch (e) {
    console.error("releaseAfterClean error:", e);
    if (e?.issues) return res.status(400).json({ error: "Datos inválidos" });
    res.status(500).json({ error: "Error al liberar mesa" });
  }
}
