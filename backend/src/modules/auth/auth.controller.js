import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { sequelize, User, Cliente, Direccion, Telefono } from "../../models/index.js";
import { sendMail } from "../../utils/mailer.js";
import { recoverEmailHtml } from "../../utils/templates/recover.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      employee_role: user.employee_role || null,
    },
    env.JWT_SECRET,
    { expiresIn: "8h" }
  );

function splitNombreCompleto(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/);
  return {
    nombre: parts[0] || "",
    apellido: parts.length > 1 ? parts.slice(1).join(" ") : "",
  };
}

export const register = async (req, res) => {
  try {
    const { email, password, role = "empleado", name = "", employee_role = null } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "El correo ya está registrado" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      employee_role: role === "empleado" ? employee_role : null,
    });
    const token = signToken(newUser);
    return res.json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        employee_role: newUser.employee_role || null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Correo no registrado" });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(400).json({ error: "Contraseña inválida" });
    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        employee_role: user.employee_role || null,
      },
    });
  } catch (e) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};

export const recoverPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Correo no registrado" });
    const temp = crypto.randomBytes(6).toString("base64url");
    const hash = await bcrypt.hash(temp, 10);
    await User.update({ password: hash }, { where: { id: user.id } });
    const subject = "Tu nueva contraseña temporal";
    const html = recoverEmailHtml({
      name: user.name || "Usuario",
      tempPassword: temp,
      supportEmail: "pedidos@pizza.gt",
    });
    await sendMail(email.trim().toLowerCase(), subject, html);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Error al enviar correo" });
  }
};

export const loginWithGoogleCliente = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { idToken, direccion, telefono } = req.body;
    if (!idToken) return res.status(400).json({ error: "Falta idToken" });
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const fullName = payload?.name || "";
    if (!email) {
      await t.rollback();
      return res.status(400).json({ error: "No se pudo obtener el correo" });
    }
    let cliente = await Cliente.findOne({ where: { correo_electronico: email } });
    if (!cliente) {
      const parts = splitNombreCompleto(fullName);
      const randomPass = crypto.randomBytes(16).toString("hex");
      const hash = await bcrypt.hash(randomPass, 10);
      cliente = await Cliente.create(
        {
          nombre: parts.nombre,
          apellido: parts.apellido,
          correo_electronico: email,
          contrasena: hash,
        },
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
    }
    await t.commit();
    const token = jwt.sign(
      {
        id: cliente.id_cliente,
        role: "cliente",
        name: `${cliente.nombre} ${cliente.apellido}`.trim(),
        email: cliente.correo_electronico,
        employee_role: null,
      },
      env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return res.json({
      token,
      user: {
        name: `${cliente.nombre} ${cliente.apellido}`.trim(),
        role: "cliente",
        email: cliente.correo_electronico,
        employee_role: null,
      },
    });
  } catch (e) {
    await t.rollback();
    return res.status(500).json({ error: "No se pudo autenticar con Google" });
  }
};
