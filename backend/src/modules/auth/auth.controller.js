import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../../models/user.js";
import { sendMail } from "../../utils/mailer.js";

export const register = async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where:{ email }});
    if(exists) return res.status(400).json({ error:"Email ya existe" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });
    res.json({ id:user.id, name:user.name, email:user.email, role:user.role });
  }catch(e){ res.status(500).json({ error:e.message }); }
};

export const login = async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ where:{ email }});
    if(!user) return res.status(400).json({ error:"Credenciales" });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ error:"Credenciales" });
    const token = jwt.sign({ id:user.id, role:user.role, name:user.name }, process.env.JWT_SECRET, { expiresIn:"8h" });
    res.json({ token, user:{ id:user.id, name:user.name, role:user.role } });
  }catch(e){ res.status(500).json({ error:e.message }); }
};

export const recoverPassword = async (req,res)=>{
  try{
    const { email } = req.body;
    const user = await User.findOne({ where:{ email }});
    if(!user) return res.status(404).json({error:"Correo no registrado"});
    const temp = crypto.randomBytes(6).toString("base64url");
    const hash = await bcrypt.hash(temp, 10);
    await User.update({ password: hash }, { where:{ id:user.id }});
    await sendMail({
      to: email,
      subject: "Tu nueva contraseña - Pizzería",
      html: `<h2>Hola ${user.name || ""}</h2><p>Generamos una clave temporal:</p><p style="font-size:18px;font-weight:700;color:#d64545">${temp}</p><p>Inicia sesión y cámbiala en tu perfil.</p>`
    });
    res.json({ ok:true });
  }catch(e){
    console.error("RECOVER ERROR:", e);
    res.status(500).json({error:"Error al enviar correo"});
  }
};