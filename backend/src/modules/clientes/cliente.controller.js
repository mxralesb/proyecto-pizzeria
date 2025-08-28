import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sequelize,
  User,
  Cliente,
  Direccion,
  Telefono,
} from "../../models/index.js";

async function getEmailFromReq(req) {
  if (req.user?.email) return req.user.email;
  if (req.user?.id) {
    const u = await User.findByPk(req.user.id);
    return u?.email || null;
  }
  return null;
}

export const getMe = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    if (!email) return res.status(401).json({ error: "No autenticado" });

    const me = await Cliente.findOne({
      where: { correo_electronico: email },
      include: [
        { model: Direccion, as: "direcciones" },
        { model: Telefono, as: "telefonos" },
      ],
    });

    if (!me) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(me);
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
};

export const listDirecciones = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const rows = await Direccion.findAll({
      where: { id_cliente: cliente.id_cliente },
      order: [["id_direccion", "DESC"]],
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar direcciones" });
  }
};

export const createDireccion = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { tipo_direccion, calle, ciudad, estado, codigo_postal } = req.body;
    const row = await Direccion.create({
      id_cliente: cliente.id_cliente,
      tipo_direccion,
      calle,
      ciudad,
      estado,
      codigo_postal,
    });
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear dirección" });
  }
};

export const updateDireccion = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { id } = req.params;
    const row = await Direccion.findOne({
      where: { id_direccion: id, id_cliente: cliente.id_cliente },
    });
    if (!row) return res.status(404).json({ error: "Dirección no encontrada" });

    const { tipo_direccion, calle, ciudad, estado, codigo_postal } = req.body;
    await row.update({ tipo_direccion, calle, ciudad, estado, codigo_postal });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar dirección" });
  }
};

export const deleteDireccion = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { id } = req.params;
    await Direccion.destroy({
      where: { id_direccion: id, id_cliente: cliente.id_cliente },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar dirección" });
  }
};

export const listTelefonos = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const rows = await Telefono.findAll({
      where: { id_cliente: cliente.id_cliente },
      order: [["id_telefono", "DESC"]],
    });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al listar teléfonos" });
  }
};

export const createTelefono = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { numero, tipo } = req.body; 
    const row = await Telefono.create({
      id_cliente: cliente.id_cliente,
      numero,
      tipo,
    });
    res.status(201).json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear teléfono" });
  }
};

export const updateTelefono = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { id } = req.params;
    const row = await Telefono.findOne({
      where: { id_telefono: id, id_cliente: cliente.id_cliente },
    });
    if (!row) return res.status(404).json({ error: "Teléfono no encontrado" });

    const { numero, tipo } = req.body;
    await row.update({ numero, tipo });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar teléfono" });
  }
};

export const deleteTelefono = async (req, res) => {
  try {
    const email = await getEmailFromReq(req);
    const cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) return res.status(404).json({ error: "Perfil no encontrado" });

    const { id } = req.params;
    await Telefono.destroy({
      where: { id_telefono: id, id_cliente: cliente.id_cliente },
    });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar teléfono" });
  }
};

export const registerClient = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      nombre,
      apellido,
      correo_electronico,
      contrasena,
      direccion, 
      telefono, 
    } = req.body;

    if (!nombre || !apellido || !correo_electronico || !contrasena) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const existsUser = await User.findOne({ where: { email: correo_electronico } });
    const existsCliente = await Cliente.findOne({ where: { correo_electronico } });
    if (existsUser || existsCliente) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const cliente = await Cliente.create(
      { nombre, apellido, correo_electronico, contrasena: hash },
      { transaction: t }
    );
    const user = await User.create(
      { name: `${nombre} ${apellido}`, email: correo_electronico, password: hash, role: "cliente" },
      { transaction: t }
    );

    if (direccion?.tipo_direccion && direccion?.calle && direccion?.ciudad) {
      await Direccion.create(
        {
          id_cliente: cliente.id_cliente,
          tipo_direccion: direccion.tipo_direccion,
          calle: direccion.calle,
          ciudad: direccion.ciudad,
          estado: direccion.estado || null,
          codigo_postal: direccion.codigo_postal || null,
        },
        { transaction: t }
      );
    }

    if (telefono?.numero && telefono?.tipo) {
      await Telefono.create(
        {
          id_cliente: cliente.id_cliente,
          numero: telefono.numero,
          tipo: telefono.tipo,
        },
        { transaction: t }
      );
    }

    await t.commit();

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      me: {
        id_cliente: cliente.id_cliente,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        correo_electronico: cliente.correo_electronico,
        fecha_registro: cliente.fecha_registro,
      },
    });
  } catch (err) {
    console.error("registerClient error:", err);
    await t.rollback();
    res.status(500).json({ error: "Error al registrar el cliente" });
  }
};
